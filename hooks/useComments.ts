'use client';

import useSWR from 'swr';
import { auth } from '@/lib/firebase/client';

export type Comment = {
  id: string;
  text: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar: string | null;
  };
};

type CommentsResponse = {
  comments: Comment[];
  total: number;
  page: number;
  limit: number;
};

const fetcherWithAuth = async (url: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');
  const token = await user.getIdToken();

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to fetch comments');
  }

  return res.json();
};

export const useComments = (
  datasetId: string,
  page = 1,
  limit = 10
) => {
  const url = `/api/datasets/${datasetId}/comments?page=${page}&limit=${limit}`;

  const { data, error, isLoading, mutate } = useSWR<CommentsResponse>(
    datasetId ? url : null,
    fetcherWithAuth
  );

  const addComment = async (text: string) => {
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user');
    const token = await user.getIdToken();

    const res = await fetch(`/api/datasets/${datasetId}/comments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to add comment');
    }

    // Refresh comments after adding
    await mutate();
  };

  const deleteComment = async (commentId: string) => {
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user');
    const token = await user.getIdToken();

    const res = await fetch(`/api/datasets/${datasetId}/comments/${commentId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to delete comment');
    }

    await mutate();
  };

  return {
    comments: data?.comments || [],
    total: data?.total || 0,
    page: data?.page || 1,
    limit: data?.limit || 10,
    isLoading,
    isError: error,
    addComment,
    deleteComment,
    refresh: mutate,
  };
};
