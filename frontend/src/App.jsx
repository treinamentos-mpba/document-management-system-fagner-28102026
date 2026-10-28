// Componente raiz do Document Management System: renderiza a página de
// documentos (upload, listagem e download via API /api).

import DocumentsPage from './pages/DocumentsPage';

export default function App() {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
      <h1>Document Management System</h1>
      <DocumentsPage />
    </main>
  );
}
