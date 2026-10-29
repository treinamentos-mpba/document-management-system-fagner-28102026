import DownloadButton from './DownloadButton.jsx';

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

function formatSize(size) {
  if (!Number.isFinite(size) || size < 0) return 'Tamanho indisponivel';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime())
    ? dateFormatter.format(date)
    : 'Data indisponivel';
}

export default function DocumentList({ documents, loading, error, onRefresh }) {
  return (
    <section className="documents-section" aria-labelledby="documents-title">
      <div className="section-heading">
        <h2 id="documents-title">Documentos <span className="count">{documents.length}</span></h2>
        <button type="button" className="secondary-button" onClick={onRefresh} disabled={loading}>
          Atualizar
        </button>
      </div>
      {loading && <p className="empty-state" role="status">Carregando documentos...</p>}
      {error && <p className="error" role="alert">{error}</p>}
      {!loading && !error && documents.length === 0 && (
        <p className="empty-state">Nenhum documento enviado.</p>
      )}
      {documents.length > 0 && (
        <ul className="document-list" aria-busy={loading}>
          {documents.map((document) => (
            <li className="document-row" key={document.id}>
              <div className="document-details">
                <h3>{document.originalName || 'Documento sem nome'}</h3>
                <div className="document-metadata">
                  <span>{formatSize(document.size)}</span>
                  <span>{formatDate(document.createdAt)}</span>
                  {document.owner && <span>{document.owner}</span>}
                </div>
              </div>
              <DownloadButton document={document} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
