# Especificação - Document Management System (DMS)

> Especificação completa gerada a partir de `spec-template.md` (Passo 1 -
> Spec Driven Development). Este documento é a fonte de verdade para os
> próximos passos.

## 1. Objetivo

Disponibilizar um sistema web simples para que usuários enviem, listem e 
baixem documentos, com arquivos gravados no filesystem local da aplicação e
metadados mantidos em memória.

## 2. Escopo

### Dentro do escopo

- Upload de documentos (um arquivo por requisição)
- Listagem de documentos com metadados
- Download de documentos pelo identificador
- Gestão simples por usuário (campo `owner` nos metadados)

### Fora do escopo

- Armazenamento externo ou em nuvem (S3, GCS, etc.)
- Versionamento de documentos
- Autenticação/autorização real (o dono é apenas um identificador informado)
- Banco de dados (metadados ficam em memória nesta fase)
- Exclusão e edição de documentos

## 3. Requisitos funcionais

| ID    | Requisito                                                                 |
| ----- | ------------------------------------------------------------------------- |
| RF-01 | O usuário pode enviar um documento via `POST /upload` (multipart/form-data, campo `file`) |
| RF-02 | O usuário pode listar os documentos enviados via `GET /documents`, em ordem decrescente de data de upload |
| RF-03 | O usuário pode baixar um documento pelo identificador via `GET /documents/:id/download`, recebendo o arquivo com o nome original |
| RF-04 | O upload aceita um campo opcional `owner` (texto); quando ausente, o dono é registrado como `anonymous` |
| RF-05 | Upload sem arquivo retorna `400` com mensagem de erro em português |
| RF-06 | Download de id inexistente retorna `404` com mensagem de erro em português |

## 4. Requisitos não funcionais

| ID     | Requisito                                                                  |
| ------ | --------------------------------------------------------------------------- |
| RNF-01 | Arquivos gravados no filesystem local em `backend/storage` via `multer` com `diskStorage`; nenhum provedor externo |
| RNF-02 | Metadados mantidos em memória (array no repositório); perdidos ao reiniciar o processo — comportamento aceito nesta fase |
| RNF-03 | Configuração via variáveis de ambiente (12-Factor): `PORT` (padrão `3000`) e `STORAGE_DIR` (padrão `backend/storage`) |
| RNF-04 | Respostas de erro em JSON no formato `{ "error": "<mensagem em português>" }` |
| RNF-05 | Backend em Node.js + Express (CommonJS); testes com o runner nativo `node:test`, sem novas dependências |
| RNF-06 | Frontend em React + Vite, comunicação via `fetch` no prefixo `/api` (proxy do Vite remove o prefixo) |
| RNF-07 | O arquivo é gravado em disco com nome único gerado pelo servidor (nunca o nome original), evitando colisão e path traversal |

## 5. Modelo de dados (metadados do documento)

Entidade `Document` (mantida em memória pelo repositório):

| Campo        | Tipo   | Descrição                                            |
| ------------ | ------ | ---------------------------------------------------- |
| id           | string | Identificador único (UUID gerado via `crypto.randomUUID()`) |
| originalName | string | Nome original do arquivo enviado                     |
| storedName   | string | Nome do arquivo gravado em `backend/storage` (uso interno; não exposto na API) |
| mimeType     | string | Tipo MIME informado no upload                        |
| size         | number | Tamanho em bytes                                     |
| uploadedAt   | string | Data/hora do upload (ISO 8601)                       |
| owner        | string | Identificador do usuário dono (`anonymous` quando não informado) |

Representação na API (sem `storedName`):

```json
{
  "id": "6f1c0a2e-...",
  "originalName": "contrato.pdf",
  "mimeType": "application/pdf",
  "size": 48213,
  "uploadedAt": "2026-10-28T19:00:00.000Z",
  "owner": "fagner"
}
```

## 6. Contratos de API

> O frontend sempre chama com prefixo `/api` (ex.: `/api/documents`); o proxy
> do Vite remove o prefixo antes de encaminhar ao backend na porta 3000.

### GET /health (já existente no seed)

- Saída: `200` — `{ "status": "ok" }`

### POST /upload

- Entrada: `multipart/form-data`
  - `file` (obrigatório): o arquivo
  - `owner` (opcional): identificador do dono
- Saída:
  - `201` — metadados do documento criado (JSON, conforme seção 5)
  - `400` — `{ "error": "Nenhum arquivo foi enviado." }`

### GET /documents

- Entrada: nenhuma
- Saída:
  - `200` — array de metadados (vazio `[]` quando não há documentos),
    ordenado por `uploadedAt` decrescente

### GET /documents/:id/download

- Entrada: `id` no path
- Saída:
  - `200` — conteúdo binário com `Content-Disposition: attachment;
    filename="<originalName>"` (via `res.download`)
  - `404` — `{ "error": "Documento não encontrado." }`

### Erros gerais

- `400` — upload que excede o tamanho máximo permitido (limite do multer)
- `500` — `{ "error": "Erro interno do servidor." }` (middleware de erro do
  Express; detalhes apenas em log do servidor)

## 7. Decisões arquiteturais

