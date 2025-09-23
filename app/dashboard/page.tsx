"use client";

import React, { useState } from "react";
import Image from "next/image";
import { StarrySkyBackground } from "@/components/StarrySkyBackground";
import FloatingDock from "@/components/ui/floating-dock";
import {
  IconLayoutDashboard,
  IconDatabase,
  IconUserCircle,
  IconInfoCircle,
  IconTrophy,
  IconMail,
  IconBell,
} from "@tabler/icons-react";
import UserProfileCard from "./components/Info";
import CommunityPulse from "./components/Community";
import ContributionTable from "./components/Table";
import DatasetActivityComparisonLineChart from "./components/Graph";
import { useUser } from "@/context/UserContext";
import { useNotifications } from "@/context/NotificationContext";
import { useDatasets } from "@/hooks/useDatasets";
import { useDatasetStats } from "@/hooks/useDatasetStats";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// Skeleton component mimics Dashboard layout
const DashboardSkeleton = () => (
  <div className="relative min-h-screen bg-black text-white overflow-x-hidden">
    <StarrySkyBackground />
    <main className="relative mt-2 z-10 mx-auto w-[90vw] max-w-screen-xl rounded-2xl bg-transparent p-8 grid grid-cols-12 gap-8 pb-28">
      <div className="col-span-12 flex items-center justify-between animate-pulse">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gray-800 rounded-md shadow-sm" />
          <div className="w-24 h-7 bg-gray-800 rounded-md" />
        </div>
        <div className="absolute left-1/2 transform -translate-x-1/2 w-40 h-9 bg-gray-800 rounded-md" />
        <div className="w-10 h-10 bg-gray-800 rounded-full" />
      </div>
      <div className="col-span-9 flex flex-col gap-8">
        <div className="w-48 h-9 bg-gray-800 rounded-md" />
        <div className="w-full h-64 bg-gray-800 rounded-lg" />
        <div className="w-full h-40 bg-gray-800 rounded-lg" />
      </div>
      <div className="col-span-3 flex flex-col gap-8">
        <div className="w-full h-48 bg-gray-800 rounded-lg" />
        <div className="w-full h-32 bg-gray-800 rounded-lg" />
      </div>
    </main>
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20">
      <div className="flex gap-6 bg-gray-800/70 rounded-full p-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="w-10 h-10 bg-gray-700 rounded-full" />
        ))}
      </div>
    </div>
  </div>
);

