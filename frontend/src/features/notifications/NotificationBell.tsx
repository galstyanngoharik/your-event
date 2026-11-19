import { useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useGetNotificationsQuery, useReadAllNotificationsMutation, useReadNotificationMutation } from './notificationsApi';
import type { Notification } from './notificationsApi';
import NotificationDropdown from './NotificationDropdown';

export default function NotificationBell() {
  const [expanded, setExpanded] = useState(false);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState('');
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const id = useId();
  const navigate = useNavigate();
  const { data: lastData, currentData: data, isFetching, isError, refetch } = useGetNotificationsQuery({ offset }, { pollingInterval: 15000 });
  const [read, { isLoading: reading }] = useReadNotificationMutation();
  const [readAll, { isLoading: readingAll }] = useReadAllNotificationsMutation();
  const busy = reading || readingAll;
  const unread = lastData?.unreadCount || 0;
  const close = () => {
    setExpanded(false);
    button.current?.focus({ preventScroll: true });
  };
  useEffect(() => {
    if (!expanded) return;
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !button.current?.contains(event.target) && !panel.current?.contains(event.target)) setExpanded(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setExpanded(false);
        button.current?.focus({ preventScroll: true });
      }
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
    };
  }, [expanded]);
  const markRead = async (notification: Notification, follow = false) => {
    setError('');
    try {
      if (!notification.readAt) await read(notification.id).unwrap();
      if (follow) { navigate(notification.link); close(); }
    } catch { setError('Could not mark the notification as read. Please try again.'); }
  };
  const markAll = async () => {
    setError('');
    try { await readAll().unwrap(); }
    catch { setError('Could not mark notifications as read. Please try again.'); }
  };
  return (
    <>
      <button ref={button} type="button" onClick={() => { setOffset(0); setExpanded((value) => !value); }}
        aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`} aria-expanded={expanded} aria-controls={id} aria-haspopup="dialog"
        className="relative rounded-full p-2 text-[#351018] outline-none hover:bg-[#351018]/10 focus-visible:ring-2 focus-visible:ring-[#351018]">
        <Bell size={22} />
        {unread > 0 && <span className="absolute -right-1 -top-1 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-[#351018] px-1 text-[10px] font-semibold text-white">{unread > 99 ? '99+' : unread}</span>}
      </button>
      {expanded && <NotificationDropdown id={id} panelRef={panel} data={data} loading={isFetching && !data} failed={isError} error={error} busy={busy}
        offset={offset} page={setOffset} close={close} retry={refetch} open={(notice) => { void markRead(notice, true); }}
        markRead={(notice) => { void markRead(notice); }} markAll={() => { void markAll(); }} />}
    </>
  );
}
