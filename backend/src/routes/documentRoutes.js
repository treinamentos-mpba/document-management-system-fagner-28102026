// Rotas de documentos: endpoints + middleware de upload (multer/diskStorage).

const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const express = require('express');
const multer = require('multer');
const documentController = require('../controllers/documentController');
const { getStorageDir } = require('../repositories/documentRepository');

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

// Armazenamento estritamente local: arquivos gravados em backend/storage com
// nome único gerado pelo servidor (evita colisões e path traversal).
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const storageDir = getStorageDir();
    fs.mkdirSync(storageDir, { recursive: true });
    cb(null, storageDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${randomUUID()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage, limits: { fileSize: MAX_FILE_SIZE_BYTES } });

const router = express.Router();

router.post('/upload', upload.single('file'), documentController.uploadDocument);
router.get('/documents', documentController.listDocuments);
router.get('/documents/:id/download', documentController.downloadDocument);

module.exports = router;
