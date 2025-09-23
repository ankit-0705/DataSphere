'use client';

import React from 'react';
import Image from 'next/image';
import { useUser } from '@/context/UserContext';

export default function UserProfileCard() {
  const { user, leaderboard, loading } = useUser();

  if (loading) return <div>Loading profile...</div>;
  if (!user) return <div>User not found.</div>;

  const lastContribution = user.datasets.length > 0
    ? user.datasets.reduce((latest, current) =>
        new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest
      )
    : null;

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-GB');

  return (
    <div className="w-full max-w-sm bg-white/5
        backdrop-blur-md
        border border-white/20
        rounded-2xl
        shadow-sm shadow-white/10
        z-30
        text-gray-200 p-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-white/10 flex items-center justify-center">
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt={user.name}
              width={64}
              height={64}
              className="object-cover w-full h-full"
            />
          ) : (
            <span className="text-2xl font-semibold text-white">
              {user.name[0].toUpperCase()}
            </span>
          )}
        </div>
        <div>
          <h2 className="text-lg font-semibold tracking-wide">{user.name}</h2>
          <p className="text-sm text-gray-400 capitalize">{user.role.toLowerCase()}</p>
        </div>
      </div>

      {leaderboard?.tier && (
        <div className="mt-4 text-sm text-white font-medium">
          {leaderboard.tier} <span className="text-gray-400">(Rank: {leaderboard.rank})</span>
        </div>
      )}

      <div className="mt-6">
        <h3 className="text-sm text-gray-500 mb-1">Last Contribution</h3>
        {lastContribution ? (
          <div className="flex justify-between text-sm text-gray-300">
            <span className="truncate max-w-[60%]">
              {lastContribution.title}
            </span>
            <span className="text-gray-500">
              {formatDate(lastContribution.createdAt)}
            </span>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No contributions yet</p>
        )}
      </div>
    </div>
  );
}
