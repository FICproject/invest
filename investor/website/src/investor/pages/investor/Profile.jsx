import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Bell, ShieldCheck, Check } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Loader } from '../../components/common/Loader';
import { investorService } from '../../services/investorService';
import { useAuth } from '../../context/AuthContext';

export const Profile = () => {
  const { user, kycStatus } = useAuth();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [notificationPreferences, setNotificationPreferences] = useState({
    emailAlerts: true,
    smsAlerts: true,
    payoutNotifications: true
  });

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      try {
        const res = await investorService.getProfile();
        if (isMounted && res.success && res.data) {
          setProfileData(res.data);
          if (res.data.profile?.address) {
            setAddress({
              street: res.data.profile.address.street || '',
              city: res.data.profile.address.city || '',
              state: res.data.profile.address.state || '',
              pincode: res.data.profile.address.pincode || ''
            });
          }
          if (res.data.profile?.notificationPreferences) {
            setNotificationPreferences(res.data.profile.notificationPreferences);
          }
        }
      } catch (err) {
        console.error('[Profile] Error:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfile();
    return () => { isMounted = false; };
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');
    setError('');

    try {
      const res = await investorService.updateProfile({
        address,
        notificationPreferences
      });
      if (res.success) {
        setMessage('Profile and preferences updated successfully.');
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Loader message="Loading your investor profile..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Header */}
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>
            Investor Profile & Preferences
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
            Manage your personal contact details, residential address, and notification subscriptions.
          </p>
        </div>

        {message && (
          <div style={{ backgroundColor: '#ECFDF5', color: '#065F46', padding: '12px', borderRadius: '8px', fontSize: '13px' }}>
            {message}
          </div>
        )}

        {error && (
          <div style={{ backgroundColor: '#FEE2E2', color: '#B91C1C', padding: '12px', borderRadius: '8px', fontSize: '13px' }}>
            {error}
          </div>
        )}

        {/* Read-Only Identity Card */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: '14px',
            padding: '24px',
            border: '1px solid var(--border-color)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Verified Identity Information</h3>
            <span className={`badge badge-${kycStatus === 'APPROVED' ? 'confirmed' : 'pending'}`}>
              KYC: {kycStatus}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', fontSize: '13.5px' }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Legal Full Name</div>
              <strong style={{ color: 'var(--text-main)' }}>{user?.name || '-'}</strong>
            </div>

            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Email Address</div>
              <strong style={{ color: 'var(--text-main)' }}>{user?.email || '-'}</strong>
            </div>

            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Mobile Number</div>
              <strong style={{ color: 'var(--text-main)' }}>+91 {user?.mobile || '-'}</strong>
            </div>

            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>PAN Number</div>
              <strong style={{ color: 'var(--color-primary)' }}>{profileData?.profile?.panNumber || profileData?.kyc?.panNumber || 'Not Linked'}</strong>
            </div>
          </div>
        </div>

        {/* Editable Residential Address Form */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: '14px',
            padding: '28px',
            border: '1px solid var(--border-color)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}
        >
          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={18} color="var(--color-gold)" />
              <span>Residential Address</span>
            </h3>

            <Input
              label="Street Address / House No."
              value={address.street}
              onChange={(e) => setAddress({ ...address, street: e.target.value })}
              placeholder="e.g. 402, Lotus Greens, Indiranagar"
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
              <Input
                label="City"
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
                placeholder="e.g. Bengaluru"
              />
              <Input
                label="State"
                value={address.state}
                onChange={(e) => setAddress({ ...address, state: e.target.value })}
                placeholder="e.g. Karnataka"
              />
              <Input
                label="Pincode"
                value={address.pincode}
                onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                placeholder="e.g. 560038"
              />
            </div>

            {/* Notification Preferences */}
            <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bell size={18} color="var(--color-gold)" />
                <span>Notification Subscriptions</span>
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={notificationPreferences.payoutNotifications}
                    onChange={(e) => setNotificationPreferences({ ...notificationPreferences, payoutNotifications: e.target.checked })}
                    style={{ accentColor: 'var(--color-primary)', width: '16px', height: '16px' }}
                  />
                  <span>Receive instant payout credit confirmation alerts</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={notificationPreferences.emailAlerts}
                    onChange={(e) => setNotificationPreferences({ ...notificationPreferences, emailAlerts: e.target.checked })}
                    style={{ accentColor: 'var(--color-primary)', width: '16px', height: '16px' }}
                  />
                  <span>Email statements and monthly portfolio performance digests</span>
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <Button variant="primary" type="submit" size="md" isLoading={isSaving}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};
