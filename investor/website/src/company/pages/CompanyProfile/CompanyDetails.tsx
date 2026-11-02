import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Loader, Modal } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { companyService } from '../../services';
import {
  Building2,
  Users,
  ShieldCheck,
  FileText,
  MapPin,
  Globe,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

export const CompanyDetails: React.FC = () => {
  const { company, refreshCompany } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'directors' | 'verification'>('profile');
  const [formData, setFormData] = useState<any>({ ...company });
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  // Director Modal
  const [directorModalOpen, setDirectorModalOpen] = useState(false);
  const [newDirector, setNewDirector] = useState({
    name: '',
    din: '',
    pan: '',
    email: '',
    mobile: '',
    designation: 'Director',
    sharesOwnedPercentage: 0,
  });

  useEffect(() => {
    if (company) {
      setFormData({
        ...company,
        street: company.registeredAddress?.street || '',
        city: company.registeredAddress?.city || '',
        state: company.registeredAddress?.state || '',
        pincode: company.registeredAddress?.pincode || '',
      });
    }
  }, [company]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMsg({ type: '', text: '' });

    try {
      await companyService.updateProfile({
        ...formData,
        registeredAddress: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          country: 'India',
        },
      });
      await refreshCompany();
      setStatusMsg({ type: 'success', text: 'Company details saved successfully!' });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update company.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddDirector = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await companyService.addDirector(newDirector);
      await refreshCompany();
      setDirectorModalOpen(false);
      setNewDirector({
        name: '',
        din: '',
        pan: '',
        email: '',
        mobile: '',
        designation: 'Director',
        sharesOwnedPercentage: 0,
      });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add director');
    }
  };

  const handleRemoveDirector = async (idx: number) => {
    if (!window.confirm('Are you sure you want to remove this director record?')) return;
    try {
      await companyService.removeDirector(idx);
      await refreshCompany();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to remove director');
    }
  };

  const handleSubmitVerification = async () => {
    try {
      await companyService.submitVerification();
      await refreshCompany();
      setStatusMsg({ type: 'success', text: 'Verification application submitted to platform compliance!' });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.response?.data?.message || 'Verification submission error' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex border-b border-[#EFE8D8] space-x-6 pb-2">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center space-x-2 pb-2 text-sm font-bold border-b-2 transition ${
            activeTab === 'profile'
              ? 'border-[#DE8E0A] text-[#DE8E0A]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Entity & Incorporation</span>
        </button>

        <button
          onClick={() => setActiveTab('directors')}
          className={`flex items-center space-x-2 pb-2 text-sm font-bold border-b-2 transition ${
            activeTab === 'directors'
              ? 'border-[#DE8E0A] text-[#DE8E0A]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Directors & Promoters</span>
        </button>

        <button
          onClick={() => setActiveTab('verification')}
          className={`flex items-center space-x-2 pb-2 text-sm font-bold border-b-2 transition ${
            activeTab === 'verification'
              ? 'border-[#DE8E0A] text-[#DE8E0A]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Verification & Compliance</span>
        </button>
      </div>

      {statusMsg.text && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center space-x-2 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* 1. Entity & Incorporation Details Tab */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <Card className="space-y-6">
            <h3 className="text-base font-bold text-slate-900 border-b border-pink-50 pb-3">
              Corporate Master Data
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Legal Entity Name</label>
                <input
                  type="text"
                  value={formData.legalName || ''}
                  onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Brand / Trading Name</label>
                <input
                  type="text"
                  value={formData.tradingName || ''}
                  onChange={(e) => setFormData({ ...formData, tradingName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Corporate ID Number (CIN)</label>
                <input
                  type="text"
                  value={formData.cin || ''}
                  onChange={(e) => setFormData({ ...formData, cin: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono uppercase focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Company PAN</label>
                <input
                  type="text"
                  value={formData.pan || ''}
                  onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono uppercase focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">GSTIN Number</label>
                <input
                  type="text"
                  value={formData.gstin || ''}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono uppercase focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Website URL</label>
                <input
                  type="text"
                  value={formData.website || ''}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-sm font-bold text-slate-800 mb-3">Capital Structure (Authorized & Paid-up)</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Authorized Capital (₹)</label>
                  <input
                    type="number"
                    value={formData.authorizedCapital || 0}
                    onChange={(e) => setFormData({ ...formData, authorizedCapital: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Paid-Up Capital (₹)</label>
                  <input
                    type="number"
                    value={formData.paidUpCapital || 0}
                    onChange={(e) => setFormData({ ...formData, paidUpCapital: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Total Shares Count</label>
                  <input
                    type="number"
                    value={formData.totalShares || 0}
                    onChange={(e) => setFormData({ ...formData, totalShares: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Share Face Value (₹)</label>
                  <input
                    type="number"
                    value={formData.shareFaceValue || 10}
                    onChange={(e) => setFormData({ ...formData, shareFaceValue: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-sm font-bold text-slate-800 mb-3">Registered Office Address</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Street Address</label>
                  <input
                    type="text"
                    value={formData.street || ''}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city || ''}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={formData.state || ''}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={formData.pincode || ''}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button type="submit" isLoading={isSaving} className="px-8 font-bold">
                Save Company Information
              </Button>
            </div>
          </Card>
        </form>
      )}

      {/* 2. Directors Tab */}
      {activeTab === 'directors' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Directors & Key Management Personnel</h3>
              <p className="text-xs text-slate-500">
                Authorized signatories registered under MCA for statutory board actions
              </p>
            </div>
            <Button size="sm" onClick={() => setDirectorModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" />
              Add Director
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {company?.directors && company.directors.length > 0 ? (
              company.directors.map((dir, idx) => (
                <Card key={idx} className="p-5 flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-slate-900">{dir.name}</span>
                      <Badge variant="purple">{dir.designation}</Badge>
                    </div>
                    <div className="text-xs text-slate-500 space-y-1">
                      <p>DIN: <strong className="font-mono text-slate-700">{dir.din || 'N/A'}</strong></p>
                      <p>PAN: <strong className="font-mono text-slate-700">{dir.pan || 'N/A'}</strong></p>
                      <p>Email: {dir.email} • Mobile: {dir.mobile}</p>
                      <p>Equity Ownership: <strong className="text-brand-600">{dir.sharesOwnedPercentage || 0}%</strong></p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveDirector(idx)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </Card>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6">No directors registered.</p>
            )}
          </div>
        </div>
      )}

      {/* 3. Verification & Compliance Status Tab */}
      {activeTab === 'verification' && (
        <Card className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-brand-50 to-pink-50/40 border border-pink-100">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-wider text-brand-600">
                PLATFORM DUE DILIGENCE
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">Verification Status</h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Admin review is mandatory before publishing live public funding campaigns.
              </p>
            </div>
            <div>
              <Badge
                variant={
                  company?.verificationStatus === 'Verified'
                    ? 'success'
                    : company?.verificationStatus === 'In Review'
                    ? 'warning'
                    : 'danger'
                }
              >
                {company?.verificationStatus}
              </Badge>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-800">Verification Checkpoints</h4>
            <div className="space-y-3">
              {[
                { label: 'Corporate Entity Registration (MCA / CIN match)', ok: !!company?.cin },
                { label: 'Valid Tax Identification (Company PAN card)', ok: !!company?.pan },
                { label: 'Minimum 1 Verified Executive Director / Signatory', ok: (company?.directors?.length || 0) > 0 },
                { label: 'Compliance & Anti-Money Laundering review', ok: company?.verificationStatus === 'Verified' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 text-xs"
                >
                  <span className="font-medium text-slate-700">{item.label}</span>
                  {item.ok ? (
                    <span className="flex items-center text-emerald-600 font-bold">
                      <CheckCircle className="w-4 h-4 mr-1" /> Satisfied
                    </span>
                  ) : (
                    <span className="flex items-center text-amber-600 font-semibold">
                      <AlertCircle className="w-4 h-4 mr-1" /> Pending
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {company?.verificationStatus !== 'Verified' && (
            <div className="pt-4 border-t border-slate-100">
              <Button onClick={handleSubmitVerification} className="font-bold">
                Submit Profile for Platform Verification
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Add Director Modal */}
      <Modal
        isOpen={directorModalOpen}
        onClose={() => setDirectorModalOpen(false)}
        title="Add Executive Director / Signatory"
      >
        <form onSubmit={handleAddDirector} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Director Full Name *</label>
            <input
              type="text"
              required
              value={newDirector.name}
              onChange={(e) => setNewDirector({ ...newDirector, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">DIN (8 Digits)</label>
              <input
                type="text"
                value={newDirector.din}
                onChange={(e) => setNewDirector({ ...newDirector, din: e.target.value })}
                placeholder="08945621"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">PAN Card Number</label>
              <input
                type="text"
                value={newDirector.pan}
                onChange={(e) => setNewDirector({ ...newDirector, pan: e.target.value })}
                placeholder="ABCDE1234F"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email *</label>
              <input
                type="email"
                required
                value={newDirector.email}
                onChange={(e) => setNewDirector({ ...newDirector, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mobile *</label>
              <input
                type="text"
                required
                value={newDirector.mobile}
                onChange={(e) => setNewDirector({ ...newDirector, mobile: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Designation</label>
              <input
                type="text"
                value={newDirector.designation}
                onChange={(e) => setNewDirector({ ...newDirector, designation: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Equity Ownership (%)</label>
              <input
                type="number"
                value={newDirector.sharesOwnedPercentage}
                onChange={(e) =>
                  setNewDirector({ ...newDirector, sharesOwnedPercentage: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3">
            <Button variant="outline" type="button" onClick={() => setDirectorModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Director Record</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

