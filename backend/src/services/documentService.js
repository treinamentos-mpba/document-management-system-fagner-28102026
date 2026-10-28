const documentRepository = require('../repositories/documentRepository');

function toMetadata({ filePath, ...metadata }) {
  return metadata;
}

function registerDocument(file) {
  const document = documentRepository.save({
    id: file.filename,
    originalName: file.originalname,
    size: file.size,
    createdAt: new Date().toISOString(),
    owner: 'anonimo',
    filePath: file.path,
  });

  return toMetadata(document);
}

function listDocuments() {
  return documentRepository.findAll().map(toMetadata);
}

function getDocument(id) {
  const document = documentRepository.findById(id);

  if (!document) {
    throw Object.assign(new Error('Documento nao encontrado.'), { status: 404 });
  }

  return document;
}

module.exports = { registerDocument, listDocuments, getDocument };
