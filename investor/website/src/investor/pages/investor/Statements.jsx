import React, { useState, useEffect } from 'react';
import { FileText, Printer, Download, TrendingUp, ShieldCheck } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { payoutService } from '../../services/payoutService';
import { useAuth } from '../../context/AuthContext';

export const Statements = () => {
  const { user } = useAuth();
  const [statementData, setStatementData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchStatement = async () => {
      try {
        const res = await payoutService.getStatement();
        if (isMounted && res.success && res.data) {
          setStatementData(res.data);
        }
      } catch (err) {
        console.error('[Statements] Error:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchStatement();
    return () => { isMounted = false; };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Loader message="Generating official account statement..." />
      </DashboardLayout>
    );
  }

  const summary = statementData?.summary || {
    totalInvested: 250000,
    totalReturnsReceived: 2000,
    totalActiveInvestments: 2,
    totalTransactions: 5
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Action Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }} className="no-print">
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>
              Account Statements & Reports
            </h1>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
              Download or print certified ledger statements for personal accounting and tax filing.
            </p>
          </div>

          <Button variant="primary" size="sm" icon={Printer} onClick={handlePrint}>
            Print / Save as PDF
          </Button>
        </div>

        {/* Printable Statement Sheet */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            padding: '40px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
            color: '#1F2421'
          }}
          className="statement-sheet"
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid var(--color-primary)', paddingBottom: '24px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-gold)'
                }}
              >
                <TrendingUp size={24} />
              </div>
              <div>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '22px', fontWeight: '800', color: 'var(--color-primary)' }}>
                  Connect <span style={{ color: 'var(--color-gold)' }}>Invest</span>
                </div>
                <div style={{ fontSize: '11px', color: '#6B7280' }}>
                  Institutional Investor Statement • Confidential
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right', fontSize: '12.5px', color: '#6B7280' }}>
              <div>Generated: <strong>{formatDate(new Date())}</strong></div>
              <div>Reference: <strong>CI-STMT-{Date.now().toString().slice(-8)}</strong></div>
            </div>
          </div>

          {/* Investor Details */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', backgroundColor: '#FAF7F2', padding: '20px', borderRadius: '10px', marginBottom: '32px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>Investor Name</div>
              <strong style={{ fontSize: '15px' }}>{user?.name || 'Rahul Sharma'}</strong>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>Registered Email</div>
              <strong style={{ fontSize: '14px' }}>{user?.email || 'rahul.sharma@investor.com'}</strong>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>Registered Mobile</div>
              <strong style={{ fontSize: '14px' }}>+91 {user?.mobile || '9876543210'}</strong>
            </div>
          </div>

          {/* Portfolio Summary Card */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '36px' }}>
            <div style={{ padding: '16px', borderRadius: '8px', border: '1px solid #E8E2D9' }}>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>Total Capital Invested</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#3B0A11', marginTop: '4px' }}>
                {formatCurrency(summary.totalInvested)}
              </div>
            </div>

            <div style={{ padding: '16px', borderRadius: '8px', border: '1px solid #E8E2D9' }}>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>Total Returns Received</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#10B981', marginTop: '4px' }}>
                {formatCurrency(summary.totalReturnsReceived)}
              </div>
            </div>

            <div style={{ padding: '16px', borderRadius: '8px', border: '1px solid #E8E2D9' }}>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>Active Commitments</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#C8963E', marginTop: '4px' }}>
                {summary.totalActiveInvestments}
              </div>
            </div>
          </div>

          {/* Ledger Table */}
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '14px' }}>
            Comprehensive Transaction Ledger
          </h3>
          <div style={{ overflowX: 'auto', marginBottom: '32px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E8E2D9', textAlign: 'left', color: '#6B7280' }}>
                  <th style={{ padding: '10px 12px' }}>Date</th>
                  <th style={{ padding: '10px 12px' }}>Description</th>
                  <th style={{ padding: '10px 12px' }}>Reference</th>
                  <th style={{ padding: '10px 12px' }}>Amount</th>
                  <th style={{ padding: '10px 12px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {(statementData?.transactions || []).map((t) => (
                  <tr key={t._id} style={{ borderBottom: '1px solid #E8E2D9' }}>
                    <td style={{ padding: '10px 12px', color: '#6B7280' }}>{formatDate(t.createdAt, 'short')}</td>
                    <td style={{ padding: '10px 12px', fontWeight: '600' }}>{t.title}</td>
                    <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: '11px', color: '#6B7280' }}>{t.referenceId}</td>
                    <td style={{ padding: '10px 12px', fontWeight: '700', color: t.type === 'Payout' ? '#10B981' : '#1F2421' }}>
                      {t.type === 'Payout' ? '+' : '-'} {formatCurrency(t.amount)}
                    </td>
                    <td style={{ padding: '10px 12px' }}>{t.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legal Stamp */}
          <div style={{ borderTop: '1px solid #E8E2D9', paddingTop: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px', color: '#8C7E82' }}>
            <div>
              Connect Invest Technologies Pvt. Ltd. • SEBI Intermediary Compliant
            </div>
            <div>
              Computer Generated Statement • No Signature Required
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .statement-sheet, .statement-sheet * {
            visibility: visible;
          }
          .statement-sheet {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </DashboardLayout>
  );
};
