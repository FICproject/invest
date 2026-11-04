import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, ShieldCheck, TrendingUp, Info, Search } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { formatDate, formatRelativeTime } from '../../utils/formatDate';
import { investorService } from '../../services/investorService';

export const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'read'

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

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread' && n.isRead) return false;
    if (filter === 'read' && !n.isRead) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (n.title || '').toLowerCase().includes(q) || (n.message || '').toLowerCase().includes(q);
  });

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

        {/* In-page Search & Filter Bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: '12px',
            padding: '12px 16px',
            border: '1px solid var(--border-color)'
          }}
        >
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { id: 'all', label: 'All' },
              { id: 'unread', label: 'Unread' },
              { id: 'read', label: 'Read' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12.5px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  border: filter === f.id ? '1px solid var(--color-primary)' : '1px solid var(--border-color)',
                  backgroundColor: filter === f.id ? 'var(--color-primary)' : 'transparent',
                  color: filter === f.id ? '#FFFFFF' : 'var(--text-main)',
                  transition: 'all 0.15s'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', minWidth: '220px', flex: 1, maxWidth: '320px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notifications..."
              style={{
                width: '100%',
                height: '36px',
                paddingLeft: '36px',
                paddingRight: '12px',
                fontSize: '13px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-surface-subtle)',
                color: 'var(--text-main)',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {filteredNotifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title={search.trim() ? "No matching notifications" : "All caught up!"}
            description={search.trim() ? `No alerts match "${search}". Try adjusting your keywords.` : "You don't have any notifications at the moment."}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredNotifications.map((n) => (
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
