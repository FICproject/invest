import React, { useState } from 'react';
import { X, Download, ExternalLink, ZoomIn, ZoomOut, RotateCw, FileText, AlertCircle } from 'lucide-react';

export default function DocumentPreviewModal({ isOpen, onClose, documentUrl, title, documentType }) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  if (!isOpen || !documentUrl) return null;

  // Determine full preview URL
  const normalizedUrl = documentUrl.startsWith('http')
    ? documentUrl
    : `http://localhost:5000${documentUrl.startsWith('/') ? '' : '/'}${documentUrl}`;

  const isPdf = documentUrl.toLowerCase().endsWith('.pdf');
  const filename = documentUrl.split('/').pop();
  const downloadUrl = `http://localhost:5000/api/v1/admin/documents/${filename}/download`;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1050px',
          height: '90vh',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#F8FAFC'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: isPdf ? '#FEE2E2' : '#EFF6FF',
                color: isPdf ? '#DC2626' : '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FileText size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0F172A' }}>
                {title || 'Document Preview'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>
                {filename} {documentType ? `• ${documentType}` : ''}
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {!isPdf && (
              <>
                <button
                  onClick={handleZoomIn}
                  title="Zoom In"
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    background: '#FFFFFF',
                    cursor: 'pointer',
                    color: '#475569'
                  }}
                >
                  <ZoomIn size={18} />
                </button>
                <button
                  onClick={handleZoomOut}
                  title="Zoom Out"
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    background: '#FFFFFF',
                    cursor: 'pointer',
                    color: '#475569'
                  }}
                >
                  <ZoomOut size={18} />
                </button>
                <button
                  onClick={handleRotate}
                  title="Rotate"
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    background: '#FFFFFF',
                    cursor: 'pointer',
                    color: '#475569'
                  }}
                >
                  <RotateCw size={18} />
                </button>
              </>
            )}

            <a
              href={downloadUrl}
              download
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                backgroundColor: '#0047BA',
                color: '#FFFFFF',
                fontSize: '0.82rem',
                fontWeight: 600,
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'background 0.15s ease'
              }}
            >
              <Download size={16} />
              <span>Download</span>
            </a>

            <a
              href={normalizedUrl}
              target="_blank"
              rel="noreferrer"
              title="Open in new window"
              style={{
                padding: '8px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                background: '#FFFFFF',
                color: '#475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none'
              }}
            >
              <ExternalLink size={18} />
            </a>

            <button
              onClick={onClose}
              title="Close Preview"
              style={{
                padding: '8px',
                borderRadius: '8px',
                border: 'none',
                background: '#F1F5F9',
                cursor: 'pointer',
                color: '#64748B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Viewer Body */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0F172A',
            padding: '24px',
            position: 'relative'
          }}
        >
          {isPdf ? (
            <iframe
              src={`${normalizedUrl}#toolbar=1`}
              title={title}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF'
              }}
            />
          ) : (
            <div
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                maxHeight: '100%',
                maxWidth: '100%'
              }}
            >
              <img
                src={normalizedUrl}
                alt={title}
                onError={e => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement.innerHTML = `
                    <div style="color: #94A3B8; text-align: center; padding: 40px;">
                      <p style="font-weight: 600; font-size: 16px;">Preview unavailable for this format</p>
                      <p style="font-size: 13px;">Please click Download above to inspect the file.</p>
                    </div>
                  `;
                }}
                style={{
                  maxWidth: '100%',
                  maxHeight: '75vh',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

