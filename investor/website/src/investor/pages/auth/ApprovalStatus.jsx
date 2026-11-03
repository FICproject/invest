import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Radio,
  FileText,
  UploadCloud,
  ArrowRight,
  RefreshCw,
  LogOut,
  Mail,
  Phone,
  Building,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { initRealTimeSync } from '../../../services/realTimeSync';
import axios from 'axios';

export const ApprovalStatus = () => {
  const navigate = useNavigate();
  const { user, token, logout, refreshMe } = useAuth();

  const [registrationStatus, setRegistrationStatus] = useState(
    user?.registrationStatus || 'Pending Approval'
  );
  const [rejectionReason, setRejectionReason] = useState(
    user?.rejectionReason || user?.adminRemarks || ''
  );
  const [checking, setChecking] = useState(false);
  const [showResubmitModal, setShowResubmitModal] = useState(false);

  // Resubmission Form State
  const [formData, setFormData] = useState({
    name: user?.name || '',
    pan: '',
    panCardUrl: '',
    identityProofUrl: '',
    cancelledChequeUrl: '',
    bankName: '',
    accountNumber: '',
    ifscCode: ''
  });
  const [uploadingField, setUploadingField] = useState(null);
  const [resubmitting, setResubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Auto redirect if already approved
  useEffect(() => {
    if (user?.registrationStatus === 'Approved') {
      navigate('/investor/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Real-Time SSE Listener
  useEffect(() => {
    const cleanup = initRealTimeSync(event => {
      if (
        event?.type === 'DATA_SYNC' &&
        event.entity === 'REGISTRATION_DECISION'
      ) {
        const payload = event.payload || {};
        const currentUserId = user?._id || user?.id;

        if (String(payload.userId) === String(currentUserId) || String(payload.id) === String(currentUserId)) {
          console.log('[ApprovalStatus] Real-time decision event received for current investor:', payload);
          setRegistrationStatus(payload.status || payload.decision);
          setRejectionReason(payload.reason || '');

          if (payload.status === 'Approved' || payload.decision === 'Approved') {
            setSuccessMsg('Congratulations! Your account has been approved by compliance. Redirecting to your dashboard...');
            setTimeout(async () => {
              await refreshMe();
              navigate('/investor/dashboard', { replace: true });
            }, 1500);
          }
        }
      }
    });

    return () => {
      if (typeof cleanup === 'function') cleanup();
    };
  }, [user, navigate, refreshMe]);

  // Check Status manually
  const checkCurrentStatus = async () => {
    try {
      setChecking(true);
      const res = await axios.get('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${token || localStorage.getItem('ci_investor_token')}` }
      });

      if (res.data?.success) {
        const u = res.data.data?.user;
        const status = u?.registrationStatus || 'Approved';
        setRegistrationStatus(status);
        setRejectionReason(u?.rejectionReason || u?.adminRemarks || '');

        if (status === 'Approved') {
          navigate('/investor/dashboard', { replace: true });
        }
      }
    } catch (err) {
      console.warn('Error checking status:', err);
    } finally {
      setChecking(false);
    }
  };

  // Upload Document Helper
  const handleFileUpload = async (e, fieldName) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append('document', file);

    try {
      setUploadingField(fieldName);
      const res = await axios.post('http://localhost:5000/api/auth/upload-doc', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.success) {
        setFormData(prev => ({
          ...prev,
          [fieldName]: res.data.data.url
        }));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'File upload failed. Ensure JPG, PNG, or PDF under 10MB.');
    } finally {
      setUploadingField(null);
    }
  };

  // Resubmit Application
  const handleResubmitSubmit = async (e) => {
    e.preventDefault();
    try {
      setResubmitting(true);
      setErrorMsg('');

      const res = await axios.post(
        'http://localhost:5000/api/auth/resubmit',
        formData,
        { headers: { Authorization: `Bearer ${token || localStorage.getItem('ci_investor_token')}` } }
      );

      if (res.data?.success) {
        setShowResubmitModal(false);
        setRegistrationStatus('Pending Approval');
        setRejectionReason('');
        setSuccessMsg('Your updated details and documents have been submitted for Admin re-evaluation.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Resubmission failed.');
    } finally {
      setResubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0A0E1A',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}
    >
      {/* Top Bar */}
      <header
        style={{
          padding: '18px 36px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#0F1523'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: '#0047BA',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.1rem'
            }}
          >
            CI
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em' }}>CONNECT INVEST</div>
            <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Investor Compliance Verification</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#10B981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              padding: '5px 12px',
              borderRadius: '9999px',
              border: '1px solid rgba(16, 185, 129, 0.25)'
            }}
          >
            <Radio size={12} className="animate-pulse" />
            <span>Live Sync Active</span>
          </div>

          <button
            onClick={logout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              backgroundColor: 'transparent',
              color: '#E2E8F0',
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Status Container */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px'
        }}
      >
        <div
          style={{
            maxWidth: '620px',
            width: '100%',
            backgroundColor: '#131B2E',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '40px 36px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            textAlign: 'center'
          }}
        >
          {/* Status Badge Icon */}
          {registrationStatus === 'Approved' ? (
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                backgroundColor: 'rgba(22, 163, 74, 0.15)',
                color: '#22C55E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                border: '2px solid rgba(34, 197, 94, 0.3)'
              }}
            >
              <CheckCircle2 size={38} />
            </div>
          ) : registrationStatus === 'Rejected' ? (
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                backgroundColor: 'rgba(220, 38, 38, 0.15)',
                color: '#EF4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                border: '2px solid rgba(239, 68, 68, 0.3)'
              }}
            >
              <XCircle size={38} />
            </div>
          ) : registrationStatus === 'Resubmission Required' ? (
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                color: '#F59E0B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                border: '2px solid rgba(245, 158, 11, 0.3)'
              }}
            >
              <AlertTriangle size={38} />
            </div>
          ) : (
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0, 71, 186, 0.15)',
                color: '#3B82F6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                border: '2px solid rgba(59, 130, 246, 0.3)'
              }}
            >
              <Clock size={38} className="animate-spin-slow" />
            </div>
          )}

          {/* Heading */}
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 10px 0' }}>
            {registrationStatus === 'Approved'
              ? 'Registration Approved!'
              : registrationStatus === 'Rejected'
              ? 'Registration Ineligible'
              : registrationStatus === 'Resubmission Required'
              ? 'Information Resubmission Required'
              : 'Application Under Compliance Review'}
          </h2>

          <p style={{ fontSize: '0.92rem', color: '#94A3B8', lineHeight: 1.6, margin: '0 0 28px 0' }}>
            {registrationStatus === 'Approved'
              ? 'Your account has been fully verified. You can now access your investor portfolio, review active corporate offers, and make investments.'
              : registrationStatus === 'Rejected'
              ? 'Unfortunately, your investor registration could not be approved based on our initial compliance verification.'
              : registrationStatus === 'Resubmission Required'
              ? 'Our compliance team reviewed your submission and requested updates to your details or document uploads.'
              : 'Thank you for registering with Connect Invest! Your documents and identity details have been submitted to our compliance desk for verification.'}
          </p>

          {/* Dynamic Banner for Rejection / Remarks */}
          {rejectionReason && (
            <div
              style={{
                backgroundColor:
                  registrationStatus === 'Rejected'
                    ? 'rgba(220, 38, 38, 0.1)'
                    : 'rgba(245, 158, 11, 0.1)',
                border: `1px solid ${
                  registrationStatus === 'Rejected' ? '#7F1D1D' : '#78350F'
                }`,
                borderRadius: '14px',
                padding: '16px 20px',
                textAlign: 'left',
                marginBottom: '28px'
              }}
            >
              <div
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: registrationStatus === 'Rejected' ? '#F87171' : '#FBBF24',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '6px'
                }}
              >
                Compliance Feedback & Remarks:
              </div>
              <div style={{ fontSize: '0.88rem', color: '#F1F5F9', lineHeight: 1.5 }}>
                {rejectionReason}
              </div>
            </div>
          )}

          {/* User Details Summary Card */}
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              padding: '18px 22px',
              textAlign: 'left',
              marginBottom: '32px'
            }}
          >
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '12px' }}>
              Application Summary
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.84rem' }}>
              <div><span style={{ color: '#94A3B8' }}>Applicant:</span> <strong>{user?.name}</strong></div>
              <div><span style={{ color: '#94A3B8' }}>Email:</span> <strong>{user?.email}</strong></div>
              <div><span style={{ color: '#94A3B8' }}>Mobile:</span> <strong>{user?.mobile || 'N/A'}</strong></div>
              <div><span style={{ color: '#94A3B8' }}>Role:</span> <strong>Investor</strong></div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {registrationStatus === 'Resubmission Required' && (
              <button
                onClick={() => setShowResubmitModal(true)}
                style={{
                  width: '100%',
                  padding: '13px 20px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: '#F59E0B',
                  color: '#000000',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <UploadCloud size={18} />
                <span>Update Details & Resubmit Documents</span>
              </button>
            )}

            {registrationStatus === 'Approved' ? (
              <button
                onClick={() => navigate('/investor/dashboard')}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: '#0047BA',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <span>Proceed to Investor Dashboard</span>
                <ArrowRight size={18} />
              </button>
            ) : (
              <button
                onClick={checkCurrentStatus}
                disabled={checking}
                style={{
                  width: '100%',
                  padding: '13px 20px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <RefreshCw size={16} className={checking ? 'animate-spin' : ''} />
                <span>{checking ? 'Checking Status...' : 'Check Status Now'}</span>
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Resubmission Modal */}
      {showResubmitModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(6px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setShowResubmitModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '650px',
              maxHeight: '90vh',
              backgroundColor: '#131B2E',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>Resubmit Investor Details</h3>
              <button onClick={() => setShowResubmitModal(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>

            <form onSubmit={handleResubmitSubmit} style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {errorMsg && (
                <div style={{ padding: '12px', backgroundColor: '#7F1D1D', borderRadius: '8px', color: '#FECACA', fontSize: '0.85rem' }}>{errorMsg}</div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#94A3B8', marginBottom: '6px' }}>PAN Number</label>
                <input
                  type="text"
                  placeholder="ABCDE1234F"
                  value={formData.pan}
                  onChange={e => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', backgroundColor: '#0A0E1A', border: '1px solid #334155', color: '#FFFFFF' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#94A3B8', marginBottom: '6px' }}>Upload Clear PAN Card (PDF/JPG/PNG)</label>
                <input
                  type="file"
                  onChange={e => handleFileUpload(e, 'panCardUrl')}
                  style={{ width: '100%', color: '#94A3B8' }}
                />
                {uploadingField === 'panCardUrl' && <span style={{ fontSize: '0.78rem', color: '#F59E0B' }}>Uploading document...</span>}
                {formData.panCardUrl && <span style={{ fontSize: '0.78rem', color: '#22C55E' }}>✓ File uploaded successfully</span>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#94A3B8', marginBottom: '6px' }}>Upload Address & Identity Proof</label>
                <input
                  type="file"
                  onChange={e => handleFileUpload(e, 'identityProofUrl')}
                  style={{ width: '100%', color: '#94A3B8' }}
                />
                {uploadingField === 'identityProofUrl' && <span style={{ fontSize: '0.78rem', color: '#F59E0B' }}>Uploading document...</span>}
                {formData.identityProofUrl && <span style={{ fontSize: '0.78rem', color: '#22C55E' }}>✓ File uploaded successfully</span>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#94A3B8', marginBottom: '6px' }}>Upload Cancelled Cheque / Bank Statement</label>
                <input
                  type="file"
                  onChange={e => handleFileUpload(e, 'cancelledChequeUrl')}
                  style={{ width: '100%', color: '#94A3B8' }}
                />
                {uploadingField === 'cancelledChequeUrl' && <span style={{ fontSize: '0.78rem', color: '#F59E0B' }}>Uploading document...</span>}
                {formData.cancelledChequeUrl && <span style={{ fontSize: '0.78rem', color: '#22C55E' }}>✓ File uploaded successfully</span>}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowResubmitModal(false)}
                  style={{ padding: '10px 18px', borderRadius: '10px', border: '1px solid #334155', background: 'transparent', color: '#94A3B8', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resubmitting}
                  style={{ padding: '10px 22px', borderRadius: '10px', border: 'none', backgroundColor: '#0047BA', color: '#FFFFFF', fontWeight: 700, cursor: 'pointer' }}
                >
                  {resubmitting ? 'Submitting Updates...' : 'Submit for Re-evaluation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
