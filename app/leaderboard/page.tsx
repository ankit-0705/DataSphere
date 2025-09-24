'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { auth } from '@/lib/firebase/client';
import { useLeaderboard, LeaderboardUser, LeaderboardDataset } from '@/hooks/useLeaderboard';
import { StarrySkyBackground } from '@/components/StarrySkyBackground';
import FloatingDock from '@/components/ui/floating-dock';
import {
  IconLayoutDashboard,
  IconDatabase,
  IconUserCircle,
  IconInfoCircle,
  IconTrophy,
  IconMail,
} from '@tabler/icons-react';

const ITEMS_PER_PAGE = 10;

const LeaderboardPage = () => {
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [viewMode, setViewMode] = useState<'users' | 'datasets'>('users');
  const [page, setPage] = useState(1); // start from 1 to match backend pagination

  const links = [
    { title: 'Dashboard', icon: <IconLayoutDashboard />, href: '/dashboard' },
    { title: 'Datasets', icon: <IconDatabase />, href: '/datasets' },
    { title: 'Profile', icon: <IconUserCircle />, href: '/profile' },
    { title: 'Leaderboard', icon: <IconTrophy />, href: '/leaderboard' },
    { title: 'About Us', icon: <IconInfoCircle />, href: '/about' },
    { title: 'Contact', icon: <IconMail />, href: '/contact' },
  ];

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(() => {
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  const { topUsers, topDatasets, isLoading, isError, refresh, meta } = useLeaderboard(
    isAuthReady,
    page,
    ITEMS_PER_PAGE
  );

  if (!isAuthReady)
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="w-48 h-6 rounded-md bg-gray-700 animate-pulse" />
      </div>
    );

  if (isLoading)
    return (
      <div className="relative min-h-screen bg-black text-white overflow-x-hidden flex flex-col">
        <StarrySkyBackground />

        <div className="relative z-10 left-1/2 w-[90vw] max-w-6xl rounded-2xl bg-transparent p-8 flex flex-col items-center -translate-x-1/2 pb-28">
          <div className="w-48 h-12 rounded-md mb-7 bg-gray-700 animate-pulse" />

          {/* Skeleton Toggle Buttons */}
          <div className="flex gap-4 mb-12 w-full max-w-xs justify-center">
            <div className="flex-1 h-10 rounded-lg bg-gray-700 animate-pulse" />
            <div className="flex-1 h-10 rounded-lg bg-gray-700 animate-pulse" />
          </div>

          {/* Skeleton Podium */}
          <div className="flex items-end justify-center gap-8 mb-10 w-full max-w-3xl">
            {[24, 20, 16].map((h, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-40 h-6 rounded bg-gray-700 animate-pulse mb-2" />
                <div className="w-28 h-4 rounded bg-gray-600 animate-pulse" />
                <div
                  className={`mt-3 w-20 rounded-t-lg bg-gray-700 flex items-center justify-center text-white font-semibold`}
                  style={{ height: `${h}px` }}
                >
                  &nbsp;
                </div>
              </div>
            ))}
          </div>

          {/* Skeleton Table */}
          <div className="w-full max-w-4xl overflow-x-auto rounded-xl border border-white/10 shadow-lg backdrop-blur-md bg-white/5">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-800/10 text-gray-200/80 text-sm uppercase tracking-wide">
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">
                    {viewMode === 'users' ? 'User' : 'Dataset'}
                  </th>
                  <th className="px-4 py-3">
                    {viewMode === 'users' ? 'Contributions' : 'Likes'}
                  </th>
                  {viewMode === 'datasets' && <th className="px-4 py-3">Contributor</th>}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: ITEMS_PER_PAGE - (page === 1 ? 3 : 0) }).map((_, idx) => (
                  <tr
                    key={idx}
                    className="odd:bg-gray-600/10 even:bg-gray-800/10"
                  >
                    <td className="px-4 py-3">
                      <div className="h-4 w-6 rounded bg-gray-700 animate-pulse" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-48 rounded bg-gray-700 animate-pulse" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-10 rounded bg-gray-700 animate-pulse" />
                    </td>
                    {viewMode === 'datasets' && (
                      <td className="px-4 py-3">
                        <div className="h-4 w-32 rounded bg-gray-700 animate-pulse" />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Skeleton Pagination */}
          <div className="mt-4 flex justify-center items-center gap-4">
            <div className="px-4 py-2 bg-gray-700 rounded w-20 h-8 animate-pulse" />
            <div className="text-gray-400 text-sm w-24 h-6 bg-gray-700 rounded animate-pulse" />
            <div className="px-4 py-2 bg-gray-700 rounded w-20 h-8 animate-pulse" />
          </div>
        </div>

        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20">
          <FloatingDock items={links} mobileClassName="translate-y-20" />
        </div>
      </div>
    );

  if (isError)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white gap-4 p-4 text-center max-w-lg mx-auto">
        <p className="text-red-500 font-semibold">Failed to load leaderboard.</p>
        <button
          onClick={() => refresh()}
          className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 transition"
        >
          Retry
        </button>
      </div>
    );

  const currentData: (LeaderboardUser | LeaderboardDataset)[] =
    viewMode === 'users' ? topUsers : topDatasets;

  const totalItems = viewMode === 'users' ? meta.totalUsers : meta.totalDatasets;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const top3 = page === 1 ? currentData.slice(0, 3) : [];
  const tableData = page === 1 ? currentData.slice(3) : currentData;

  return (
    <div className="relative min-h-screen bg-black text-white overflow-x-hidden flex flex-col">
      {/* Starry Background */}
      <StarrySkyBackground />

      {/* Main leaderboard content */}
      <div className="relative z-10 left-1/2 w-[90vw] max-w-6xl rounded-2xl bg-transparent p-8 flex flex-col items-center -translate-x-1/2 pb-28">
        <h1 className="text-4xl font-extrabold mb-7 bg-gradient-to-r from-gray-200 via-gray-400 to-white bg-clip-text text-transparent tracking-wide drop-shadow-md">
          Leaderboard
        </h1>

        {/* Toggle buttons */}
        <div className="flex gap-4 mb-12">
          <button
            className={`px-5 py-2 rounded-lg font-semibold transition backdrop-blur-md border border-white/10 shadow-md cursor-pointer ${
              viewMode === 'users'
                ? 'bg-gradient-to-r from-gray-600 to-gray-800 text-white shadow-lg'
                : 'bg-white/5 hover:bg-white/10 text-gray-300'
            }`}
            onClick={() => {
              setViewMode('users');
              setPage(1);
            }}
          >
            Top Contributors
          </button>
          <button
            className={`px-5 py-2 rounded-lg font-semibold transition backdrop-blur-md border border-white/10 shadow-md cursor-pointer ${
              viewMode === 'datasets'
                ? 'bg-gradient-to-r from-gray-600 to-gray-800 text-white shadow-lg'
                : 'bg-white/5 hover:bg-white/10 text-gray-300'
            }`}
            onClick={() => {
              setViewMode('datasets');
              setPage(1);
            }}
          >
            Top Datasets
          </button>
        </div>

        {/* Podium Section - only on page 1 */}
        {top3.length > 0 ? (
          <div className="flex items-end justify-center gap-8 mb-1 w-full max-w-3xl">
            {[1, 0, 2].map((i) => {
              const item = top3[i];
              if (!item) return null;

              const podiumHeight = i === 0 ? 'h-24' : i === 1 ? 'h-20' : 'h-16';

              return (
                <div key={i} className="flex flex-col items-center">
                  <div
                    className="text-lg font-medium text-gray-200 text-center mt-12 w-40 truncate"
                    title={
                      viewMode === 'users'
                        ? (item as LeaderboardUser).name
                        : (item as LeaderboardDataset).title
                    }
                  >
                    {viewMode === 'users'
                      ? (item as LeaderboardUser).name
                      : (item as LeaderboardDataset).title}
                  </div>

                  <div className="text-sm text-gray-300 mt-1">
                    {viewMode === 'users'
                      ? `${(item as LeaderboardUser).contributions} Contributions`
                      : `${(item as LeaderboardDataset)._count.likes} Likes`}
                  </div>

                  <div
                    className={`mt-3 w-20 rounded-t-lg bg-gradient-to-t from-gray-800 to-gray-600 flex items-center justify-center text-white font-semibold ${podiumHeight}`}
                  >
                    {i === 0 ? '1st' : i === 1 ? '2nd' : '3rd'}
                  </div>
                </div>
              );
            })}
          </div>
        ) : page === 1 ? (
          <p className="text-gray-400 mb-8">No data found.</p>
        ) : null}

        {/* Table Section */}
        {tableData.length > 0 ? (
          <div className="w-full max-w-4xl overflow-x-auto rounded-xl border border-white/10 shadow-lg backdrop-blur-md bg-white/5 cursor-pointer">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-800/10 text-gray-200/80 text-sm uppercase tracking-wide">
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">{viewMode === 'users' ? 'User' : 'Dataset'}</th>
                  <th className="px-4 py-3">
                    {viewMode === 'users' ? 'Contributions' : 'Likes'}
                  </th>
                  {viewMode === 'datasets' && <th className="px-4 py-3">Contributor</th>}
                </tr>
              </thead>
              <tbody>
                {tableData.map((item, idx) => (
                  <tr
                    key={item.id}
                    className="odd:bg-gray-600/10 even:bg-gray-800/10 hover:bg-gradient-to-r hover:from-gray-700/40 hover:to-gray-800/40 transition-all duration-200"
                  >
                    <td className="px-4 py-3">
                      {(page - 1) * ITEMS_PER_PAGE + idx + (page === 1 ? 4 : 1)}
                    </td>
                    <td className="px-4 py-3">
                      {viewMode === 'users' ? (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center text-sm">
                            {(item as LeaderboardUser).avatar ? (
                              <Image
                                src={(item as LeaderboardUser).avatar!}
                                alt={(item as LeaderboardUser).name}
                                width={32}
                                height={32}
                              />
                            ) : (
                              <span>{(item as LeaderboardUser).name.charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          {(item as LeaderboardUser).name}
                        </div>
                      ) : (
                        <a
                          href={(item as LeaderboardDataset).url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-200 hover:text-white underline transition"
                        >
                          {(item as LeaderboardDataset).title}
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {viewMode === 'users'
                        ? (item as LeaderboardUser).contributions
                        : (item as LeaderboardDataset)._count.likes}
                    </td>
                    {viewMode === 'datasets' && (
                      <td className="px-4 py-3">{(item as LeaderboardDataset).contributor.name}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          page !== 1 && <p className="text-gray-400 mb-8">No data found on this page.</p>
        )}

        {/* Pagination Controls */}
        <div className="mt-4 flex justify-center items-center gap-4">
          <button
            className="px-4 py-2 bg-gray-700/50 rounded hover:bg-gray-700/70 transition disabled:opacity-40 cursor-pointer"
            disabled={page <= 1}
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          >
            Previous
          </button>
          <span className="text-gray-400 text-sm">
            Page {page} of {totalPages}
          </span>
          <button
            className="px-4 py-2 bg-gray-700/50 rounded hover:bg-gray-700/70 transition disabled:opacity-40 cursor-pointer"
            disabled={page >= totalPages}
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          >
            Next
          </button>
        </div>
      </div>

      {/* 🧭 Floating Dock */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20">
        <FloatingDock items={links} mobileClassName="translate-y-20" />
      </div>
    </div>
  );
};

export default LeaderboardPage;
