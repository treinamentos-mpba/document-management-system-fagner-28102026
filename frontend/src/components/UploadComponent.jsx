import { useState } from 'react';
import { uploadDocument } from '../services/api.js';

export default function UploadComponent({ onUpload }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    if (!file || uploading) return;

    const form = event.currentTarget;
    setUploading(true);
    setError('');
    setMessage('');

    try {
      await uploadDocument(file);
      form.reset();
      setFile(null);
      setMessage('Documento enviado com sucesso.');
      onUpload();
    } catch (error) {
      setError(error.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="upload-section" aria-labelledby="upload-title">
      <h2 id="upload-title">Enviar documento</h2>
      <form onSubmit={handleSubmit} aria-busy={uploading}>
        <label htmlFor="document-file">Arquivo</label>
        <div className="upload-controls">
          <input
            id="document-file"
            name="file"
            type="file"
            required
            disabled={uploading}
            onChange={(event) => {
              setFile(event.target.files[0] || null);
              setError('');
              setMessage('');
            }}
          />
          <button type="submit" disabled={!file || uploading}>
            {uploading ? 'Enviando...' : 'Enviar documento'}
          </button>
        </div>
        {error && <p className="error" role="alert">{error}</p>}
        {message && <p className="success" role="status">{message}</p>}
      </form>
    </section>
  );
}