import { useState } from 'react';
import { downloadDocument } from '../services/api.js';

export default function DownloadButton({ document }) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  async function handleDownload() {
    if (downloading) return;
    setDownloading(true);
    setError('');

    try {
      const blob = await downloadDocument(document.id);
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement('a');

      try {
        link.href = url;
        link.download = document.originalName || 'documento';
        window.document.body.appendChild(link);
        link.click();
      } finally {
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="download-action">
      <button
        type="button"
        className="secondary-button"
        disabled={downloading}
        onClick={handleDownload}
        aria-label={`Baixar ${document.originalName || 'documento'}`}
      >
        {downloading ? 'Baixando...' : 'Baixar'}
      </button>
      {error && <p className="error" role="alert">{error}</p>}
    </div>
  );
}