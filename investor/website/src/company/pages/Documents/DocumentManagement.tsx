import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Loader, Modal } from '../../components/common';
import { documentService } from '../../services';
import { CompanyDocument } from '../../types';
import {
  FileCheck2,
  UploadCloud,
  FileText,
  Trash2,
  Download,
  AlertCircle,
  CheckCircle,
  FolderKanban,
  FileSpreadsheet,
  Handshake,
  ShieldCheck,
  Filter
} from 'lucide-react';

export const DocumentManagement: React.FC = () => {
  const [documents, setDocuments] = useState<CompanyDocument[]>([]);
  const [activeCategory, setActiveCategory] = useState<'All' | 'Company' | 'Project' | 'Financial' | 'Agreements'>('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Upload Form
  const [docType, setDocType] = useState('Certificate of Incorporation');
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fetchDocs = async () => {
    setIsLoading(true);
    try {
      const res = await documentService.getDocuments();
      setDocuments(res.documents || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return alert('Please select a file.');

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('documentType', docType);
      formData.append('title', title || selectedFile.name);
      formData.append('file', selectedFile);

      await documentService.uploadDocument(formData);
      setModalOpen(false);
      setSelectedFile(null);
      setTitle('');
      await fetchDocs();
    } catch (err: any) {
      alert(err.response?.data?.message || 'File upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this compliance document?')) return;
    try {
      await documentService.deleteDocument(id);
      await fetchDocs();
    } catch (err: any) {
      alert('Failed to delete document');
    }
  };

  const categorizeDoc = (type: string) => {
    if (['Certificate of Incorporation', 'PAN Card', 'GST Certificate', 'MOA & AOA', 'Board Resolution'].includes(type)) {
      return 'Company';
    }
    if (['Project Document', 'Pitch Deck'].includes(type)) {
      return 'Project';
    }
    if (['Financial Statement', 'Audit Report'].includes(type)) {
      return 'Financial';
    }
    if (['Funding Agreement', 'Repayment Agreement'].includes(type)) {
      return 'Agreements';
    }
    return 'Company';
  };

  const filteredDocs = activeCategory === 'All'
    ? documents
    : documents.filter(doc => categorizeDoc(doc.documentType) === activeCategory);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            Documents & Compliance
          </h1>
          <p className="text-xs text-slate-500">
            Upload company documents, project documents, manage financial statements, view agreements, verification status and download files.
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="font-bold">
          <UploadCloud className="w-4 h-4 mr-1.5" />
          Upload Document
        </Button>
      </div>

      {/* Category Pills Filter */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#F2EBD9] pb-3">
        {[
          { key: 'All', label: 'All Documents' },
          { key: 'Company', label: 'Company Documents' },
          { key: 'Project', label: 'Project Documents' },
          { key: 'Financial', label: 'Financial Statements' },
          { key: 'Agreements', label: 'Funding & Repayment Agreements' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveCategory(tab.key as any)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeCategory === tab.key
                ? 'bg-[#F4B41A] text-[#1F2421] shadow-sm'
                : 'bg-white border border-[#EFE8D8] text-slate-600 hover:border-[#DE8E0A]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Loader text="Loading secure document repository..." />
      ) : filteredDocs.length === 0 ? (
        <Card className="p-12 text-center text-xs text-slate-500">
          No documents found in this category. Use "Upload Document" to add files.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map((doc) => (
            <Card key={doc._id} className="p-5 flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF9ED] text-[#B37400] flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <Badge
                    variant={
                      doc.status === 'Approved'
                        ? 'success'
                        : doc.status === 'Pending'
                        ? 'warning'
                        : 'danger'
                    }
                  >
                    {doc.status}
                  </Badge>
                </div>

                <h3 className="font-bold text-sm text-slate-900 mb-1 leading-snug">
                  {doc.title}
                </h3>
                <span className="text-[11px] font-medium text-[#DE8E0A] bg-[#FFF9ED] px-2 py-0.5 rounded-md inline-block mb-3">
                  {doc.documentType}
                </span>

                {doc.remarks && (
                  <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 mb-3">
                    <span className="font-semibold">Review: </span>{doc.remarks}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-[#F2EBD9] flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">
                  {new Date(doc.createdAt).toLocaleDateString()}
                </span>
                <div className="flex items-center space-x-2">
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="p-1.5 text-slate-600 hover:text-[#DE8E0A] hover:bg-[#FFF9ED] rounded-lg transition"
                    title="Download document"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleDelete(doc._id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Delete document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Document Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Upload Compliance or Agreement Document"
      >
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Document Classification *
            </label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
            >
              <optgroup label="Company Documents">
                <option value="Certificate of Incorporation">Certificate of Incorporation (COI)</option>
                <option value="PAN Card">Company PAN Card</option>
                <option value="GST Certificate">GST Certificate</option>
                <option value="MOA & AOA">Memorandum & Articles of Association (MOA & AOA)</option>
                <option value="Board Resolution">Board Resolution</option>
              </optgroup>
              <optgroup label="Project Documents">
                <option value="Project Document">Project Execution Document</option>
                <option value="Pitch Deck">Pitch Deck / Business Presentation</option>
              </optgroup>
              <optgroup label="Financial Statements">
                <option value="Financial Statement">Audited Financial Statement (P&L / Balance Sheet)</option>
                <option value="Audit Report">Statutory Audit Report</option>
              </optgroup>
              <optgroup label="Funding & Repayment Agreements">
                <option value="Funding Agreement">Funding / Subscription Agreement</option>
                <option value="Repayment Agreement">Debt Servicing / Repayment Agreement</option>
              </optgroup>
              <option value="Other">Other Document</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Document Title / Label *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. FY25 Audited Balance Sheet or Project Expansion Plan"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Choose File (PDF, PNG, JPG) *
            </label>
            <input
              type="file"
              required
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#FFF9ED] file:text-[#B37400] hover:file:bg-[#F4B41A]"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isUploading}>
              Upload Document
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
