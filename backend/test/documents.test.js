// Testes dos endpoints de documentos (RF-01 a RF-06) usando node:test,
// fetch nativo e um servidor HTTP efêmero. Os uploads vão para um diretório
// temporário via STORAGE_DIR, mantendo backend/storage limpo.

const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const tempStorageDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dms-test-'));
process.env.STORAGE_DIR = tempStorageDir;

const app = require('../src/app');
const documentRepository = require('../src/repositories/documentRepository');

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  fs.rmSync(tempStorageDir, { recursive: true, force: true });
});

beforeEach(() => {
  documentRepository.clear();
});

function buildUploadBody({ fileName = 'relatorio.txt', content = 'conteúdo de teste', owner } = {}) {
  const form = new FormData();
  form.append('file', new Blob([content], { type: 'text/plain' }), fileName);
  if (owner !== undefined) {
    form.append('owner', owner);
  }
  return form;
}

test('POST /upload cria um documento e retorna 201 com metadados', async () => {
  const response = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    body: buildUploadBody({ owner: 'fagner' }),
  });

  assert.strictEqual(response.status, 201);
  const document = await response.json();
  assert.ok(document.id, 'deve gerar um id');
  assert.strictEqual(document.originalName, 'relatorio.txt');
  assert.strictEqual(document.owner, 'fagner');
  assert.strictEqual(typeof document.size, 'number');
  assert.ok(document.uploadedAt, 'deve registrar a data do upload');
  assert.strictEqual(document.storedName, undefined, 'storedName é interno');
});

test('POST /upload sem owner registra o dono como anonymous', async () => {
  const response = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    body: buildUploadBody(),
  });

  assert.strictEqual(response.status, 201);
  const document = await response.json();
  assert.strictEqual(document.owner, 'anonymous');
});

test('POST /upload sem arquivo retorna 400', async () => {
  const form = new FormData();
  form.append('owner', 'fagner');

  const response = await fetch(`${baseUrl}/upload`, { method: 'POST', body: form });

  assert.strictEqual(response.status, 400);
  const body = await response.json();
  assert.strictEqual(body.error, 'Nenhum arquivo foi enviado.');
});

test('GET /documents lista em ordem decrescente de uploadedAt', async () => {
  await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    body: buildUploadBody({ fileName: 'primeiro.txt' }),
  });
  await new Promise((resolve) => setTimeout(resolve, 5));
  await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    body: buildUploadBody({ fileName: 'segundo.txt' }),
  });

  const response = await fetch(`${baseUrl}/documents`);

  assert.strictEqual(response.status, 200);
  const documents = await response.json();
  assert.strictEqual(documents.length, 2);
  assert.strictEqual(documents[0].originalName, 'segundo.txt');
  assert.strictEqual(documents[1].originalName, 'primeiro.txt');
});

test('GET /documents retorna lista vazia quando não há documentos', async () => {
  const response = await fetch(`${baseUrl}/documents`);

  assert.strictEqual(response.status, 200);
  assert.deepStrictEqual(await response.json(), []);
});

test('GET /documents/:id/download devolve o arquivo com o nome original', async () => {
  const uploadResponse = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    body: buildUploadBody({ fileName: 'contrato.txt', content: 'texto do contrato' }),
  });
  const { id } = await uploadResponse.json();

  const response = await fetch(`${baseUrl}/documents/${id}/download`);

  assert.strictEqual(response.status, 200);
  assert.match(
    response.headers.get('content-disposition'),
    /attachment/,
    'deve enviar como anexo'
  );
  assert.match(response.headers.get('content-disposition'), /contrato\.txt/);
  assert.strictEqual(await response.text(), 'texto do contrato');
});

test('GET /documents/:id/download retorna 404 para id inexistente', async () => {
  const response = await fetch(`${baseUrl}/documents/nao-existe/download`);

  assert.strictEqual(response.status, 404);
  const body = await response.json();
  assert.strictEqual(body.error, 'Documento não encontrado.');
});
