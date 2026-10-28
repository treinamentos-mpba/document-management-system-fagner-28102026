# Especificação - Document Management System

> Modelo de especificação (spec) para orientar o desenvolvimento guiado por
> especificação (Spec Driven Development). Preencha cada seção com o apoio do
> Plan Mode do GitHub Copilot durante o Passo 1.

## 1. Objetivo

Descreva em uma frase o que o sistema deve entregar.

## 2. Escopo

### Dentro do escopo

- Upload de documentos
- Listagem de documentos
- Download de documentos
- Gestão simples por usuário

### Fora do escopo

- Armazenamento externo ou em nuvem
- Versionamento de documentos

## 3. Requisitos funcionais

| ID    | Requisito                                            |
| ----- | ---------------------------------------------------- |
| RF-01 | O usuário pode enviar um documento                   |
| RF-02 | O usuário pode listar os documentos enviados         |
| RF-03 | O usuário pode baixar um documento pelo identificador|

## 4. Requisitos não funcionais

| ID     | Requisito                                                   |
| ------ | ----------------------------------------------------------- |
| RNF-01 | Arquivos gravados no filesystem local via multer            |
| RNF-02 | Metadados mantidos em memória nesta fase                    |
| RNF-03 | Configuração via variáveis de ambiente (12-Factor)          |

## 5. Modelo de dados (metadados do documento)

| Campo        | Tipo   | Descrição                          |
| ------------ | ------ | ---------------------------------- |
| id           | string | Identificador único do documento   |
| originalName | string | Nome original do arquivo enviado   |
| size         | number | Tamanho em bytes                   |
| createdAt    | string | Data/hora do upload (ISO 8601)     |
| owner        | string | Identificador do usuário dono      |

## 6. Contratos de API

### POST /upload

- Entrada: um arquivo no campo `file` (multipart/form-data)
- Saída: HTTP 201 com os metadados do documento criado
- Erros: HTTP 400 quando o arquivo estiver ausente ou o campo for inválido

### GET /documents

- Saída: lista de metadados de documentos

### GET /documents/:id/download

- Saída: conteúdo binário do arquivo
- Erros: HTTP 404 quando o documento ou o arquivo não existir

Os erros retornam JSON com o campo `message`. Os caminhos internos dos arquivos
não são expostos nos metadados.

Nesta fase não há autenticação: todos os documentos recebem `owner: "anonimo"`
e a listagem é compartilhada. Os arquivos ficam em `backend/storage`, com nomes
únicos gerados pelo servidor. Os metadados ficam em memória e são perdidos ao
reiniciar o backend; os arquivos permanecem no disco.

## 7. Decisões arquiteturais

- Backend em Clean Architecture simples (routes, controllers, services, repositories)
- Frontend baseado em componentes (React)
- Armazenamento local apenas

## 8. Plano de execução

Liste as etapas na ordem de implementação (gerado no Passo 1).

1. ...
2. ...
3. ...
