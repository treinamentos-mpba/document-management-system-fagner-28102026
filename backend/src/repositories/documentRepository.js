// Repositório de documentos: metadados em memória e resolução do diretório
// de armazenamento local. Camada mais interna — não conhece Express/multer.

const path = require('path');

// Diretório padrão: backend/storage (configurável via STORAGE_DIR - 12-Factor).
const DEFAULT_STORAGE_DIR = path.join(__dirname, '..', '..', 'storage');

const documents = [];

function getStorageDir() {
  return process.env.STORAGE_DIR || DEFAULT_STORAGE_DIR;
}

function save(document) {
  documents.push(document);
  return document;
}

function findAll() {
  return [...documents];
}

function findById(id) {
  return documents.find((document) => document.id === id) || null;
}

// Usado apenas em testes para isolar cenários.
function clear() {
  documents.length = 0;
}

module.exports = { getStorageDir, save, findAll, findById, clear };
