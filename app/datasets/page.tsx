'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { StarrySkyBackground } from '@/components/StarrySkyBackground';
import FloatingDock from '@/components/ui/floating-dock';
import {
  IconLayoutDashboard,
  IconDatabase,
  IconUserCircle,
  IconInfoCircle,
  IconTrophy,
  IconMail,
  IconFilter,
  IconCheck,
} from '@tabler/icons-react';
import { useDatasets, Dataset } from '@/hooks/useDatasets';
import { PlaceholdersAndVanishInput } from '@/components/ui/placeholder-vanish';
import { useUser } from '@/context/UserContext';

const ITEMS_PER_PAGE = 9;

// Skeleton for dataset grid and header matching original grid layout
const DatasetsSkeleton = () => (
  <>
    {/* Header skeleton with col-span-12 */}
    <div className="col-span-12 relative flex items-center justify-between animate-pulse">
      <div className="flex items-end gap-2.5">
        <div className="w-9 h-9 bg-gray-800 rounded-md shadow-sm" />
        <div className="w-24 h-7 bg-gray-800 rounded-md" />
      </div>
      <div className="absolute left-1/2 transform -translate-x-1/2 w-40 h-9 bg-gray-800 rounded-md" />
      <div className="w-40 h-9 bg-gray-800 rounded-md" />
    </div>

    {/* Dataset grid skeleton - col-span-12 with internal grid */}
    <div className="col-span-12 flex flex-col gap-6 pb-24">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
          <div
            key={i}
            className="bg-white/5 border border-white/10 p-4 rounded-xl shadow-md animate-pulse flex flex-col gap-4"
          >
            <div className="h-6 w-2/3 bg-gray-800 rounded-md mb-2" />
            <div className="flex gap-3 h-4">
              <div className="w-10 h-4 bg-gray-700 rounded" />
              <div className="w-10 h-4 bg-gray-700 rounded" />
              <div className="w-16 h-4 bg-gray-700 rounded" />
            </div>
            <div className="h-12 bg-gray-800 rounded mb-2" />
            <div className="flex justify-between items-end mb-2">
              <div className="flex gap-2">
                <div className="w-11 h-5 bg-gray-700 rounded" />
                <div className="w-11 h-5 bg-gray-700 rounded" />
              </div>
              <div className="w-20 h-5 bg-gray-700 rounded" />
            </div>
            <div className="flex justify-between items-center">
              <div className="w-24 h-5 bg-gray-700 rounded" />
              <div className="w-20 h-7 bg-gray-700 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Pagination skeleton */}
      <div className="flex justify-center gap-4 mt-6 animate-pulse">
        <div className="w-24 h-10 bg-gray-800 rounded" />
        <div className="w-28 h-8 bg-gray-800 rounded" />
        <div className="w-24 h-10 bg-gray-800 rounded" />
      </div>
    </div>
  </>
);

