import { useEffect } from 'react';
import type { RefObject } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import type { Notification, NotificationsData } from './notificationsApi';
import NotificationItem from './NotificationItem';

export default function NotificationDropdown({ id, panelRef, data, loading, failed, error, busy, offset, page, close, retry, open, markRead, markAll }: {
  id: string;
  panelRef: RefObject<HTMLDivElement | null>;
  data?: NotificationsData;
  loading: boolean;
  failed: boolean;
  error: string;
  busy: boolean;
  offset: number;
  page: (offset: number) => void;
  close: () => void;
  retry: () => void;
  open: (notification: Notification) => void;
  markRead: (notification: Notification) => void;
  markAll: () => void;
}) {
  useEffect(() => { panelRef.current?.focus({ preventScroll: true }); }, [panelRef]);
  return createPortal(
    <div ref={panelRef} id={id} role="dialog" aria-label="Notifications" tabIndex={-1}
      className="ye-ui ye-notifications fixed right-4 top-20 z-[80] w-[calc(100vw_-_2rem)] max-w-sm overflow-hidden rounded-2xl border border-[#D9A3AA]/40 bg-white text-[#351018] shadow-xl outline-none md:right-8">
      <div className="flex items-center justify-between gap-3 border-b border-[#D9A3AA]/30 p-4">
        <h2 className="font-semibold">Notifications</h2>
        <button type="button" onClick={close} aria-label="Close notifications" className="rounded-full p-1 hover:bg-[#F2D9DC]/50"><X size={18} /></button>
      </div>
      <div className="border-b border-[#D9A3AA]/20 px-4 py-2">
        <button type="button" onClick={markAll} disabled={busy || !data?.unreadCount} className="text-xs text-[#351018] underline underline-offset-4 disabled:opacity-40">Mark all as read</button>
      </div>
      {error && <p role="alert" className="px-4 py-2 text-xs text-red-600">{error}</p>}
      <div className="max-h-[60vh] overflow-y-auto">
        {loading ? <p className="p-4 text-sm text-[#351018]/60">Loading notifications...</p> : failed ? (
          <p role="alert" className="p-4 text-sm text-red-600">Could not load notifications. <button type="button" onClick={retry} className="underline">Try again</button></p>
        ) : !data?.notifications.length ? <p className="p-6 text-center text-sm text-[#351018]/60">No notifications yet.</p> : (
          <ul>{data.notifications.map((notification) => <NotificationItem key={notification.id} notification={notification} busy={busy} open={() => open(notification)} markRead={() => markRead(notification)} />)}</ul>
        )}
      </div>
      {data && data.total > 20 && <div className="flex items-center justify-between border-t border-[#D9A3AA]/30 p-3 text-xs">
        <button type="button" disabled={loading || offset === 0} onClick={() => page(Math.max(0, offset - 20))} className="rounded-lg border border-[#D9A3AA]/40 px-3 py-2 disabled:opacity-40">Newer</button>
        <span>Page {Math.floor(offset / 20) + 1}</span>
        <button type="button" disabled={loading || offset + 20 >= data.total} onClick={() => page(offset + 20)} className="rounded-lg border border-[#D9A3AA]/40 px-3 py-2 disabled:opacity-40">Older</button>
      </div>}
    </div>, document.body,
  );
}
