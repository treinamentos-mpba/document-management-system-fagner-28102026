// Controllers de documentos: validação básica e mapeamento HTTP.

const documentService = require('../services/documentService');

function uploadDocument(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo foi enviado.' });
  }

  const document = documentService.createDocument({
    originalName: req.file.originalname,
    storedName: req.file.filename,
    mimeType: req.file.mimetype,
    size: req.file.size,
    owner: req.body && req.body.owner,
  });

  return res.status(201).json(document);
}

function listDocuments(req, res) {
  return res.json(documentService.listDocuments());
}

function downloadDocument(req, res, next) {
  const download = documentService.getDocumentForDownload(req.params.id);
  if (!download) {
    return res.status(404).json({ error: 'Documento não encontrado.' });
  }

  return res.download(download.filePath, download.originalName, (err) => {
    if (err && !res.headersSent) {
      next(err);
    }
  });
}

module.exports = { uploadDocument, listDocuments, downloadDocument };
