'use client';

import { FaBell } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications } from '@/context/NotificationContext';

const NotificationFeedTitle = ({ type }: { type: string }) => {
  switch (type) {
    case 'like':
      return 'New Like';
    case 'comment':
      return 'New Comment';
    default:
      return type;
  }
};

export default function NotificationFeed() {
  const { notifications, unreadCount, loading, markAllAsRead } = useNotifications();

  return (
    <div className="bg-[#0A0A23] text-white p-4 rounded-xl border border-[#1a1a40] w-full overflow-y-auto flex-1">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FaBell /> Action Feed
        </h2>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-xs text-blue-400 hover:underline"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
        {loading ? (
          <p className="text-sm text-gray-400">Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <p className="text-gray-400 text-sm">No notifications yet.</p>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`text-sm px-3 py-2 rounded-md border border-[#1a1a40] ${
                notif.isRead ? 'bg-[#0f0f2a] text-gray-300' : 'bg-[#12123a] text-white'
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
              <p className="text-xs text-gray-500 mt-1">
                {formatDistanceToNow(new Date(notif.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
