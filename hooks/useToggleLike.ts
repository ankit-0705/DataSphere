'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase/client';

export const useToggleLike = (datasetId?: string, initialCount?: number) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState<number>(initialCount ?? 0);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // Track last datasetId to avoid re-initializing unnecessarily
  useEffect(() => {
    if (!datasetId) return;

    const fetchInitialLikeStatus = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const token = await user.getIdToken();

        const res = await fetch(`/api/datasets/${datasetId}/likes/status`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setLiked(data.liked);
        } else {
          console.error('Failed to fetch like status');
        }

        // Set count only when dataset is known
        setLikesCount(initialCount ?? 0);
      } catch (err) {
        console.error('Error checking like status:', err);
      } finally {
        setInitializing(false);
      }
    };

    fetchInitialLikeStatus();
  }, [datasetId, initialCount]);

  const toggleLike = async () => {
    if (!datasetId) return;
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');
      const token = await user.getIdToken();

      const res = await fetch(`/api/datasets/${datasetId}/likes`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to toggle like');
      }

      const data = await res.json();

      setLiked(data.liked);
      setLikesCount(data.likeCount); // ✅ use backend response directly
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return {
    liked,
    likesCount,
    toggleLike,
    loading,
    initializing,
  };
};
