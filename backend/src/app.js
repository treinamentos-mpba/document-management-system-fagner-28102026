const express = require('express');
const multer = require('multer');
const documentRoutes = require('./routes/documentRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(documentRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Rota nao encontrada.' });
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);

  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      message: 'Upload invalido. Envie apenas um arquivo no campo file.',
    });
  }

  const status = error.status >= 400 && error.status < 600 ? error.status : 500;
  if (status >= 500) console.error('Falha ao processar requisicao:', error);

  res.status(status).json({
    message: status >= 500 ? 'Nao foi possivel concluir a operacao.' : error.message,
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`DMS backend ouvindo na porta ${PORT}`);
  });
}

module.exports = app;
