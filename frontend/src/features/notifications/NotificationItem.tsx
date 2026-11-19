import { CalendarClock, Check, ListTodo, MessageCircle, UserCheck } from 'lucide-react';
import type { Notification } from './notificationsApi';

export default function NotificationItem({ notification, busy, open, markRead }: {
  notification: Notification;
  busy: boolean;
  open: () => void;
  markRead: () => void;
}) {
  const title = notification.title === 'New RSVP response' ? 'New notification' : notification.title;
  const Icon = notification.type === 'rsvp' ? UserCheck : notification.type === 'event_reminder' ? CalendarClock
    : notification.type === 'task_reminder' ? ListTodo : MessageCircle;
  return (
    <li className={`flex gap-3 border-b border-l-2 border-b-[#D9A3AA]/20 p-4 ${notification.readAt ? 'border-l-transparent' : 'border-l-[#D9A3AA] bg-[#F2D9DC]/30'}`}>
      <Icon size={19} className="mt-1 shrink-0 text-[#D9A3AA]" />
      <button type="button" onClick={open} disabled={busy} className="min-w-0 flex-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#D9A3AA] disabled:opacity-50">
        <p className="break-words text-sm font-semibold text-[#351018]">{title}</p>
        <p className="mt-1 break-words text-xs leading-5 text-[#351018]/70">{notification.description}</p>
        <time dateTime={notification.createdAt} className="mt-2 block text-[11px] text-[#351018]/50">{new Date(notification.createdAt).toLocaleString()}</time>
      </button>
      {!notification.readAt && <button type="button" onClick={markRead} disabled={busy} aria-label={`Mark as read: ${title}`} title="Mark as read" className="self-start rounded-full p-1 text-[#351018] hover:bg-[#D9A3AA]/20 disabled:opacity-50"><Check size={16} /></button>}
    </li>
  );
}