const DashboardPage = () => {
  const { user, loading } = useUser();
  const {
    notifications,
    unreadCount,
    loading: notificationLoading,
    markAllAsRead,
  } = useNotifications();
  const { stats, isLoading: statsLoading } = useDatasetStats();
  const {
    datasets = [],
    isLoading: datasetsLoading,
    isError: datasetsError,
  } = useDatasets({ limit: 7 });

  const [isNotifModalOpen, setNotifModalOpen] = useState(false);

  const mergedChartData = MONTHS.map((month, index) => {
    const paddedMonth = `${new Date().getFullYear()}-${String(
      index + 1
    ).padStart(2, "0")}`;
    const matchedMonth = stats?.find((item) => item.month === paddedMonth);
    return {
      month,
      datasets: matchedMonth?.datasets || 0,
      likes: matchedMonth?.likes || 0,
      comments: matchedMonth?.comments || 0,
    };
  });

  const links = [
    { title: "Dashboard", icon: <IconLayoutDashboard />, href: "/dashboard" },
    { title: "Datasets", icon: <IconDatabase />, href: "/datasets" },
    { title: "Profile", icon: <IconUserCircle />, href: "/profile" },
    { title: "Leaderboard", icon: <IconTrophy />, href: "/leaderboard" },
    { title: "About Us", icon: <IconInfoCircle />, href: "/about" },
    { title: "Contact", icon: <IconMail />, href: "/contact" },
  ];

  // Show skeleton while loading user info
  if (loading) return <DashboardSkeleton />;
  if (!user)
    return (
      <div className="relative min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-white text-lg font-semibold">User not found.</div>
      </div>
    );

  return (
    <div className="relative min-h-screen bg-black text-white overflow-x-hidden">
      <StarrySkyBackground />

      {/* 🌌 Main Glass Container */}
      <main className="relative mt-2 z-10 mx-auto w-[90vw] max-w-screen-xl rounded-2xl bg-transparent p-8 grid grid-cols-12 gap-8 pb-28">
        {/* 🔔 Bell - Top Right of Container */}
        <div className="col-span-12 relative flex items-center justify-between">
          {/* 🔵 Logo */}
          <div className="text-2xl font-medium flex items-end gap-2.5 cursor-pointer">
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
          {/* 📍 Current Page Title - centered absolutely */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-gray-200 via-gray-400 to-white bg-clip-text text-transparent tracking-wide drop-shadow-md">
              Dashboard
            </h1>
          </div>
          {/* 🔔 Notification Bell */}
          <div
            className="relative cursor-pointer hover:bg-white/10 rounded-full h-auto w-auto p-2"
            onClick={() => setNotifModalOpen(true)}
          >
            <IconBell className="h-6 w-6 text-white" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
        </div>
        {/* 📊 Left Section */}
        <div className="col-span-9 flex flex-col gap-8">
          <div className="text-xl font-bold">Welcome back, {user.name}</div>
          {statsLoading ? (
            <div className="w-full h-64 bg-gray-800 rounded-lg animate-pulse" />
          ) : (
            stats && (
              <DatasetActivityComparisonLineChart data={mergedChartData} />
            )
          )}

          <div>
            {datasetsLoading && (
              <div className="w-full h-40 bg-gray-800 rounded-lg animate-pulse" />
            )}
            {datasetsError && <div>Error loading contributions.</div>}
            {!datasetsLoading && !datasetsError && (
              <ContributionTable datasets={datasets} />
            )}
          </div>
        </div>
        {/* 📚 Sidebar */}
        <div className="col-span-3 flex flex-col gap-8">
          {loading ? (
            <>
              <div className="w-full h-48 bg-gray-800 rounded-lg animate-pulse" />
              <div className="w-full h-32 bg-gray-800 rounded-lg animate-pulse" />
            </>
          ) : (
            <>
              <UserProfileCard />
              <CommunityPulse />
            </>
          )}
        </div>
      </main>
      {/* 🧭 Floating Dock */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20">
        <FloatingDock items={links} mobileClassName="translate-y-20" />
      </div>
      {/* 🔔 Notifications Modal */}
      {isNotifModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="relative w-full max-w-lg rounded-2xl border border-white/20 bg-white/10 text-white p-6 backdrop-blur-md shadow-lg shadow-white/10 overflow-y-auto max-h-[80vh]">
            {/* ❌ Close Button */}
            <button
              className="absolute top-3 right-4 text-white/80 hover:text-white text-2xl leading-none cursor-pointer"
              onClick={() => {
                setNotifModalOpen(false);
                markAllAsRead();
              }}
            >
              &times;
            </button>
            {/* 🧾 Title */}
            <h2 className="text-xl font-bold mb-4 tracking-wide text-white">
              Notifications
            </h2>
            {notificationLoading ? (
              <div className="text-sm text-gray-300">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-sm text-gray-400">
                No notifications found.
              </div>
            ) : (
              <ul className="space-y-3">
                {notifications.map((notif) => (
                  <li
                    key={notif.id}
                    className={`rounded-lg p-4 transition-all duration-200 ${
                      notif.isRead
                        ? "bg-white/5 border border-white/10"
                        : "bg-blue-400/10 border border-blue-500/20"
                    }`}
                  >
                    <div className="font-semibold text-sm mb-1">
                      {notif.type === "like"
                        ? "New Like"
                        : notif.type === "comment"
                        ? "New Comment"
                        : notif.type}
                    </div>
                    <p className="text-sm text-gray-300">{notif.content}</p>
                    <span className="text-xs text-gray-500">
                      {new Date(notif.createdAt).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
