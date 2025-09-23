'use client';

import { useState } from 'react';
import { auth } from '@/lib/firebase/client';

export const useDeleteDataset = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [success, setSuccess] = useState(false);

  const deleteDataset = async (id: string) => {
    setIsDeleting(true);
    setError(null);
    setSuccess(false);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');

      const token = await user.getIdToken();

      const res = await fetch(`/api/datasets/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete dataset');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteDataset,
    isDeleting,
    error,
    success,
  };
};
