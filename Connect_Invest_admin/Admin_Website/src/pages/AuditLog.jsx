import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  Eye,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { adminApi } from '../services/api';

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getAuditLogs({
        entity: entityFilter,
        action: actionFilter
      });
      if (res.data.success) {
        setLogs(res.data.logs);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [entityFilter]);

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Immutable Audit Log</h2>
            <span className="badge badge-emerald">Add-Only Trail</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Tamper-proof record of every administrative action, KYC/KYB decision, terms mutation, and money movement (PRD Section 5.5 M-3).
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <form onSubmit={e => { e.preventDefault(); fetchLogs(); }} style={{ position: 'relative', width: '220px' }}>
            <input
              type="text"
              placeholder="Search actions..."
              value={actionFilter}
              onChange={e => setActionFilter(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '36px' }}
            />
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '13px' }} />
          </form>

          <select
            value={entityFilter}
            onChange={e => setEntityFilter(e.target.value)}
            className="input-field"
            style={{ width: '180px' }}
          >
            <option value="">All Entities</option>
            <option value="InvestorProfile">InvestorProfile (KYC)</option>
            <option value="Company">Company (KYB)</option>
            <option value="Offer">Offer (Listings)</option>
            <option value="Release">Release (Disbursement)</option>
            <option value="Repayment">Repayment (Receipt)</option>
            <option value="Batch">Batch (Payouts)</option>
            <option value="User">User (Account Status)</option>
          </select>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading audit trail from MongoDB...
          </div>
        ) : logs.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No audit records recorded yet.
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp (IST)</th>
                  <th>Actor / Administrator</th>
                  <th>Action</th>
                  <th>Target Entity</th>
                  <th>Reason / Notes</th>
                  <th>State Snapshot</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log._id}>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {new Date(log.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{log.actorId?.name || 'Administrator'}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{log.actorId?.email}</div>
                    </td>
                    <td>
                      <span className="badge badge-indigo" style={{ fontFamily: 'var(--font-mono)' }}>
                        {log.action}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{log.targetEntity}</span>
                      <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        {log.targetId}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem' }}>{log.reason || '—'}</span>
                    </td>
                    <td>
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      >
                        <Eye size={12} />
                        <span>Diff State</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Before / After Diff Inspector Modal */}
      {selectedLog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '720px', padding: '28px', background: 'var(--bg-modal)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '4px' }}>
              Audit Log Event: {selectedLog.action}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
              Target: <strong>{selectedLog.targetEntity}</strong> • ID: <span style={{ fontFamily: 'var(--font-mono)' }}>{selectedLog.targetId}</span>
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <h4 style={{ fontSize: '0.8rem', color: '#f87171', fontWeight: 700, marginBottom: '6px' }}>BEFORE STATE:</h4>
                <pre style={{
                  background: 'rgba(0, 0, 0, 0.5)',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  overflowX: 'auto',
                  maxHeight: '260px'
                }}>
                  {JSON.stringify(selectedLog.before, null, 2) || 'None (New Record)'}
                </pre>
              </div>

              <div>
                <h4 style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 700, marginBottom: '6px' }}>AFTER STATE:</h4>
                <pre style={{
                  background: 'rgba(0, 0, 0, 0.5)',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  color: '#34d399',
                  overflowX: 'auto',
                  maxHeight: '260px'
                }}>
                  {JSON.stringify(selectedLog.after, null, 2) || 'None'}
                </pre>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedLog(null)} className="btn-secondary">
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
