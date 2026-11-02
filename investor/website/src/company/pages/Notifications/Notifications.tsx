import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Loader } from '../../components/common';
import { notificationService } from '../../services';
import { NotificationItem } from '../../types';
import { Bell, CheckCheck, Clock, ShieldCheck, Coins, AlertCircle } from 'lucide-react';

export const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifs = async () => {
    setIsLoading(true);
    try {
      const res = await notificationService.getNotifications();
      setNotifications(res.notifications || []);
      setUnreadCount(res.unreadCount || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAsRead('all');
      await fetchNotifs();
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkSingleRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      await fetchNotifs();
    } catch (e) {
      console.error(e);
    }
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'urgent':
        return 'danger';
      case 'high':
        return 'warning';
      default:
        return 'info';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            Notification Center & Event Dispatches
          </h1>
          <p className="text-xs text-slate-500">
            Real-time updates on funding milestones, investor commitments, dividend dates, and regulatory audits
          </p>
        </div>

        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            <CheckCheck className="w-4 h-4 mr-1.5" />
            Mark All as Read ({unreadCount})
          </Button>
        )}
      </div>

      {isLoading ? (
        <Loader text="Retrieving notification dispatches..." />
      ) : notifications.length === 0 ? (
        <Card className="p-12 text-center text-xs text-slate-500">
          No notifications in your corporate inbox.
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((item) => (
            <Card
              key={item._id}
              className={`p-5 transition flex items-start justify-between gap-4 ${
                !item.isRead ? 'border-brand-200 bg-brand-50/20' : 'bg-white'
              }`}
            >
              <div className="flex items-start space-x-3.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    item.priority === 'urgent'
                      ? 'bg-rose-100 text-rose-600'
                      : 'bg-brand-100 text-brand-600'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                    <Badge variant={getPriorityBadge(item.priority)}>{item.category}</Badge>
                    {!item.isRead && (
                      <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.message}</p>
                  <span className="text-[10px] text-slate-400 block pt-1">
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {!item.isRead && (
                <button
                  onClick={() => handleMarkSingleRead(item._id)}
                  className="text-xs font-bold text-brand-600 hover:underline flex-shrink-0"
                >
                  Mark read
                </button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

