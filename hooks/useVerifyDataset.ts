'use client';

import { useState } from 'react';
import { auth } from '@/lib/firebase/client';

export const useVerifyDataset = (
  datasetId: string,
  initialVerified: boolean
) => {
  const [isVerified, setIsVerified] = useState(initialVerified);
  const [loading, setLoading] = useState(false);

  const toggleVerify = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');
      const token = await user.getIdToken();

      const res = await fetch(`/api/datasets/${datasetId}/verify`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to toggle verify status');
      }

      const data = await res.json();
      setIsVerified(data.dataset.isVerified);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return {
    isVerified,
    toggleVerify,
    loading,
  };
};
