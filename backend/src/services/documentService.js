// Regras de negócio de documentos. Depende apenas do repositório.

const path = require('path');
const { randomUUID } = require('crypto');
const documentRepository = require('../repositories/documentRepository');

const DEFAULT_OWNER = 'anonymous';

// Remove o campo interno storedName da representação exposta pela API.
function toPublicDocument({ storedName, ...publicFields }) {
  return publicFields;
}

function createDocument({ originalName, storedName, mimeType, size, owner }) {
  const document = {
    id: randomUUID(),
    originalName,
    storedName,
    mimeType,
    size,
    uploadedAt: new Date().toISOString(),
    owner: owner && owner.trim() ? owner.trim() : DEFAULT_OWNER,
  };

  documentRepository.save(document);
  return toPublicDocument(document);
}

function listDocuments() {
  return documentRepository
    .findAll()
    .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))
    .map(toPublicDocument);
}

function getDocumentForDownload(id) {
  const document = documentRepository.findById(id);
  if (!document) {
    return null;
  }

  return {
    originalName: document.originalName,
    filePath: path.join(documentRepository.getStorageDir(), document.storedName),
  };
}

module.exports = { createDocument, listDocuments, getDocumentForDownload };
