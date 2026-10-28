import { useCallback, useEffect, useState } from 'react';
import UploadForm from '../components/UploadForm';
import DocumentList from '../components/DocumentList';
import { listDocuments } from '../services/documentsApi';

// Página principal: composição do upload com a listagem de documentos.
export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refreshDocuments = useCallback(async () => {
    setError('');
    try {
      setDocuments(await listDocuments());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshDocuments();
  }, [refreshDocuments]);

  return (
    <section style={{ display: 'grid', gap: '1.5rem' }}>
      <section>
        <h2>Enviar documento</h2>
        <UploadForm onUploaded={refreshDocuments} />
      </section>
      <section>
        <h2>Documentos</h2>
        {error && <p role="alert" style={{ color: 'crimson' }}>{error}</p>}
        {loading ? <p>Carregando documentos...</p> : <DocumentList documents={documents} />}
      </section>
    </section>
  );
}
