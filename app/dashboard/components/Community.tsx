'use client';

import React from 'react';
import { useDatasets, Dataset, Tag } from '@/hooks/useDatasets';
import { useLeaderboard, LeaderboardUser } from '@/hooks/useLeaderboard';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/client';

const CommunityPulse = () => {
  const router = useRouter();

  // Fetch top 3 datasets ordered by likes
  const {
    datasets: mostLikedDatasets,
    isLoading: loadingLikes,
    isError: errorLikes,
  } = useDatasets({ orderByLikes: true, limit: 3, page: 1 });

  // Fetch top contributors
  const {
    topUsers,
    isLoading: loadingContributors,
    isError: errorContributors,
  } = useLeaderboard(!!auth.currentUser);

  // Extract unique tags from most liked datasets
  const uniqueTags = React.useMemo(() => {
    if (!mostLikedDatasets) return [];
    const tagsSet = new Set<string>();
    mostLikedDatasets.forEach((dataset: Dataset) => {
      dataset.tags.forEach(({ tag }: { tag: Tag }) => {
        tagsSet.add(tag.name);
      });
    });
    return Array.from(tagsSet);
  }, [mostLikedDatasets]);

  const isLoading = loadingLikes || loadingContributors;
  const isError = errorLikes || errorContributors;

  if (isLoading) {
    return <div className="text-white text-center py-6">Loading community pulse...</div>;
  }

  if (isError) {
    return <div className="text-red-500 text-center py-6">Failed to load community pulse data.</div>;
  }

  return (
    <div className="flex flex-col rounded-xl border border-neutral-700 bg-white/5 p-6 w-full max-w-md mx-auto sm:mx-0">
      <h3 className="mb-4 text-lg font-semibold text-white text-center sm:text-left">Community Pulse</h3>

      {/* Tags from most liked datasets */}
      <div className="mb-6">
        <h4 className="mb-2 text-sm font-semibold text-neutral-400">
          Tags from most liked datasets
        </h4>
        <div className="flex flex-wrap gap-2">
          {uniqueTags.length === 0 ? (
            <span className="text-white text-sm">No tags available</span>
          ) : (
            uniqueTags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white whitespace-nowrap"
              >
                {tag}
              </span>
            ))
          )}
        </div>
      </div>

      {/* Most liked datasets */}
      <div className="mb-6">
        <h4 className="mb-2 text-sm font-semibold text-neutral-400">Most liked datasets</h4>
        <ul>
          {mostLikedDatasets.map((dataset: Dataset) => (
            <li
              key={dataset.id}
              className="flex justify-between text-sm text-white py-1 border-b border-neutral-700 last:border-none truncate"
              title={dataset.title}
            >
              <span className="truncate max-w-[70%]">{dataset.title}</span>
              <span className="ml-2 flex-shrink-0 text-white">{dataset._count.likes}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Top contributors */}
      <div className="mb-6">
        <h4 className="mb-2 text-sm font-semibold text-neutral-400">Top Contributors</h4>
        <ul>
          {topUsers.slice(0, 3).map((contributor: LeaderboardUser) => (
            <li
              key={contributor.id}
              className="flex justify-between py-2 border-b border-neutral-700 last:border-none text-sm text-white truncate"
              title={contributor.name}
            >
              <span className="truncate max-w-[70%]">{contributor.name}</span>
              <span className="ml-2 flex-shrink-0 text-white">{contributor.contributions}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={() => router.push('/leaderboard')}
        className="mt-auto rounded-md px-4 py-2 font-medium cursor-pointer border border-white/30 text-white text-sm w-full sm:w-auto text-center 
                   hover:bg-white/20 hover:shadow-[0_0_10px_rgba(255,255,255,0.3)] transition"
      >
        View More...
      </button>
    </div>
  );
};

export default CommunityPulse;
