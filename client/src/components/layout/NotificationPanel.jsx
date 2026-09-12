import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Calendar,
  BookOpen,
  ShoppingBag,
  Users,
  Store,
  Sparkles,
  Info,
  X,
} from 'lucide-react';
import { notificationService } from '../../services/dataServices';
import { useAuth } from '../../contexts/AuthContext';

export const NotificationPanel = () => {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const panelRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoading(true);
      const res = await notificationService.getNotifications({ limit: 10 });
      if (res?.data) {
        const notifs = res.data.notifications || (Array.isArray(res.data) ? res.data : []);
        setNotifications(notifs);
        const count = res.data.unreadCount !== undefined
          ? res.data.unreadCount
          : notifs.filter((n) => !n.isRead).length;
        setUnreadCount(count);
      }
    } catch (err) {
      console.warn('Failed to fetch notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [isAuthenticated]);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Mark all read error:', err);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'EVENT':
        return <Calendar className="w-4 h-4 text-sky-600" />;
      case 'BORROWING':
      case 'PEMINJAMAN':
        return <BookOpen className="w-4 h-4 text-emerald-600" />;
      case 'ORDER':
        return <ShoppingBag className="w-4 h-4 text-amber-600" />;
      case 'COMMUNITY':
      case 'KOMUNITAS':
        return <Users className="w-4 h-4 text-teal-600" />;
      case 'MITRA':
        return <Store className="w-4 h-4 text-indigo-600" />;
      case 'GAMIFICATION':
      case 'GAMIFIKASI':
        return <Sparkles className="w-4 h-4 text-amber-500" />;
      default:
        return <Info className="w-4 h-4 text-[#075E54]" />;
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className="p-2 rounded-xl text-[#66736D] hover:text-[#075E54] hover:bg-[#E8F3EF] transition-colors relative"
        aria-label="Buka notifikasi"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-[#E2E8E5] z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-[#E2E8E5] flex items-center justify-between bg-[#F8FAF8]">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#17211D]">Notifikasi</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F3EF] text-[#075E54]">
                  {unreadCount} baru
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] font-semibold text-[#075E54] hover:underline flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Tandai Semua Dibaca
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
            {isLoading && notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#66736D]">
                Memuat notifikasi...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-[#E8F3EF] text-[#075E54] flex items-center justify-center mx-auto">
                  <Bell className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-[#17211D]">Belum ada notifikasi</p>
                <p className="text-[11px] text-[#66736D]">
                  Pemberitahuan terkait aktivitas literasi akan muncul di sini.
                </p>
              </div>
            ) : (
              notifications.map((n) => {
                const isUnread = !n.isRead;
                const formattedTime = n.createdAt
                  ? new Date(n.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '';

                return (
                  <div
                    key={n.id}
                    onClick={() => !n.isRead && handleMarkAsRead(n.id)}
                    className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer ${
                      isUnread ? 'bg-[#E8F3EF]/30 hover:bg-[#E8F3EF]/60' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-white border border-[#E2E8E5] flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                      {getCategoryIcon(n.category || n.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4 className={`text-xs ${isUnread ? 'font-bold text-[#17211D]' : 'font-medium text-[#17211D]'} truncate`}>
                          {n.title}
                        </h4>
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-[#075E54] shrink-0" />
                        )}
                      </div>

                      <p className="text-[11px] text-[#66736D] leading-relaxed line-clamp-2">
                        {n.message}
                      </p>

                      <span className="text-[10px] text-gray-400 mt-1 block">
                        {formattedTime}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-[#F8FAF8] border-t border-[#E2E8E5] text-center">
            <Link
              to="/dashboard"
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-[#075E54] hover:underline"
            >
              Lihat Selengkapnya di Dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