1. **Clean Architecture simples** no backend, com fluxo de dependência
   `routes -> controllers -> services -> repositories`; camadas internas não
   conhecem camadas externas.
   - `routes/`: declaram endpoints e o middleware do multer; delegam aos controllers
   - `controllers/`: validação básica de entrada e mapeamento HTTP (status/JSON)
   - `services/`: regras de negócio (montar metadados, ordenar listagem, localizar documento)
   - `repositories/`: persistência (array em memória + resolução de caminho em `backend/storage`)
2. **Armazenamento estritamente local**: `multer` com `diskStorage` apontando
   para `backend/storage`; nome gravado em disco é único e gerado pelo
   servidor. `backend/storage` versionado com `.gitkeep` e conteúdo ignorado
   no `.gitignore`.
3. **Metadados em memória**: repositório encapsula o array, permitindo trocar
   por persistência real no futuro sem alterar services/controllers.
4. **Sem TypeScript e sem novas dependências**: usar apenas `express` e
   `multer` já presentes; ids com `crypto.randomUUID()` do Node.
5. **Frontend baseado em componentes**: `components/` (UploadForm,
   DocumentList), `pages/` (DocumentsPage), `services/` (cliente `fetch` da
   API com prefixo `/api`).
6. **Testes do backend** com `node:test`, exercitando o `app` exportado por
   `src/app.js` através de um servidor HTTP efêmero e `fetch` nativo.

### Riscos

| Risco | Mitigação |
| ----- | --------- |
| Perda de metadados ao reiniciar (arquivos órfãos em `storage/`) | Aceito nesta fase; repositório isolado facilita evolução futura |
| Upload de arquivos muito grandes esgotar disco | `limits.fileSize` no multer (10 MB) com erro `400` amigável |
| Path traversal / colisão de nomes | Nome em disco sempre gerado pelo servidor (RNF-07); download resolve caminho apenas a partir do metadado |
| Testes que gravam em `backend/storage` poluírem o diretório | Usar `STORAGE_DIR` apontando para diretório temporário nos testes |
| Divergência de contrato entre frontend e backend | Esta spec é a fonte de verdade; contratos da seção 6 são imutáveis sem atualização da spec |

## 8. Plano de execução

### Etapa 1 — Backend: camada de persistência e armazenamento

- Arquivos: `backend/src/repositories/documentRepository.js`,
  `backend/storage/.gitkeep`, ajuste no `.gitignore`
- Conteúdo: array de metadados em memória; funções `save`, `findAll`,
  `findById`; resolução do diretório via `STORAGE_DIR`
- Critérios de aceite: repositório puro (sem Express/multer); metadados
  seguem o modelo da seção 5

### Etapa 2 — Backend: regras de negócio

- Arquivos: `backend/src/services/documentService.js`
- Conteúdo: criação de metadados a partir do arquivo recebido (id, datas,
  owner padrão `anonymous`), listagem ordenada, busca para download
- Critérios de aceite: service depende apenas do repositório; RF-01 a RF-04
  cobertos em nível de regra de negócio

### Etapa 3 — Backend: controllers, rotas e integração no app

- Arquivos: `backend/src/controllers/documentController.js`,
  `backend/src/routes/documentRoutes.js`, atualização de `backend/src/app.js`
- Conteúdo: multer com `diskStorage` e `limits.fileSize`; endpoints
  `POST /upload`, `GET /documents`, `GET /documents/:id/download`;
  middleware de erro com respostas da seção 6
- Critérios de aceite: contratos da seção 6 respeitados (status e corpos);
  `/health` continua funcionando; fluxo `routes -> controllers -> services ->
  repositories` sem violações

### Etapa 4 — Backend: testes automatizados

- Arquivos: `backend/test/documents.test.js`
- Conteúdo: testes com `node:test` cobrindo upload com sucesso (201), upload
  sem arquivo (400), listagem (200) e download existente/inexistente (200/404)
- Critérios de aceite: `npm test` verde no diretório `backend`; testes usam
  `STORAGE_DIR` temporário

### Etapa 5 — Frontend: serviço de API e componentes

- Arquivos: `frontend/src/services/documentsApi.js`,
  `frontend/src/components/UploadForm.jsx`,
  `frontend/src/components/DocumentList.jsx`
- Conteúdo: funções `uploadDocument`, `listDocuments`, URL de download; form
  de upload com campo opcional de dono; lista com nome, tamanho, data, dono e
  link de download — tudo via `fetch` em `/api/...`
- Critérios de aceite: componentes funcionais com Hooks; nenhuma URL
  absoluta do backend no código; mensagens ao usuário em português

### Etapa 6 — Frontend: página e integração final

- Arquivos: `frontend/src/pages/DocumentsPage.jsx`, atualização de
  `frontend/src/App.jsx`
- Conteúdo: página que compõe `UploadForm` e `DocumentList`, atualizando a
  lista após upload; estados de carregamento e erro
- Critérios de aceite: fluxo completo upload → listagem → download funcionando
  com backend (`npm run dev` em ambos) através do proxy `/api`; RF-01 a RF-06
  verificáveis pela interface

### Etapa 7 — Documentação

- Arquivos: atualização de `README.md`
- Conteúdo: instruções de execução (backend e frontend), variáveis de
  ambiente e referência a esta spec
- Critérios de aceite: um novo desenvolvedor sobe o sistema seguindo apenas o
  README
