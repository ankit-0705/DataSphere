import { useState } from "react";
import { auth } from "@/lib/firebase/client";

type DatasetCreateBody = {
  title: string;
  description?: string;
  url: string;
  category?: string;
  size?: number;
  tags?: string[];
};

export const useCreateDataset = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createDataset = async (data: DatasetCreateBody) => {
    setLoading(true);
    setError(null);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      const token = await user.getIdToken();

      const res = await fetch("/api/datasets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create dataset");
      }

      const result = await res.json();
      return result.data; // your newly created dataset
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
        throw e;
      } else {
        setError("An unknown error occurred");
        throw new Error("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return { createDataset, loading, error };
};
