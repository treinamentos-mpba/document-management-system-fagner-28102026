import assert from 'node:assert/strict';
import { afterEach, mock, test } from 'node:test';
import { downloadDocument, getDocuments, uploadDocument } from '../src/services/api.js';

afterEach(() => mock.restoreAll());

test('lista documentos via /api e encaminha o sinal de cancelamento', async () => {
  const documents = [{ id: '1', originalName: 'relatorio.pdf' }];
  const signal = new AbortController().signal;
  mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, '/api/documents');
    assert.equal(options.signal, signal);
    return Response.json(documents);
  });
  assert.deepEqual(await getDocuments({ signal }), documents);
});

test('envia arquivo multipart sem definir Content-Type manualmente', async () => {
  const file = new File(['conteudo'], 'relatorio.txt');
  mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, '/api/upload');
    assert.equal(options.method, 'POST');
    assert.equal(options.headers, undefined);
    assert.equal(options.body.get('file').name, file.name);
    assert.equal(await options.body.get('file').text(), 'conteudo');
    return new Response(null, { status: 201 });
  });
  await uploadDocument(file);
});

test('baixa o conteudo binario e codifica o identificador', async () => {
  mock.method(globalThis, 'fetch', async (url) => {
    assert.equal(url, '/api/documents/id%2Fespecial/download');
    return new Response('arquivo');
  });
  assert.equal(await (await downloadDocument('id/especial')).text(), 'arquivo');
});

test('preserva a mensagem de erro enviada pelo backend', async () => {
  mock.method(globalThis, 'fetch', async () => Response.json(
    { message: 'Arquivo nao permitido.' }, { status: 400 },
  ));
  await assert.rejects(uploadDocument(new File([''], 'arquivo.txt')), /Arquivo nao permitido/);
});

test('trata respostas de erro nao JSON e falhas de rede', async () => {
  mock.method(globalThis, 'fetch', async () => new Response('Not found', { status: 404 }));
  await assert.rejects(getDocuments(), /HTTP 404/);
  mock.restoreAll();
  mock.method(globalThis, 'fetch', async () => { throw new TypeError('fetch failed'); });
  await assert.rejects(getDocuments(), /conectar ao servidor/);
});

test('preserva cancelamento e rejeita listagens invalidas', async () => {
  const error = new DOMException('Cancelado', 'AbortError');
  mock.method(globalThis, 'fetch', async () => { throw error; });
  await assert.rejects(getDocuments(), { name: 'AbortError' });
  mock.restoreAll();
  mock.method(globalThis, 'fetch', async () => Response.json({}));
  await assert.rejects(getDocuments(), /lista de documentos invalida/);
});