const { test } = require('node:test');
const assert = require('node:assert');
const { once } = require('node:events');
const { readFile, unlink } = require('node:fs/promises');
const path = require('node:path');
const app = require('../src/app');
const documentRepository = require('../src/repositories/documentRepository');

test('o app backend é exportado', () => {
  assert.ok(app, 'o app deve estar definido');
  assert.strictEqual(typeof app, 'function', 'o app Express deve ser uma função');
});

test('API de documentos com armazenamento local', async (t) => {
  const server = app.listen(0, '127.0.0.1');
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
    server.closeAllConnections();
  }));
  await once(server, 'listening');
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const contents = Buffer.from([0, 1, 2, 127, 128, 255]);
  let uploaded;

  async function uploadFile(name = 'relatorio.pdf') {
    const body = new FormData();
    body.append('file', new Blob([contents]), name);
    const response = await fetch(`${baseUrl}/upload`, { method: 'POST', body });
    assert.strictEqual(response.status, 201);
    const document = await response.json();
    const { filePath } = documentRepository.findById(document.id);
    t.after(async () => {
      try {
        await unlink(filePath);
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
    });
    return document;
  }

  await t.test('preserva a verificacao de saude', async () => {
    const response = await fetch(`${baseUrl}/health`);
    assert.strictEqual(response.status, 200);
    assert.deepStrictEqual(await response.json(), { status: 'ok' });
  });

  await t.test('lista vazia antes do primeiro upload', async () => {
    const response = await fetch(`${baseUrl}/documents`);
    assert.strictEqual(response.status, 200);
    assert.deepStrictEqual(await response.json(), []);
  });

  await t.test('upload retorna metadados e grava os bytes no storage local', async () => {
    uploaded = await uploadFile();
    assert.deepStrictEqual(Object.keys(uploaded).sort(), [
      'createdAt', 'id', 'originalName', 'owner', 'size',
    ]);
    assert.match(uploaded.id, /^[0-9a-f-]{36}$/);
    assert.strictEqual(uploaded.originalName, 'relatorio.pdf');
    assert.strictEqual(uploaded.size, contents.length);
    assert.strictEqual(uploaded.owner, 'anonimo');
    assert.ok(Number.isFinite(Date.parse(uploaded.createdAt)));
    const { filePath } = documentRepository.findById(uploaded.id);
    assert.strictEqual(path.dirname(filePath), path.resolve(__dirname, '../storage'));
    assert.deepStrictEqual(await readFile(filePath), contents);
  });

  await t.test('lista os metadados esperados pelo frontend sem expor caminhos', async () => {
    const response = await fetch(`${baseUrl}/documents`);
    assert.strictEqual(response.status, 200);
    assert.deepStrictEqual(await response.json(), [uploaded]);
  });

  await t.test('download preserva conteudo e nome original', async () => {
    const response = await fetch(`${baseUrl}/documents/${uploaded.id}/download`);
    assert.strictEqual(response.status, 200);
    assert.match(response.headers.get('content-disposition'), /attachment; filename="relatorio.pdf"/);
    assert.deepStrictEqual(Buffer.from(await response.arrayBuffer()), contents);
  });

  await t.test('arquivos com o mesmo nome nao sobrescrevem uploads anteriores', async () => {
    const duplicate = await uploadFile();
    assert.notStrictEqual(duplicate.id, uploaded.id);
    const response = await fetch(`${baseUrl}/documents/${uploaded.id}/download`);
    assert.strictEqual(response.status, 200);
    assert.deepStrictEqual(Buffer.from(await response.arrayBuffer()), contents);
  });

  await t.test('rejeita upload sem arquivo', async () => {
    const response = await fetch(`${baseUrl}/upload`, { method: 'POST', body: new FormData() });
    assert.strictEqual(response.status, 400);
    assert.deepStrictEqual(await response.json(), { message: 'Envie um arquivo no campo file.' });
  });

  await t.test('rejeita campo incorreto e multiplos arquivos sem criar metadados', async () => {
    for (const fields of [['document'], ['file', 'file']]) {
      const body = new FormData();
      for (const field of fields) body.append(field, new Blob([contents]), 'teste.pdf');
      const response = await fetch(`${baseUrl}/upload`, { method: 'POST', body });
      assert.strictEqual(response.status, 400);
      assert.match((await response.json()).message, /campo file/);
    }
    const response = await fetch(`${baseUrl}/documents`);
    assert.strictEqual((await response.json()).length, 2);
  });

  await t.test('documento inexistente retorna erro JSON 404', async () => {
    const response = await fetch(`${baseUrl}/documents/inexistente/download`);
    assert.strictEqual(response.status, 404);
    assert.deepStrictEqual(await response.json(), { message: 'Documento nao encontrado.' });
  });

  await t.test('arquivo removido do disco retorna erro JSON 404', async () => {
    await unlink(documentRepository.findById(uploaded.id).filePath);
    const response = await fetch(`${baseUrl}/documents/${uploaded.id}/download`);
    assert.strictEqual(response.status, 404);
    assert.deepStrictEqual(await response.json(), { message: 'Arquivo do documento nao encontrado.' });
  });

  await t.test('rota inexistente retorna erro JSON 404', async () => {
    const response = await fetch(`${baseUrl}/inexistente`);
    assert.strictEqual(response.status, 404);
    assert.deepStrictEqual(await response.json(), { message: 'Rota nao encontrada.' });
  });
});