const DatasetPage = () => {
  const { user, loading: userLoading } = useUser();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showFilter, setShowFilter] = useState(false);

  const [filters, setFilters] = useState({
    orderByLikes: false,
    orderByComments: false,
    verifiedOnly: false,
    orderByDate: false,
  });

  const {
    datasets,
    meta,
    isLoading,
    isError,
  } = useDatasets({
    search,
    page,
    limit: ITEMS_PER_PAGE,
    orderByLikes: filters.orderByLikes,
    orderByComments: filters.orderByComments,
    ...(filters.verifiedOnly && { verified: true }),
    ...(filters.orderByDate && { orderByDate: true }),
  });

  const totalPages = meta ? Math.ceil(meta.total / ITEMS_PER_PAGE) : 1;

  const links = [
    { title: 'Dashboard', icon: <IconLayoutDashboard />, href: '/dashboard' },
    { title: 'Datasets', icon: <IconDatabase />, href: '/datasets' },
    { title: 'Profile', icon: <IconUserCircle />, href: '/profile' },
    { title: 'Leaderboard', icon: <IconTrophy />, href: '/leaderboard' },
    { title: 'About Us', icon: <IconInfoCircle />, href: '/about' },
    { title: 'Contact', icon: <IconMail />, href: '/contact' },
  ];

  const placeholders = [
    "What's the first rule of Fight Club?",
    'Who is Tyler Durden?',
    'Where is Andrew Laeddis Hiding?',
    'Write a Javascript method to reverse a string',
    'How to assemble your own PC?',
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPage(1);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const activeFilters = Object.values(filters).some(Boolean);

  // Show skeleton if user or datasets loading, with grid container for skeleton
  if (userLoading || isLoading)
    return (
      <main className="relative min-h-screen bg-black text-white overflow-x-hidden">
        <StarrySkyBackground />
        <div className="relative mt-10 mx-auto w-[90vw] max-w-[1400px] rounded-2xl bg-transparent grid grid-cols-12 gap-8 mb-5">
          <DatasetsSkeleton />
        </div>
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20">
          <FloatingDock items={links} mobileClassName="translate-y-20" />
        </div>
      </main>
    );

  if (!user)
    return (
      <main className="relative min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-white text-lg font-semibold">User not found.</div>
      </main>
    );

  return (
    <main className="relative min-h-screen bg-black text-white overflow-x-hidden">
      <StarrySkyBackground />

      {/* Page Content */}
      <div className="relative mt-10 mx-auto w-[90vw] max-w-[1400px] rounded-2xl bg-transparent grid grid-cols-12 gap-8 mb-5">
        {/* Header */}
        <div className="col-span-12 relative flex items-center justify-between">
          <div className="text-xl flex items-end gap-2.5 font-medium">
            <Image
              src="/DataSphere.png"
              alt="DataSphere Logo"
              width={35}
              height={35}
              priority
              className="rounded-md shadow-sm drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
            />
            <h1 className="text-xl font-extrabold bg-gradient-to-r from-gray-200 via-gray-400 to-white bg-clip-text text-transparent tracking-wide drop-shadow-md">
              DataSphere
            </h1>
          </div>

          <div className="absolute left-1/2 transform -translate-x-1/2">
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-gray-200 via-gray-400 to-white bg-clip-text text-transparent tracking-wide drop-shadow-md">
              Datasets
            </h1>
          </div>

          {/* Search and Filter */}
          <div className="flex items-center gap-2 relative">
            <PlaceholdersAndVanishInput
              placeholders={placeholders}
              value={search}
              setValue={setSearch}
              onChange={handleChange}
              onSubmit={handleSubmit}
            />
            <button
              aria-label="Filter datasets"
              className={`p-2 rounded transition cursor-pointer ${
                activeFilters ? 'bg-blue-500 hover:bg-blue-600' : 'bg-white/10 hover:bg-white/20'
              }`}
              onClick={() => setShowFilter(!showFilter)}
            >
              <IconFilter className="w-5 h-5 text-white" />
            </button>

            {/* Filter Dropdown */}
            {showFilter && (
              <div className="absolute top-[110%] right-0 z-30 bg-white/5 backdrop-blur-xl border border-white/20 rounded-md p-4 shadow-lg w-64">
                <div className="text-sm font-semibold mb-2 text-white/80">Filter & Sort</div>

                {[
                  { label: 'Sort by Likes', key: 'orderByLikes' },
                  { label: 'Sort by Comments', key: 'orderByComments' },
                  { label: 'Verified Only', key: 'verifiedOnly' },
                  { label: 'Sort by Newest', key: 'orderByDate' },
                ].map(({ label, key }) => (
                  <label
                    key={key}
                    className="flex items-center gap-2 text-sm text-white mb-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={filters[key as keyof typeof filters]}
                      onChange={() =>
                        setFilters((prev) => ({
                          ...prev,
                          [key]: !prev[key as keyof typeof filters],
                        }))
                      }
                    />
                    {label}
                  </label>
                ))}

                <div className="flex justify-between pt-2">
                  <button
                    onClick={() =>
                      setFilters({
                        orderByLikes: false,
                        orderByComments: false,
                        verifiedOnly: false,
                        orderByDate: false,
                      })
                    }
                    className="text-xs text-white/70 hover:text-white"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => {
                      setPage(1);
                      setShowFilter(false);
                    }}
                    className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded text-white"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dataset Grid */}
        <div className="col-span-12 flex flex-col gap-6 pb-24">
          {isError && <div className="text-red-400">Error loading datasets.</div>}
          {!isLoading && datasets.length === 0 && (
            <div className="text-gray-400">No datasets found.</div>
          )}
          {!isLoading && datasets.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {datasets.map((dataset: Dataset) => (
                  <div
                    key={dataset.id}
                    className="bg-white/5 border cursor-pointer border-white/10 p-4 rounded-xl shadow-md hover:shadow-white/20 transition flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold">{dataset.title}</h3>
                      <div className="flex items-center gap-3 text-sm text-gray-400">
                        <div className="flex items-center gap-1">❤️ {dataset._count?.likes || 0}</div>
                        <div className="flex items-center gap-1">💬 {dataset._count?.comments || 0}</div>
                        <div
                          className={`flex items-center gap-1 ${
                            dataset.isVerified ? 'text-white' : 'text-white/10'
                          }`}
                        >
                          <IconCheck className="w-4 h-4" />
                          <span>{dataset.isVerified ? 'Verified' : 'Not Verified'}</span>
                        </div>
                      </div>
                    </div>

                    <p className="line-clamp-3 mb-2 text-sm text-gray-400">
                      {dataset.description || 'No description available.'}
                    </p>

                    <div className="flex justify-between items-end mb-2 text-sm text-gray-300">
                      <div className="flex gap-2 flex-wrap">
                        {dataset.tags?.length > 0 ? (
                          dataset.tags.map(({ tag }: { tag: { id: string; name: string } }, index: number) => (
                            <span
                              key={index}
                              className="bg-white/10 backdrop-blur-md px-2 py-0.5 rounded"
                            >
                              {tag.name}
                            </span>
                          ))
                        ) : (
                          <span>No tags</span>
                        )}
                      </div>
                      <span>{new Date(dataset.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="flex justify-between">
                      <div className="text-sm italic text-white">
                        Contributor: {dataset.contributor?.name || 'Unknown'}
                      </div>
                      <Link href={`/datasets/${dataset.id}`}>
                        <button className="text-sm cursor-pointer px-2 py-1 bg-white/10 rounded hover:bg-white/20 transition">
                          View More...
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex justify-center gap-4 mt-6">
                <button
                  onClick={handlePrevPage}
                  disabled={page === 1}
                  className={`px-4 py-2 cursor-pointer rounded bg-white/10 hover:bg-white/20 transition ${
                    page === 1 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Previous
                </button>

                <span className="self-center text-sm">
                  Page {page} of {totalPages}
                </span>

                <button
                  onClick={handleNextPage}
                  disabled={page >= totalPages}
                  className={`px-4 py-2 cursor-pointer rounded bg-white/10 hover:bg-white/20 transition ${
                    page >= totalPages ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Floating Dock */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20">
        <FloatingDock items={links} mobileClassName="translate-y-20" />
      </div>
    </main>
  );
};

export default DatasetPage;
