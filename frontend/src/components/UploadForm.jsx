import { useRef, useState } from 'react';
import { uploadDocument } from '../services/documentsApi';

// Formulário de upload: arquivo obrigatório e dono opcional.
export default function UploadForm({ onUploaded }) {
  const fileInputRef = useRef(null);
  const [owner, setOwner] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError('Selecione um arquivo para enviar.');
      return;
    }

    setSending(true);
    try {
      const document = await uploadDocument(file, owner);
      fileInputRef.current.value = '';
      setOwner('');
      onUploaded?.(document);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.5rem', maxWidth: '24rem' }}>
      <label>
        Arquivo:{' '}
        <input ref={fileInputRef} type="file" name="file" disabled={sending} />
      </label>
      <label>
        Dono (opcional):{' '}
        <input
          type="text"
          name="owner"
          value={owner}
          onChange={(event) => setOwner(event.target.value)}
          placeholder="anonymous"
          disabled={sending}
        />
      </label>
      <button type="submit" disabled={sending}>
        {sending ? 'Enviando...' : 'Enviar documento'}
      </button>
      {error && <p role="alert" style={{ color: 'crimson', margin: 0 }}>{error}</p>}
    </form>
  );
}
