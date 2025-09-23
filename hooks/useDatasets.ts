"use client";

import useSWR from "swr";
import { auth } from "@/lib/firebase/client";

// Define dataset and tag types
export type Tag = {
  id: string;
  name: string;
};

export type Dataset = {
  id: string;
  title: string;
  description?: string;
  url: string;
  category?: string;
  size?: number;
  createdBy: string;
  createdAt: string;
  isVerified: boolean;
  tags: { tag: Tag }[];
  contributor: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    role: string;
    contributions: number;
    createdAt: string;
  };
  _count: {
    comments: number;
    likes: number;
  };
};

type DatasetResponse = {
  data: Dataset[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
};

// Query parameters type (unchanged)
export type DatasetQueryParams = {
  search?: string;
  category?: string;
  tag?: string;
  minSize?: number;
  maxSize?: number;
  orderByLikes?: boolean;
  orderByComments?: boolean;
  verified?: boolean;
  orderByDate?: boolean;
  page?: number;
  limit?: number;
};

// New union type for hook input: either string (id) or query params object
type UseDatasetsParams = string | DatasetQueryParams | undefined;

// Helper to build query string from params (unchanged)
const buildQueryString = (params: DatasetQueryParams): string => {
  const query = new URLSearchParams();

  if (params.search) query.append("search", params.search);
  if (params.category) query.append("category", params.category);
  if (params.tag) query.append("tag", params.tag);
  if (params.minSize !== undefined)
    query.append("minSize", params.minSize.toString());
  if (params.maxSize !== undefined)
    query.append("maxSize", params.maxSize.toString());
  if (params.orderByLikes) query.append("orderByLikes", "true");
  if (params.orderByComments) query.append("orderByComments", "true");
  if (params.verified) query.append("verified", "true");
  if (params.orderByDate) query.append("orderByDate", "true");
  if (params.page) query.append("page", params.page.toString());
  if (params.limit) query.append("limit", params.limit.toString());

  return query.toString();
};

// SWR fetcher (updated to handle both single and multiple datasets)
const fetcherWithAuth = async (
  url: string
): Promise<Dataset | DatasetResponse> => {
  const user = auth.currentUser;
  if (!user) throw new Error("No authenticated user");
  const token = await user.getIdToken();

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to fetch datasets");
  }

  return res.json();
};

// The hook
export const useDatasets = (params?: UseDatasetsParams) => {
  // Determine endpoint based on param type
  let endpoint: string | null = null;

  if (typeof params === "string") {
    // params is an ID string -> single dataset endpoint
    endpoint = auth.currentUser ? `/api/datasets/${params}` : null;
  } else if (typeof params === "object" && params !== undefined) {
    // params is query params object
    const queryString = buildQueryString(params);
    endpoint = auth.currentUser ? `/api/datasets?${queryString}` : null;
  } else {
    // No params, fetch list with no filters (optional)
    endpoint = auth.currentUser ? `/api/datasets` : null;
  }

  const { data, error, isLoading, mutate } = useSWR(endpoint, fetcherWithAuth);

  // If fetching single dataset (by id)
  if (typeof params === "string") {
    return {
      dataset: data || null,
      isLoading,
      isError: error,
      refresh: mutate,
    };
  }

  // Otherwise, fetching list
  if (data && "data" in data && "meta" in data) {
    return {
      datasets: data.data || [],
      meta: data.meta,
      isLoading,
      isError: error,
      refresh: mutate,
    };
  } else {
    // fallback for when data is a single Dataset or undefined
    return {
      datasets: [],
      meta: undefined,
      isLoading,
      isError: error,
      refresh: mutate,
    };
  }
};
