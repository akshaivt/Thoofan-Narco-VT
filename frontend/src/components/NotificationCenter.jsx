import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle, MailOpen, AlertCircle } from 'lucide-react';
import api from '../services/api';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/complaints/citizen/notifications');
      if (response.data.success) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unreadCount);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Poll every 30 seconds for live updates
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id) => {
    try {
      const response = await api.put(`/complaints/citizen/notifications/${id}/read`);
      if (response.data.success) {
        // Optimistically update
        setNotifications(prev =>
          prev.map(notif => notif._id === id ? { ...notif, isRead: true } : notif)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-smooth text-slate-600 focus:outline-none cursor-pointer flex items-center justify-center"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-rose-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-slate-200 shadow-lg py-2 z-55 text-xs">
          <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
            <span className="font-bold text-gov-navy uppercase tracking-wider">Citizen Notifications</span>
            {unreadCount > 0 && (
              <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded text-[10px] font-bold">
                {unreadCount} Unread
              </span>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-slate-105">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-400">
                <MailOpen className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                <p>No new alerts at this time.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`p-3.5 flex items-start space-x-3 transition-smooth ${
                    notif.isRead ? 'bg-white opacity-70' : 'bg-gov-light/30'
                  }`}
                >
                  <AlertCircle className="h-4.5 w-4.5 text-gov-blue shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <p className={`text-slate-800 leading-normal ${!notif.isRead ? 'font-bold' : ''}`}>
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-slate-400 block">
                      {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString()}
                    </span>
                  </div>

                  {!notif.isRead && (
                    <button
                      onClick={() => markAsRead(notif._id)}
                      className="p-1 text-slate-400 hover:text-emerald-600 rounded transition-smooth cursor-pointer"
                      title="Mark as read"
                    >
                      <CheckCircle className="h-4.5 w-4.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
