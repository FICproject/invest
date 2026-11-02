import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, ShieldCheck, TrendingUp, Info } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { formatDate, formatRelativeTime } from '../../utils/formatDate';
import { investorService } from '../../services/investorService';

export const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchNotifications = async () => {
      try {
        const res = await investorService.getNotifications();
        if (isMounted && res.success && res.data) {
          setNotifications(res.data);
        }
      } catch (err) {
        console.error('[Notifications] Error:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchNotifications();
    return () => { isMounted = false; };
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await investorService.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('[Notifications] Mark read error:', err.message);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'payout':
        return <CheckCircle2 size={20} color="#10B981" />;
      case 'kyc':
        return <ShieldCheck size={20} color="var(--color-gold)" />;
      case 'investment':
        return <TrendingUp size={20} color="var(--color-primary)" />;
      default:
        return <Info size={20} color="var(--text-muted)" />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Loader message="Loading your in-app notifications..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>
            Notifications & Alerts
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
            Real-time updates regarding payout distributions, investment confirmations, and compliance reviews.
          </p>
        </div>

        {notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="All caught up!"
            description="You don't have any notifications at the moment."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => !n.isRead && handleMarkRead(n._id)}
                style={{
                  backgroundColor: n.isRead ? 'var(--bg-surface)' : 'var(--bg-surface-subtle)',
                  borderRadius: '12px',
                  padding: '18px 20px',
                  border: n.isRead ? '1px solid var(--border-color)' : '1px solid var(--color-primary-light)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  cursor: n.isRead ? 'default' : 'pointer'
                }}
              >
                <div style={{ marginTop: '2px', flexShrink: 0 }}>
                  {getIcon(n.type)}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <h4 style={{ fontSize: '14.5px', fontWeight: '700', color: 'var(--text-main)' }}>
                      {n.title}
                    </h4>
                    <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                      {formatRelativeTime(n.createdAt)}
                    </span>
                  </div>

                  <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {n.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
