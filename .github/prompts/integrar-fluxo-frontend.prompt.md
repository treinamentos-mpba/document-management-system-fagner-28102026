---
description: Implementa um fluxo de interface integrado à API existente, com estados e testes.
name: integrar-fluxo-frontend
argument-hint: descreva o fluxo desejado (ex. filtrar documentos por nome)
agent: agent
---

# Integrar fluxo do frontend com a API

Implemente o fluxo `${input:fluxo:descreva o fluxo desejado}` na interface do Document Management System.

Antes de alterar código, examine as instruções do projeto e os componentes, serviços e testes próximos ao fluxo. Reaproveite a estrutura existente e mantenha as alterações restritas ao necessário.

Requisitos:

- Use React funcional com hooks e mantenha a comunicação HTTP em `frontend/src/services/api.js`, usando o prefixo `/api`.
- Integre a interface aos endpoints existentes. Se o fluxo exigir um endpoint que ainda não existe, identifique essa dependência e implemente-a seguindo as camadas do backend, sem duplicar regras de negócio no frontend.
- Trate estados de carregamento, sucesso, erro e resultado vazio quando forem aplicáveis; apresente mensagens em português e controles acessíveis.
- Preserve os fluxos existentes de upload, listagem e download de documentos.
- Adicione ou ajuste testes seguindo os padrões existentes. Execute `npm test` e `npm run build` no diretório `frontend` e os testes do backend caso ele também tenha sido alterado.
- Ao concluir, resuma os arquivos modificados e os comandos de validação executados.
