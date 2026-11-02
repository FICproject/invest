import React from 'react';
import {
  FileSpreadsheet,
  Download,
  Users,
  Building2,
  Layers,
  Coins
} from 'lucide-react';
import { adminApi } from '../services/api';

export default function Reports() {
  const reports = [
    {
      id: 'investors',
      title: 'Investor Master Report',
      description: 'Comprehensive roster of all investors, PAN records, KYC decisions, bank accounts, and portfolio totals.',
      icon: Users,
      color: 'var(--cyan-main)'
    },
    {
      id: 'companies',
      title: 'Corporate KYB Directory',
      description: 'Corporate listings, registration details, company owner contacts, verified bank accounts, and cooling-off timestamps.',
      icon: Building2,
      color: 'var(--indigo-main)'
    },
    {
      id: 'offers',
      title: 'Investment Offers & Performance',
      description: 'Complete data on project offerings, funding targets, raised amounts, lock-in tenures, and monthly BPS return rates.',
      icon: Layers,
      color: 'var(--emerald-main)'
    },
    {
      id: 'payouts',
      title: 'Investor Payouts & UTR Log',
      description: 'Monthly return and principal distribution records, bank UTR references, batch identifiers, and failure audit notes.',
      icon: Coins,
      color: 'var(--amber-main)'
    }
  ];

  const handleDownload = reportName => {
    window.open(adminApi.getExportUrl(reportName), '_blank');
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Reports & Data Export (PRD M-2)</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Export real-time CSV financial records and compliance statements directly from local MongoDB collections.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {reports.map(rep => {
          const Icon = rep.icon;
          return (
            <div key={rep.id} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}>
                  <Icon size={20} color={rep.color} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>{rep.title}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  {rep.description}
                </p>
              </div>

              <div style={{ marginTop: '24px' }}>
                <button
                  onClick={() => handleDownload(rep.id)}
                  className="btn-primary"
                  style={{ width: '100%' }}
                >
                  <Download size={15} />
                  <span>Download CSV Export</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
