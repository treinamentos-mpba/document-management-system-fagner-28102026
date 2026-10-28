import { getDownloadUrl } from '../services/documentsApi';

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleString('pt-BR');
}

// Lista de documentos com link de download.
export default function DocumentList({ documents }) {
  if (documents.length === 0) {
    return <p>Nenhum documento enviado ainda.</p>;
  }

  return (
    <table style={{ borderCollapse: 'collapse', width: '100%' }}>
      <thead>
        <tr>
          <th style={{ textAlign: 'left' }}>Nome</th>
          <th style={{ textAlign: 'left' }}>Tamanho</th>
          <th style={{ textAlign: 'left' }}>Enviado em</th>
          <th style={{ textAlign: 'left' }}>Dono</th>
          <th style={{ textAlign: 'left' }}>Ações</th>
        </tr>
      </thead>
      <tbody>
        {documents.map((document) => (
          <tr key={document.id}>
            <td>{document.originalName}</td>
            <td>{formatSize(document.size)}</td>
            <td>{formatDate(document.uploadedAt)}</td>
            <td>{document.owner}</td>
            <td>
              <a href={getDownloadUrl(document.id)} download={document.originalName}>
                Baixar
              </a>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
