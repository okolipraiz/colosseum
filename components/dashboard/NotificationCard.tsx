"use client";
import { useNotifications } from "@/context/notification-provider";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
} from "@/hooks/user";
import {
  Bell,
  CheckCheck,
  Inbox,
  ArrowDown,
  ArrowUp,
  Trophy,
} from "lucide-react";
import Link from "next/link";

const NotificationCard = () => {
   const { notificationsData } = useNotifications();
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAllRead } = useMarkAllNotificationsRead();

  const notifications = notificationsData?.notifications || [];
    const unreadCount = notificationsData?.unread_count || 0;
    
     const formatTimeAgo = (dateString: string) => {
       try {
         const date = new Date(dateString);
         const now = new Date();
         const diffMs = now.getTime() - date.getTime();
         if (diffMs < 0) return "just now";
         const diffMins = Math.floor(diffMs / 60000);
         if (diffMins < 1) return "just now";
         if (diffMins < 60) return `${diffMins}m ago`;
         const diffHours = Math.floor(diffMins / 60);
         if (diffHours < 24) return `${diffHours}h ago`;
         const diffDays = Math.floor(diffHours / 24);
         if (diffDays === 1) return "yesterday";
         if (diffDays < 7) return `${diffDays}d ago`;
         return date.toLocaleDateString(undefined, {
           month: "short",
           day: "numeric",
         });
       } catch (e) {
         return "";
       }
     };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/[0.01]">
        <span className="text-sm font-black text-white">All Notifications</span>
        {unreadCount > 0 && (
          <button
            onClick={() => {
              markAllRead();
            }}
            className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        )}
      </div>

      {/* Content / List */}
      <div className="max-h-[min(360px,60vh)] overflow-y-auto divide-y divide-white/5 scrollbar-thin scrollbar-thumb-white/10">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center mb-3">
              <Inbox className="w-5 h-5 text-slate-500" />
            </div>
            <span className="text-sm font-bold text-slate-400">
              All caught up!
            </span>
            <span className="text-xs text-slate-600 mt-1">
              You have no notifications yet.
            </span>
          </div>
        ) : (
          notifications.map((notif: any) => {
            let Icon = Bell;
            let iconBg = "bg-blue-500/10";
            let iconColor = "text-blue-400";

            if (notif.type === "market_resolved") {
              Icon = Trophy;
              iconBg = "bg-amber-500/10";
              iconColor = "text-amber-400";
            } else if (notif.type === "deposit") {
              Icon = ArrowDown;
              iconBg = "bg-emerald-500/10";
              iconColor = "text-emerald-400";
            } else if (notif.type === "withdrawal") {
              Icon = ArrowUp;
              iconBg = "bg-rose-500/10";
              iconColor = "text-rose-400";
            }

            const content = (
              <div className="flex gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}
                >
                  <Icon className={`w-4 h-4 ${iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-black text-white leading-tight">
                      {notif.title}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold shrink-0">
                      {formatTimeAgo(notif.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium mt-1 leading-snug break-words">
                    {notif.message}
                  </p>
                </div>
                {!notif.is_read && (
                  <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 self-center" />
                )}
              </div>
            );

            const itemClassName = `p-4 text-left w-full block transition-colors duration-200 cursor-pointer ${
              notif.is_read
                ? "hover:bg-white/[0.02]"
                : "bg-blue-500/[0.02] hover:bg-blue-500/[0.04]"
            }`;

            const handleClick = () => {
              if (!notif.is_read) {
                markRead(notif.id);
              }
            };

            if (notif.market_id) {
              return (
                <Link
                  key={notif.id}
                  href={`/markets/${notif.market_id}`}
                  onClick={handleClick}
                  className={itemClassName}
                >
                  {content}
                </Link>
              );
            }

            return (
              <button
                key={notif.id}
                onClick={handleClick}
                className={itemClassName}
              >
                {content}
              </button>
            );
          })
        )}
      </div>
    </>
  );
};

export default NotificationCard;
