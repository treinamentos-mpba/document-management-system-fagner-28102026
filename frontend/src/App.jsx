import { useEffect, useState } from 'react';
import UploadComponent from './components/UploadComponent.jsx';
import DocumentList from './components/DocumentList.jsx';
import { getDocuments } from './services/api.js';
import './App.css';

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');

    async function loadDocuments() {
      try {
        const result = await getDocuments({ signal: controller.signal });
        if (!controller.signal.aborted) setDocuments(result);
      } catch (error) {
        if (!controller.signal.aborted) setError(error.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadDocuments();
    return () => controller.abort();
  }, [revision]);

  function refreshDocuments() {
    setRevision((current) => current + 1);
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <span className="brand">DMS</span>
        <h1>Gestao de documentos</h1>
      </header>
      <UploadComponent onUpload={refreshDocuments} />
      <DocumentList
        documents={documents}
        loading={loading}
        error={error}
        onRefresh={refreshDocuments}
      />
    </main>
  );
}
