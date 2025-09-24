'use client';

import React, { useState } from "react";
import Image from "next/image";
import { useUser } from "@/context/UserContext";
import { useLogout } from "@/hooks/useLogout";
import { useDeleteAccount } from "@/hooks/useDeleteAccount";
import { useCreateDataset } from "@/hooks/useCreateDatasets";
import { useFetchUsers } from "@/hooks/useFetchUsers";
import { useUpdateUserRole } from "@/hooks/useUpdateUserRole";
import { StarrySkyBackground } from "@/components/StarrySkyBackground";
import FloatingDock from "@/components/ui/floating-dock";
import {
  IconLayoutDashboard,
  IconDatabase,
  IconUserCircle,
  IconInfoCircle,
  IconTrophy,
  IconMail,
  IconLogout,
  IconTrash,
  IconUsers,
  IconCheck,
  IconLoader,
} from "@tabler/icons-react";
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Line,
} from "recharts";

type MessageModalProps = {
  open: boolean;
  message: string;
  isError?: boolean;
};

const MessageModal: React.FC<MessageModalProps> = ({
  open,
  message,
  isError = false,
}) =>
  !open ? null : (
    <div
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl shadow-lg z-50 text-md font-medium max-w-[90vw] text-center ${
        isError ? "bg-red-700/80 text-white" : "bg-green-700/80 text-white"
      }`}
      role="alert"
      aria-live="assertive"
    >
      {message}
    </div>
  );

type ConfirmDeleteAccountModalProps = {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
};

const ConfirmDeleteAccountModal: React.FC<ConfirmDeleteAccountModalProps> = ({
  open,
  onConfirm,
  onCancel,
  loading,
}) =>
  !open ? null : (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div
        className="p-6 w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-md shadow-white/10 text-gray-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-delete-account-title"
      >
        <h2
          id="confirm-delete-account-title"
          className="text-xl font-semibold text-white mb-2"
        >
          Delete Account
        </h2>
        <p className="text-gray-300 mb-6">
          Are you sure you want to delete your account? This action cannot be
          undone.
        </p>
        <div className="flex flex-col sm:flex-row justify-end gap-2">
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500/50 hover:bg-red-500/40 text-red-300 cursor-pointer rounded-md transition disabled:opacity-50 w-full sm:w-auto"
          >
            {loading ? (
              <>
                <IconLoader className="animate-spin" size={20} /> Deleting...
              </>
            ) : (
              <>
                <IconTrash size={20} /> Delete
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="bg-white/20 hover:bg-white/10 text-white px-4 py-2 rounded cursor-pointer w-full sm:w-auto"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

type UploadData = {
  title: string;
  description: string;
  url: string;
  category: string;
  size?: number;
  tags: string;
};

type Dataset = {
  id: string;
  title: string;
  createdAt: string;
};

const SkeletonProfile = () => (
  <div className="animate-pulse flex flex-col items-center gap-4 rounded-2xl border border-white/20 bg-black/80 backdrop-blur-2xl p-6 shadow-2xl w-full max-w-md">
    <div className="w-28 h-28 rounded-full bg-gray-700" />
    <div className="h-6 w-40 bg-gray-700 rounded" />
    <div className="h-4 w-60 bg-gray-600 rounded" />
    <div className="w-full flex justify-between gap-6 mt-6">
      <div className="space-y-2 flex-1">
        <div className="h-4 bg-gray-700 rounded w-24" />
        <div className="h-4 bg-gray-700 rounded w-20" />
        <div className="h-4 bg-gray-700 rounded w-24" />
      </div>
      <div className="space-y-2 flex-1">
        <div className="h-4 bg-gray-700 rounded w-24" />
        <div className="h-4 bg-gray-700 rounded w-20" />
      </div>
    </div>
    <div className="flex gap-4 w-full mt-6">
      <div className="flex-1 h-10 bg-gray-700 rounded" />
      <div className="flex-1 h-10 bg-gray-700 rounded" />
    </div>
  </div>
);

const SkeletonUsersTable = () => (
  <table className="w-full text-left mb-3 text-sm min-w-[500px] border-collapse border border-white/10 rounded-lg overflow-hidden">
    <thead>
      <tr>
        {["Name", "Email", "Role", "Actions"].map((header) => (
          <th
            key={header}
            className="px-2 py-1 bg-gray-800 text-gray-400 border-b border-white/10"
          >
            {header}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {Array.from({ length: 8 }).map((_, idx) => (
        <tr key={idx} className="border-t border-white/10">
          {[...Array(4)].map((__, i) => (
            <td key={i} className="px-2 py-2">
              <div className="h-4 bg-gray-700 rounded w-full max-w-[100px]"></div>
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);

const ProfilePage = () => {
  const { user, leaderboard, loading, refreshUser } = useUser();
  const [viewingMore, setViewingMore] = useState<
    "datasets" | "likes" | "comments" | null
  >(null);

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadData, setUploadData] = useState<UploadData>({
    title: "",
    description: "",
    url: "",
    category: "",
    size: undefined,
    tags: "",
  });

  const { createDataset, loading: creatingDataset, error: uploadError } =
    useCreateDataset();

  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [userListModalOpen, setUserListModalOpen] = useState(false);
  const [userPage, setUserPage] = useState(1);
  const [userSearch, setUserSearch] = useState("");
  const { users, loading: usersLoading, error: usersError } = useFetchUsers(
    userPage,
    20
  );

  const { updateUserRole, loading: updatingRole } = useUpdateUserRole();
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [editUserRole, setEditUserRole] = useState<
    "USER" | "MODERATOR" | "ADMIN" | ""
  >("");
  const [roleError, setRoleError] = useState<string | null>(null);

  const { logout, loading: logoutLoading, error: logoutError } = useLogout();
  const {
    deleteAccount,
    loading: deletingAccount,
    error: deleteAccountError,
  } = useDeleteAccount();

  const [confirmDeleteAccountOpen, setConfirmDeleteAccountOpen] = useState(false);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <SkeletonProfile />
      </div>
    );
  if (!user) return <div className="text-white">User not found.</div>;

  const getDatasetsFromRefs = (refs: { datasetId: string }[] = []) => {
    const uniqueDatasetIds = Array.from(new Set(refs.map((ref) => ref.datasetId)));
    return uniqueDatasetIds
      .map((id) => user.datasets.find((d) => d.id === id))
      .filter((d): d is Dataset => !!d);
  };

  const renderDatasetList = (datasets: Dataset[], limit: number = 5) => (
    <ul className="space-y-3">
      {datasets.slice(0, limit).map((dataset) => (
        <li
          key={dataset.id}
          className="flex flex-col md:flex-row md:items-center md:justify-between rounded-lg p-3 bg-black/70 border border-white/10 hover:bg-black/90 transition-colors"
        >
          <span className="font-medium truncate">{dataset.title}</span>
          <span className="text-xs text-gray-400 mt-1 md:mt-0 whitespace-nowrap">
            {new Date(dataset.createdAt).toLocaleDateString()}
          </span>
        </li>
      ))}
    </ul>
  );

  const likedDatasets = getDatasetsFromRefs(user.likes);
  const commentedDatasets = getDatasetsFromRefs(user.comments);

  const monthLabels = [
    "Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec",
  ];
  const currentYear = new Date().getFullYear();
  const monthlyActivityData = monthLabels.map((month, index) => {
    const count = user.datasets.filter((d) => {
      const date = new Date(d.createdAt);
      return date.getFullYear() === currentYear && date.getMonth() === index;
    }).length;
    return { month, Contributions: count };
  });

  const filteredUsers = userSearch
    ? users.filter(
        (u) =>
          u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
          u.email?.toLowerCase().includes(userSearch.toLowerCase())
      )
    : users;

  const beginEditUserRole = (userId: string, currentRole: string) => {
    setEditUserId(userId);
    setEditUserRole(currentRole as "USER" | "MODERATOR" | "ADMIN");
    setRoleError(null);
  };
  const submitEditUserRole = async () => {
    if (!editUserId || !editUserRole) return;
    setRoleError(null);
    try {
      await updateUserRole(editUserId, editUserRole);
      setEditUserId(null);
      setEditUserRole("");
    } catch (err: unknown) {
      if (err && typeof err === "object" && "message" in err) {
        setRoleError((err as { message: string }).message || "Failed to update role.");
      } else {
        setRoleError("Failed to update role.");
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createDataset({
        ...uploadData,
        tags: uploadData.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
      await refreshUser();
      setUploadModalOpen(false);
      setUploadData({
        title: "",
        description: "",
        url: "",
        category: "",
        size: undefined,
        tags: "",
      });
      setSuccessMessage("Dataset has been successfully created!");
      setSuccessModalOpen(true);
      setTimeout(() => setSuccessModalOpen(false), 3500);
    } catch {}
  };

  const handleLogout = () => {
    logout();
  };

  const handleDeleteAccountClick = () => {
    setConfirmDeleteAccountOpen(true);
  };
  const handleConfirmDeleteAccount = async () => {
    try {
      await deleteAccount();
      setConfirmDeleteAccountOpen(false);
      logout();
    } catch {
      // error handled through hook
    }
  };
  const handleCancelDeleteAccount = () => {
    setConfirmDeleteAccountOpen(false);
  };

  const getViewMoreDatasets = () => {
    switch (viewingMore) {
      case "datasets":
        return user.datasets;
      case "likes":
        return likedDatasets;
      case "comments":
        return commentedDatasets;
      default:
        return [];
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-x-hidden">
      <StarrySkyBackground />

      <div className="absolute mt-2 left-1/2 z-10 -translate-x-1/2 w-[90vw] min-h-[80vh] rounded-2xl bg-transparent p-6 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 pb-32">
        {/* Header */}
        <div className="col-span-12 relative flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0 mb-4 md:mb-0">
          <div className="text-2xl font-medium flex items-end gap-2.5 cursor-pointer">
            <Image
              src="/DataSphere.png"
              alt="DataSphere Logo"
              width={35}
              height={35}
              priority
              className="rounded-md shadow-sm drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
            />
            <h1 className="text-xl font-extrabold bg-gradient-to-r from-gray-200 via-gray-400 to-white bg-clip-text text-transparent tracking-wide drop-shadow-md whitespace-nowrap">
              DataSphere
            </h1>
          </div>
          <div className="absolute left-1/2 transform -translate-x-1/2 md:relative md:left-auto md:translate-x-0">
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-gray-200 via-gray-400 to-white bg-clip-text text-transparent tracking-wide drop-shadow-md">
              Profile
            </h1>
          </div>
          <div className="flex gap-2 flex-wrap justify-center md:justify-start">
            <button
              className="cursor-pointer bg-black/70 border border-white/20 rounded-lg h-auto w-auto px-3 py-2 text-white hover:bg-black/90 transition"
              onClick={() => setUploadModalOpen(true)}
              type="button"
            >
              Upload Dataset
            </button>
            {(user.role === "ADMIN" || user.role === "MODERATOR") && (
              <button
                className="flex items-center gap-1 cursor-pointer bg-black/70 border border-white/20 rounded-lg h-auto w-auto px-3 py-2 text-white hover:bg-black/90 transition"
                onClick={() => setUserListModalOpen(true)}
                type="button"
              >
                <IconUsers size={20} aria-hidden="true" /> User List
              </button>
            )}
          </div>
        </div>

        {/* Profile & Data */}
        <div className="col-span-12 md:col-span-4 flex flex-col items-center gap-6 rounded-2xl border border-white/20 bg-black/80 backdrop-blur-2xl p-6 shadow-2xl">
          <div className="relative">
            {user.avatar ? (
              <Image
                src={user.avatar}
                alt={user.name}
                width={120}
                height={120}
                className="rounded-full border-4 border-white/20 shadow-xl"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-gray-700 flex items-center justify-center text-4xl font-bold border-4 border-white/20 shadow-xl">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {leaderboard && (
            <div className="text-center text-sm text-white font-semibold">
              🏆 {leaderboard.tier} — Rank #{leaderboard.rank}
            </div>
          )}

          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-wide truncate max-w-xs">
              {user.name}
            </h2>
            <p className="text-sm text-gray-400 truncate max-w-xs">{user.email}</p>
          </div>

          <div className="w-full flex flex-col sm:flex-row justify-between text-sm text-gray-300 font-medium">
            <div className="space-y-1 mb-4 sm:mb-0">
              <div>
                <span className="font-semibold">Contributions:</span>{" "}
                {user.datasets.length}
              </div>
              <div>
                <span className="font-semibold">Likes:</span> {user.likes?.length || 0}
              </div>
              <div>
                <span className="font-semibold">Comments:</span>{" "}
                {user.comments?.length || 0}
              </div>
            </div>
            <div className="space-y-1">
              <div>
                <span className="font-semibold">Role:</span> {user.role}
              </div>
              <div>
                <span className="font-semibold">Joined:</span>{" "}
                {new Date(user.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full">
            <button
              onClick={handleLogout}
              disabled={logoutLoading}
              className="flex-1 flex items-center justify-center gap-1 px-4 py-2 bg-white/20 border border-white/20 hover:bg-white/10 rounded-md text-white text-sm disabled:opacity-60 cursor-pointer"
              type="button"
            >
              <IconLogout size={16} aria-hidden="true" />{" "}
              {logoutLoading ? "Logging Out..." : "Logout"}
            </button>
            <button
              onClick={handleDeleteAccountClick}
              disabled={deletingAccount}
              className="flex-1 flex items-center justify-center gap-1 px-4 py-2 bg-red-600/60 hover:bg-red-600/40 border border-red-800 text-red-200 rounded-md text-sm cursor-pointer disabled:opacity-60"
              type="button"
            >
              {deletingAccount ? (
                <>
                  <IconLoader
                    className="animate-spin inline-block mr-2"
                    aria-hidden="true"
                  />
                  Deleting...
                </>
              ) : (
                <>
                  <IconTrash size={16} aria-hidden="true" /> Delete
                </>
              )}
            </button>
          </div>
          {(logoutError || deleteAccountError) && (
            <div className="text-red-400 mt-2 text-center break-words max-w-full">
              {logoutError || deleteAccountError}
            </div>
          )}
        </div>

        {/* Monthly Activity chart */}
        <div className="col-span-12 md:col-span-8 rounded-2xl border border-white/20 bg-black/80 p-6 shadow-2xl flex flex-col">
          <h3 className="text-lg font-semibold mb-4 text-white truncate">
            Monthly Activity
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart
              data={monthlyActivityData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid stroke="#444" strokeDasharray="3 3" />
              <XAxis dataKey="month" stroke="#bbb" />
              <YAxis stroke="#bbb" allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: "#222" }} />
              <Line
                type="monotone"
                dataKey="Contributions"
                stroke="#ffffff"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* My Datasets */}
        <div className="col-span-12 md:col-start-1 md:col-span-6 rounded-2xl border border-white/20 bg-black/80 p-6 shadow-lg overflow-x-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">My Datasets</h3>
            {user.datasets.length > 3 && (
              <button
                onClick={() => setViewingMore("datasets")}
                className="text-xs text-white cursor-pointer hover:underline"
                type="button"
              >
                View More
              </button>
            )}
          </div>
          {user.datasets.length === 0 ? (
            <p className="text-gray-400">No datasets added yet.</p>
          ) : (
            renderDatasetList(user.datasets, 3)
          )}
        </div>

        {/* Liked Datasets */}
        <div className="col-span-12 md:col-span-3 rounded-2xl border border-white/20 bg-black/80 p-6 shadow-lg overflow-x-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Liked Datasets</h3>
            {likedDatasets.length > 2 && (
              <button
                onClick={() => setViewingMore("likes")}
                className="text-xs text-white cursor-pointer hover:underline"
                type="button"
              >
                View More
              </button>
            )}
          </div>
          {likedDatasets.length === 0 ? (
            <p className="text-gray-400">No liked datasets yet.</p>
          ) : (
            renderDatasetList(likedDatasets, 2)
          )}
        </div>

        {/* Commented Datasets */}
        <div className="col-span-12 md:col-span-3 rounded-2xl border border-white/20 bg-black/80 p-6 shadow-lg overflow-x-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Commented Datasets</h3>
            {commentedDatasets.length > 2 && (
              <button
                onClick={() => setViewingMore("comments")}
                className="text-xs text-white cursor-pointer hover:underline"
                type="button"
              >
                View More
              </button>
            )}
          </div>
          {commentedDatasets.length === 0 ? (
            <p className="text-gray-400">No comments yet.</p>
          ) : (
            renderDatasetList(commentedDatasets, 2)
          )}
        </div>
      </div>

      {/* Upload Dataset Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
          <div className="bg-black/90 border border-white/20 rounded-xl p-7 w-full max-w-md text-white shadow-xl relative overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setUploadModalOpen(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white cursor-pointer"
              aria-label="Close Upload Modal"
              type="button"
            >
              Close
            </button>
            <h2 className="text-xl mb-2 font-bold">Upload Dataset</h2>
            <form onSubmit={handleUploadSubmit} className="flex flex-col gap-4">
              {/* Title */}
              <div>
                <label className="block mb-1 font-medium">
                  Title<span className="text-white">*</span>
                </label>
                <input
                  className="bg-black/30 rounded px-3 py-2 text-white border w-full"
                  required
                  placeholder="E.g. India Population 2022"
                  value={uploadData.title}
                  onChange={(e) =>
                    setUploadData({ ...uploadData, title: e.target.value })
                  }
                  aria-required="true"
                />
                <span className="block text-xs text-gray-400 mt-1">
                  Enter a descriptive title for your dataset.
                </span>
                {uploadData.title.length === 0 && (
                  <span className="block text-xs text-red-400 mt-1">Title is required.</span>
                )}
              </div>
              {/* Description */}
              <div>
                <label className="block mb-1 font-medium">Description</label>
                <textarea
                  className="bg-black/30 rounded px-3 py-2 text-white border w-full"
                  placeholder="Dataset description (optional)"
                  value={uploadData.description}
                  onChange={(e) =>
                    setUploadData({ ...uploadData, description: e.target.value })
                  }
                  rows={3}
                />
                <span className="block text-xs text-gray-400 mt-1">
                  What does this dataset contain? (Optional)
                </span>
              </div>
              {/* URL */}
              <div>
                <label className="block mb-1 font-medium">
                  Google Drive URL<span className="text-white">*</span>
                </label>
                <input
                  className="bg-black/30 rounded px-3 py-2 text-white border w-full"
                  required
                  placeholder="https://drive.google.com/file/..."
                  value={uploadData.url}
                  onChange={(e) =>
                    setUploadData({ ...uploadData, url: e.target.value })
                  }
                  aria-required="true"
                />
                <span className="block text-xs text-gray-400 mt-1">
                  Paste a Google Drive or Google Docs link. Other URLs won&#39;t work.
                </span>
                {uploadData.url.length > 0 &&
                  !/^https?:\/\/(drive|docs)\.google\.com/.test(uploadData.url) && (
                    <span className="block text-xs text-red-400 mt-1">
                      Only Google Drive and Docs links are accepted.
                    </span>
                  )}
              </div>
              {/* Category */}
              <div>
                <label className="block mb-1 font-medium">Category</label>
                <input
                  className="bg-black/30 rounded px-3 py-2 text-white border w-full"
                  placeholder="E.g. health, finance (optional)"
                  value={uploadData.category}
                  onChange={(e) =>
                    setUploadData({ ...uploadData, category: e.target.value })
                  }
                />
                <span className="block text-xs text-gray-400 mt-1">
                  Example: government, climate, covid (Optional)
                </span>
              </div>
              {/* Size */}
              <div>
                <label className="block mb-1 font-medium">Size (in MB)</label>
                <input
                  type="number"
                  min={0}
                  className="bg-black/30 rounded px-3 py-2 text-white border w-full"
                  placeholder="E.g. 12"
                  value={uploadData.size ?? ""}
                  onChange={(e) =>
                    setUploadData({
                      ...uploadData,
                      size: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
                <span className="block text-xs text-gray-400 mt-1">
                  Enter the dataset size in megabytes. (Optional)
                </span>
                {!!uploadData.size && isNaN(uploadData.size) && (
                  <span className="block text-xs text-red-400 mt-1">Size must be a number.</span>
                )}
              </div>
              {/* Tags */}
              <div>
                <label className="block mb-1 font-medium">Tags</label>
                <input
                  className="bg-black/30 rounded px-3 py-2 text-white border w-full"
                  placeholder="E.g. climate, india, census"
                  value={uploadData.tags}
                  onChange={(e) =>
                    setUploadData({ ...uploadData, tags: e.target.value })
                  }
                />
                <span className="block text-xs text-gray-400 mt-1">
                  Comma-separated keywords, e.g. &#34;climate, india, health&#34;
                </span>
                {uploadData.tags.length > 0 &&
                  !/^(\w+\s*,\s*)*\w+$/.test(uploadData.tags) && (
                    <span className="block text-xs text-red-400 mt-1">
                      Tags must be separated by commas, e.g. &#34;climate, india, health&#34;
                    </span>
                  )}
              </div>
              {/* Submit Button */}
              <button
                type="submit"
                disabled={creatingDataset}
                className="bg-white/20 rounded font-semibold py-2 hover:bg-white/10 transition mt-2 cursor-pointer border border-white/10 hover:border-white/80 text-white/60 hover:text-white/90"
              >
                {creatingDataset ? "Uploading..." : "Upload"}
              </button>
              {uploadError && <div className="text-red-400 break-words">{uploadError}</div>}
            </form>
          </div>
        </div>
      )}

      {/* View More Modal */}
      {viewingMore && (
        <div className="fixed inset-0 bg-black/85 flex justify-center items-center z-50 px-4">
          <div className="bg-black/90 border border-white/20 rounded-xl p-6 w-full max-w-lg shadow-lg relative overflow-y-auto max-h-[80vh]">
            <button
              className="absolute top-3 right-4 text-white text-lg cursor-pointer"
              onClick={() => setViewingMore(null)}
              type="button"
              aria-label="Close View More Modal"
            >
              Close
            </button>
            <h2 className="text-xl font-bold mb-4 truncate">
              {viewingMore === "datasets" && "My Datasets"}
              {viewingMore === "likes" && "Liked Datasets"}
              {viewingMore === "comments" && "Commented Datasets"}
            </h2>
            <ul className="space-y-3 max-h-[70vh] overflow-y-auto">
              {getViewMoreDatasets().map((dataset) => (
                <li
                  key={dataset.id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between rounded-lg p-3 bg-black/70 border border-white/10"
                >
                  <span className="font-medium truncate">{dataset.title}</span>
                  <span className="text-xs text-gray-400 mt-1 md:mt-0 whitespace-nowrap">
                    {new Date(dataset.createdAt).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Confirm Delete Account Modal */}
      <ConfirmDeleteAccountModal
        open={confirmDeleteAccountOpen}
        loading={deletingAccount}
        onConfirm={handleConfirmDeleteAccount}
        onCancel={handleCancelDeleteAccount}
      />

      {/* Success / Error message modals */}
      <MessageModal open={successModalOpen} message={successMessage} />
      {(logoutError || deleteAccountError) && (
        <MessageModal
          open={true}
          isError={true}
          message={logoutError || deleteAccountError || ""}
        />
      )}

      {/* User List Modal (only for ADMIN/MODERATOR) */}
      {userListModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="max-w-3xl w-full bg-black/90 backdrop-blur-md text-white p-6 rounded-xl border border-white/20 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setUserListModalOpen(false)}
              className="absolute top-3 right-3 text-sm text-gray-300 hover:text-white cursor-pointer"
              type="button"
              aria-label="Close User List Modal"
            >
              Close
            </button>
            <h2 className="text-xl font-bold mb-4 truncate">User List</h2>
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-full mb-3 p-2 rounded bg-black/40 text-white border border-white/20"
              placeholder="Search user by name or email..."
              aria-label="Search user by name or email"
            />
            {usersLoading ? (
              <div className="flex justify-center py-4">
                <IconLoader className="animate-spin" size={24} aria-hidden="true" />
              </div>
            ) : usersError ? (
              <div className="text-red-400 break-words">{usersError}</div>
            ) : (
              <div className="overflow-x-auto">
                {filteredUsers.length === 0 ? (
                  <div className="text-gray-400 text-center py-2 truncate max-w-full">
                    No users found
                  </div>
                ) : (
                  <table className="w-full text-left mb-3 text-sm min-w-[500px]">
                    <thead>
                      <tr>
                        <th className="px-2 py-1">Name</th>
                        <th className="px-2 py-1">Email</th>
                        <th className="px-2 py-1">Role</th>
                        <th className="px-2 py-1 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="border-t border-white/10">
                          <td className="px-2 py-2 truncate max-w-[150px]">{u.name}</td>
                          <td className="px-2 py-2 truncate max-w-[200px]">{u.email}</td>
                          <td className="px-2 py-2">{u.role}</td>
                          <td className="px-2 py-2 text-right whitespace-nowrap">
                            {editUserId === u.id ? (
                              <div className="inline-block">
                                <select
                                  value={editUserRole}
                                  onChange={(e) =>
                                    setEditUserRole(
                                      e.target.value as "USER" | "MODERATOR" | "ADMIN"
                                    )
                                  }
                                  className="bg-black/70 text-white border border-white/20 rounded px-2 py-1 mr-2"
                                  aria-label={`Edit role for ${u.name}`}
                                >
                                  <option value="USER">USER</option>
                                  <option value="MODERATOR">MODERATOR</option>
                                  <option value="ADMIN">ADMIN</option>
                                </select>
                                <button
                                  onClick={submitEditUserRole}
                                  disabled={updatingRole}
                                  className="px-3 py-1 bg-green-700 text-white rounded hover:bg-green-800 mr-2 cursor-pointer"
                                  type="button"
                                  aria-label={`Save role for ${u.name}`}
                                >
                                  {updatingRole ? (
                                    <IconLoader
                                      className="animate-spin inline-block"
                                      size={16}
                                      aria-hidden="true"
                                    />
                                  ) : (
                                    <IconCheck />
                                  )}
                                </button>
                                <button
                                  onClick={() => setEditUserId(null)}
                                  className="px-3 py-1 bg-black/80 text-white rounded"
                                  type="button"
                                  aria-label={`Cancel edit for ${u.name}`}
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => beginEditUserRole(u.id, u.role)}
                                className="px-3 py-1 bg-white/20 text-white rounded hover:bg-white/10 cursor-pointer"
                                type="button"
                                aria-label={`Edit role for ${u.name}`}
                              >
                                Edit Role
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
            {roleError && (
              <div className="text-red-500 mb-2 break-words">{roleError}</div>
            )}
            {usersLoading && filteredUsers.length === 0 && <SkeletonUsersTable />}
          </div>
        </div>
      )}

      {/* Floating Dock */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20">
        <FloatingDock
          items={[
            { title: "Dashboard", icon: <IconLayoutDashboard />, href: "/dashboard" },
            { title: "Datasets", icon: <IconDatabase />, href: "/datasets" },
            { title: "Profile", icon: <IconUserCircle />, href: "/profile" },
            { title: "Leaderboard", icon: <IconTrophy />, href: "/leaderboard" },
            { title: "About Us", icon: <IconInfoCircle />, href: "/about" },
            { title: "Contact", icon: <IconMail />, href: "/contact" },
          ]}
          mobileClassName="translate-y-20"
        />
      </div>
    </div>
  );
};

export default ProfilePage;
