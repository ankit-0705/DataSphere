'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { auth } from '@/lib/firebase/client';
import { useParams, useRouter } from 'next/navigation';
import { StarrySkyBackground } from '@/components/StarrySkyBackground';
import FloatingDock from '@/components/ui/floating-dock';
import {
  IconLayoutDashboard,
  IconDatabase,
  IconUserCircle,
  IconInfoCircle,
  IconMail,
  IconThumbUp,
  IconCheck,
  IconTrash,
  IconLoader,
  IconMessageCircle,
  IconSend,
  IconX,
  IconTrophy,
} from '@tabler/icons-react';
import { useDatasets } from '@/hooks/useDatasets';
import { useComments, Comment } from '@/hooks/useComments';
import { useDeleteDataset } from '@/hooks/useDeleteDatasets';
import { useToggleLike } from '@/hooks/useToggleLike';
import { useVerifyDataset } from '@/hooks/useVerifyDataset';

// Confirm Delete Modal props
interface ConfirmDeleteModalProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}
// Modal component
const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  loading,
}) =>
  !open ? null : (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div
        className=" p-6 min-w-[300px] bg-white/10
          backdrop-blur-md
          border border-white/20
          rounded-lg
          shadow-md shadow-white/10
          text-gray-200"
      >
        <h2 className="text-xl font-semibold text-white mb-2">{title}</h2>
        <p className="text-gray-300 mb-6">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            className="flex items-center gap-2 px-4 py-2 bg-red-500/50 hover:bg-red-500/40 text-red-300 cursor-pointer rounded-md transition disabled:opacity-50"
            onClick={onConfirm}
            disabled={loading}
            type="button"
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
            className="bg-white/20 hover:bg-white/10 text-white px-4 py-2 rounded cursor-pointer"
            onClick={onCancel}
            disabled={loading}
            type="button"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
// Success / Error message modal props
interface MessageModalProps {
  open: boolean;
  message: string;
  isError?: boolean;
}
// Message modal for success/error messages
const MessageModal: React.FC<MessageModalProps> = ({ open, message, isError = false }) =>
  !open ? null : (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg shadow z-50 text-lg ${
        isError ? 'bg-red-700/80 text-white' : 'bg-green-700/80 text-white'
      }`}
      role="alert"
      aria-live="assertive"
    >
      {message}
    </div>
  );

// Comment delete button updated for Tailwind classes and permission check with error modal on denied permission
interface CommentDeleteButtonProps {
  comment: Comment;
  onDelete: (id: string) => Promise<void>;
  currentUserId: string | null;
  currentUserRole: string | null; // e.g. 'ADMIN', 'MODERATOR', 'USER'
  showPermissionError: (msg: string) => void;
}
const CommentDeleteButton: React.FC<CommentDeleteButtonProps> = ({
  comment,
  onDelete,
  currentUserId,
  currentUserRole,
  showPermissionError,
}) => {
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const canDelete =
    currentUserId !== null &&
    (currentUserId === comment.user.id || currentUserRole === 'ADMIN' || currentUserRole === 'MODERATOR');
  if (!canDelete) return null;

  const handleDelete = () => {
    if (
      currentUserId === null ||
      (currentUserId !== comment.user.id &&
        currentUserRole !== 'ADMIN' &&
        currentUserRole !== 'MODERATOR')
    ) {
      showPermissionError('Only comment owners, Admin, and Moderator users can delete comments.');
      return;
    }
    setShowDeleteModal(true);
  };

  const confirmDeleteComment = async () => {
    setDeleting(true);
    try {
      await onDelete(comment.id);
      setShowDeleteModal(false);
    } catch {
      alert('Failed to delete comment.');
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="text-red-400 hover:text-red-600 transition p-1 rounded"
        title="Delete Comment"
        aria-label="Delete Comment"
        type="button"
      >
        {deleting ? <IconLoader className="animate-spin" size={18} /> : <IconTrash size={18} />}
      </button>
      <ConfirmDeleteModal
        open={showDeleteModal}
        loading={deleting}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        onConfirm={confirmDeleteComment}
        onCancel={() => setShowDeleteModal(false)}
      />
    </>
  );
};

// Skeleton loader components
const Skeleton = ({ className }: { className?: string }) => (
  <div className={`bg-gray-700 animate-pulse rounded ${className}`} />
);

const DatasetPage = () => {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  // Fetch dataset
  const { dataset, isLoading, isError, refresh } = useDatasets(id);

  // Current user info and role state, derived from dataset contributor role for logged-in user
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  // Message modals state
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [messageModalContent, setMessageModalContent] = useState('');
  const [messageModalIsError, setMessageModalIsError] = useState(false);

  const [commentDeletePermissionErrorMsg, setCommentDeletePermissionErrorMsg] = useState('');
  const [commentDeletePermissionErrorOpen, setCommentDeletePermissionErrorOpen] = useState(false);
  const showCommentDeletePermissionError = (msg: string) => {
    setCommentDeletePermissionErrorMsg(msg);
    setCommentDeletePermissionErrorOpen(true);
  };

  // Like hook
  const {
    liked,
    likesCount,
    toggleLike,
    loading: likeLoading,
    initializing,
  } = useToggleLike(dataset?.id, dataset?._count?.likes ?? 0);

  // Verify hook
  const {
    isVerified,
    toggleVerify,
    loading: verifyLoading,
  } = useVerifyDataset(id, dataset?.isVerified ?? false);

  // Delete dataset hook
  const {
    deleteDataset,
    isDeleting,
    error: deleteError,
    success: deleteSuccess,
  } = useDeleteDataset();

  // Comments hook
  const {
    comments,
    total,
    isLoading: commentsLoading,
    isError: commentsError,
    addComment,
    deleteComment,
    refresh: refreshComments,
  } = useComments(id);

  // Comment input states
  const [newComment, setNewComment] = useState('');
  const [commentError, setCommentError] = useState<string | null>(null);
  const [addingComment, setAddingComment] = useState(false);

  // Delete dataset confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Success modal message state for deleting dataset
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState('');

  // On mount and when dataset changes, load current user ID and role from dataset contributor info
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setCurrentUserId(user.uid);
      if (dataset?.contributor && user.uid === dataset.contributor.id) {
        setCurrentUserRole(dataset.contributor.role);
      } else {
        setCurrentUserRole('USER');
      }
    } else {
      setCurrentUserId(null);
      setCurrentUserRole(null);
    }
  }, [dataset?.id]);

  // Handle verify toggle with role check and permission error message
  const handleToggleVerify = async () => {
    if (currentUserRole !== 'ADMIN' && currentUserRole !== 'MODERATOR') {
      setMessageModalContent('Only Admin and Moderator users can verify datasets.');
      setMessageModalIsError(true);
      setMessageModalOpen(true);
      return;
    }
    try {
      await toggleVerify();
    } catch (err: any) {
      setMessageModalContent(err.message || 'Failed to toggle verify status');
      setMessageModalIsError(true);
      setMessageModalOpen(true);
    }
  };

  // Handle delete dataset action with permission check
  const handleDelete = () => {
    if (
      currentUserRole !== 'ADMIN' &&
      currentUserRole !== 'MODERATOR' &&
      currentUserId !== dataset?.createdBy
    ) {
      setMessageModalContent('Only owners, Admin, and Moderator users can delete datasets.');
      setMessageModalIsError(true);
      setMessageModalOpen(true);
      return;
    }
    setShowDeleteModal(true);
  };

  // Confirm modal delete for dataset
  const handleConfirmDelete = () => deleteDataset(id);

  // Success message modal for dataset delete success
  useEffect(() => {
    if (deleteSuccess) {
      setShowDeleteModal(false);
      setDeleteSuccessMsg('Dataset deleted successfully.');
      setTimeout(() => {
        setDeleteSuccessMsg('');
        router.push('/datasets');
      }, 1300);
    }
  }, [deleteSuccess, router]);

  // Add comment handler
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setCommentError(null);
    setAddingComment(true);
    try {
      await addComment(newComment.trim());
      setNewComment('');
    } catch (error: any) {
      setCommentError(error?.message || 'Failed to add comment');
    } finally {
      setAddingComment(false);
    }
  };

  if (isError) {
    return (
      <div className="text-red-500 text-center py-10">
        Error loading dataset: {(isError as Error)?.message || 'Unknown error'}
      </div>
    );
  }
  if (!dataset && !isLoading) {
    return (
      <div className="text-white text-center py-10">No dataset found with ID: {id}</div>
    );
  }

  const userCanVerify = currentUserRole === 'ADMIN' || currentUserRole === 'MODERATOR';
  const userCanDeleteDataset =
    currentUserId !== null &&
    (currentUserId === dataset?.createdBy || currentUserRole === 'ADMIN' || currentUserRole === 'MODERATOR');

  return (
    <div className="relative min-h-screen bg-black text-white overflow-x-hidden pb-20">
      <StarrySkyBackground />
      <div className="relative z-10 px-6 py-16 max-w-6xl mx-auto mt-7">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div
            className="text-2xl font-medium flex items-end gap-2.5 cursor-pointer"
            onClick={() => router.push('/')}
          >
            <Image
              src="/DataSphere.png"
              alt="DataSphere Logo"
              width={35}
              height={35}
              priority
              className="rounded-md shadow-sm drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
            />
            DataSphere
          </div>
          <div className="text-2xl font-semibold bg-white/10 rounded-2xl backdrop-blur-md px-4 py-2">
            Dataset Details
          </div>
          <button
            className="bg-white/10 cursor-pointer h-auto w-auto rounded-md p-2 hover:bg-white/20 transition"
            onClick={() => router.back()}
            aria-label="Go Back"
            type="button"
          >
            Back
          </button>
        </div>

        {/* Main Content */}
        <h1 className="text-3xl font-bold text-white">
          {isLoading ? <Skeleton className="h-12 w-96" /> : dataset.title}
        </h1>
        {isLoading ? (
          <div className="mt-2">
            <Skeleton className="h-6 w-full max-w-3xl mt-1" />
          </div>
        ) : (
          <p className="text-gray-300 mt-2">{dataset.description}</p>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm mt-6">
          {isLoading ? (
            <Skeleton className="h-5 w-24" />
          ) : (
            <p>
              <strong className="text-gray-400">Category:</strong> {dataset.category ?? 'N/A'}
            </p>
          )}
          {isLoading ? (
            <Skeleton className="h-5 w-20" />
          ) : (
            <p className="flex items-center gap-2">
              <strong className="text-gray-400">Verified:</strong>{' '}
              {verifyLoading ? (
                <IconLoader className="animate-spin text-white" />
              ) : dataset.isVerified ? (
                <span
                  className="text-green-400 font-semibold select-none"
                  title="Dataset is Verified"
                >
                  <IconCheck />
                </span>
              ) : (
                <span
                  className="text-red-500 font-semibold select-none"
                  title="Dataset is Unverified"
                >
                  <IconX />
                </span>
              )}
            </p>
          )}
          {isLoading ? (
            <Skeleton className="h-5 w-28" />
          ) : (
            <p>
              <strong className="text-gray-400">Created At:</strong>{' '}
              {new Date(dataset.createdAt).toLocaleDateString()}
            </p>
          )}
          {isLoading ? (
            <Skeleton className="h-5 w-20" />
          ) : (
            <p>
              <strong className="text-gray-400">Size:</strong>{' '}
              {dataset.size ? `${dataset.size} MB` : 'N/A'}
            </p>
          )}
          {isLoading ? (
            <Skeleton className="h-5 w-full col-span-2 mt-2" />
          ) : (
            dataset.url && (
              <p className="col-span-2 break-all">
                <strong className="text-gray-400">URL:</strong>{' '}
                <a
                  href={dataset.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  {dataset.url}
                </a>
              </p>
            )
          )}
        </div>

        {/* Contributor */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-white">Contributor:</h2>
          {isLoading ? (
            <div className="flex items-center gap-4 mt-2">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex flex-col gap-1 w-64">
                <Skeleton className="h-5 w-44" />
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 mt-2 rounded-lg">
              {dataset.contributor?.avatar && (
                <Image
                  src={dataset.contributor.avatar}
                  alt={`${dataset.contributor.name}'s avatar`}
                  width={50}
                  height={50}
                  className="rounded-full"
                />
              )}
              <div>
                <p className="font-medium">{dataset.contributor?.name}</p>
                <p className="text-gray-400 text-sm">Role: {dataset.contributor?.role}</p>
                <p className="text-gray-400 text-sm">
                  Contributions: {dataset.contributor?.contributions}
                </p>
                <p className="text-gray-400 text-sm">Email: {dataset.contributor?.email}</p>
              </div>
            </div>
          )}
        </div>

        {/* Tags and Stats */}
        <div className="flex flex-wrap justify-between items-start mt-8 gap-8">
          <div className="flex justify-center items-end gap-4">
            <h2 className="text-lg font-semibold text-white">Tags:</h2>
            <ul className="flex flex-wrap gap-2 mt-2">
              {isLoading ? (
                <>
                  <Skeleton className="h-6 w-16 rounded-md" />
                  <Skeleton className="h-6 w-16 rounded-md" />
                  <Skeleton className="h-6 w-16 rounded-md" />
                </>
              ) : dataset.tags?.length ? (
                dataset.tags.map(({ tag }: { tag: { id: string; name: string } }) => (
                  <li
                    key={tag.id}
                    className="bg-white/10 text-white/75 px-2 py-1 rounded-md text-sm"
                  >
                    {tag.name}
                  </li>
                ))
              ) : (
                <li className="text-gray-400">No tags available</li>
              )}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <p>
              <strong className="text-gray-400 font-semibold">Likes:</strong>{' '}
              {initializing ? 'Loading...' : likesCount}
            </p>
            <p>
              <strong className="text-gray-400 font-semibold">Comments:</strong> {total}
            </p>
          </div>
        </div>

        {/* Actions: Like, Verify, Delete */}
        <div className="flex gap-4 mt-6">
          {/* Like Button */}
          <button
            disabled={likeLoading || initializing}
            onClick={toggleLike}
            className={`flex items-center gap-2 px-4 py-2 rounded-md cursor-pointer transition ${
              liked ? 'bg-white/20 hover:bg-white/10' : 'bg-gray-700 hover:bg-gray-600'
            }`}
            aria-label={liked ? 'Unlike Dataset' : 'Like Dataset'}
            type="button"
          >
            <IconThumbUp size={20} />
            {initializing
              ? 'Loading...'
              : likeLoading
              ? 'Processing...'
              : liked
              ? 'Liked'
              : 'Like'}
          </button>

          {/* Verification Button (only ADMIN and MODERATOR) */}
          {userCanVerify && (
            <button
              disabled={verifyLoading}
              onClick={handleToggleVerify}
              className={`flex items-center gap-2 px-4 py-2 rounded-md cursor-pointer transition ${
                dataset?.isVerified
                  ? 'bg-green-600/20 text-green-300 hover:bg-green-700/30'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
              aria-label={dataset?.isVerified ? 'Unverify Dataset' : 'Verify Dataset'}
              type="button"
            >
              {verifyLoading ? (
                <IconLoader className="animate-spin" />
              ) : dataset?.isVerified ? (
                <IconCheck />
              ) : (
                <IconX />
              )}
              {dataset?.isVerified ? 'Unverify' : 'Verify'}
            </button>
          )}

          {/* Delete Button (only owner, ADMIN, MODERATOR) */}
          {userCanDeleteDataset && (
            <button
              disabled={isDeleting}
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/50 hover:bg-red-500/40 text-red-300 cursor-pointer rounded-md transition"
              aria-label="Delete Dataset"
              type="button"
            >
              {isDeleting ? (
                <>
                  <IconLoader className="animate-spin" size={20} /> Deleting...
                </>
              ) : (
                <>
                  <IconTrash size={20} /> Delete
                </>
              )}
            </button>
          )}
        </div>
        {deleteError && (
          <p className="text-red-500 mt-2">Error deleting dataset: {deleteError.message}</p>
        )}

        {/* Comments Section */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <IconMessageCircle /> Comments ({total})
          </h2>
          {commentsLoading && <p className="text-gray-400">Loading comments...</p>}
          {commentsError && (
            <p className="text-red-500">Failed to load comments. Please try again.</p>
          )}

          {/* Add Comment Input */}
          <div className="flex items-center gap-2 mb-4">
            <input
              type="text"
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={addingComment}
              className="flex-grow rounded-md px-3 py-2 text-white/90 bg-white/5 border border-white/10"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddComment();
                }
              }}
              aria-label="Write a comment"
            />
            <button
              onClick={handleAddComment}
              disabled={addingComment || !newComment.trim()}
              className="bg-white/20 hover:bg-white/10 disabled:bg-white/5 text-white px-4 py-2 rounded-md cursor-pointer"
              aria-label="Add Comment"
              type="button"
            >
              {addingComment ? (
                <>
                  <IconLoader className="animate-spin inline-block mr-2" /> Posting...
                </>
              ) : (
                <IconSend />
              )}
            </button>
          </div>
          {commentError && <p className="text-red-500 mb-2">{commentError}</p>}

          {/* Comments List */}
          <ul className="space-y-4 max-h-96 overflow-y-auto">
            {comments.length === 0 && !commentsLoading && (
              <li className="text-gray-400">No comments yet.</li>
            )}
            {comments.map((comment: Comment) => (
              <li
                key={comment.id}
                className="bg-white/10 rounded-md p-3 flex gap-4 items-start"
              >
                {comment.user.avatar ? (
                  <Image
                    src={comment.user.avatar}
                    alt={`${comment.user.name}'s avatar`}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-gray-300 font-semibold">
                    {comment.user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold">{comment.user.name}</p>
                    <small className="text-gray-400 text-xs">
                      {new Date(comment.createdAt).toLocaleString()}
                    </small>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap">{comment.text}</p>
                </div>

                {/* Delete comment button with permission check */}
                <CommentDeleteButton
                  comment={comment}
                  onDelete={deleteComment}
                  currentUserId={currentUserId}
                  currentUserRole={currentUserRole}
                  showPermissionError={showCommentDeletePermissionError}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        open={showDeleteModal}
        loading={isDeleting}
        title="Delete Dataset"
        message="Are you sure you want to delete this dataset? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />

      {/* Success Modal for deletion */}
      <MessageModal open={!!deleteSuccessMsg} message={deleteSuccessMsg} />

      {/* Generic Message Modal for permission errors */}
      <MessageModal
        open={messageModalOpen}
        message={messageModalContent}
        isError={messageModalIsError}
      />

      {/* Message Modal for comment delete permission errors */}
      <MessageModal
        open={commentDeletePermissionErrorOpen}
        message={commentDeletePermissionErrorMsg}
        isError={true}
      />

      {/* Floating Dock */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20">
        <FloatingDock
          items={[
            { title: 'Dashboard', icon: <IconLayoutDashboard />, href: '/dashboard' },
            { title: 'Datasets', icon: <IconDatabase />, href: '/datasets' },
            { title: 'Profile', icon: <IconUserCircle />, href: '/profile' },
            { title: 'Leaderboard', icon: <IconTrophy />, href: '/leaderboard' },
            { title: 'About Us', icon: <IconInfoCircle />, href: '/about' },
            { title: 'Contact', icon: <IconMail />, href: '/contact' },
          ]}
          mobileClassName="translate-y-20"
        />
      </div>
    </div>
  );
};

export default DatasetPage;
