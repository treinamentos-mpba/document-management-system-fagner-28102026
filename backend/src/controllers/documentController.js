const documentService = require('../services/documentService');

function upload(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: 'Envie um arquivo no campo file.' });
  }

  const document = documentService.registerDocument(req.file);
  res.status(201).json(document);
}

function list(req, res) {
  res.json(documentService.listDocuments());
}

function download(req, res, next) {
  const document = documentService.getDocument(req.params.id);

  res.download(document.filePath, document.originalName, (error) => {
    if (!error) return;

    if (error.code === 'ENOENT') {
      error.status = 404;
      error.message = 'Arquivo do documento nao encontrado.';
    }

    next(error);
  });
}

module.exports = { upload, list, download };
