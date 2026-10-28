# Document Management System com GitHub Copilot

<img src="https://octodex.github.com/images/Professortocat_v2.png" align="right" height="200px" />

Hey jonfagner!

Mona here. I'm done preparing your exercise. Hope you enjoy! 💚

Remember, it's self-paced so feel free to take a break! ☕️

[![](https://img.shields.io/badge/Go%20to%20Exercise-%E2%86%92-1f883d?style=for-the-badge&logo=github&labelColor=197935)](https://github.com/treinamentos-mpba/document-management-system-fagner-28102026/issues/1)

## Executar localmente

Com as dependências instaladas, inicie o backend e o frontend em terminais separados:

```sh
cd backend
npm run dev
```

```sh
cd frontend
npm run dev
```

Abra o endereço exibido pelo Vite (porta padrão 5173). O frontend encaminha
`/api` para o backend em `http://localhost:3000`. Mantenha essa porta ao executar
os dois juntos; o backend isolado aceita a variável `PORT`.

A API oferece `POST /upload` (multipart, campo `file`), `GET /documents` e
`GET /documents/:id/download`. Os arquivos são armazenados apenas em
`backend/storage`. Os metadados são mantidos em memória e desaparecem ao
reiniciar o backend. Nesta fase não há autenticação nem isolamento por usuário;
o dono é registrado como `anonimo`.

Para executar os testes de integração do backend:

```sh
cd backend
npm test
```

---

&copy; 2025 GitHub &bull; [Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/code_of_conduct.md) &bull; [MIT License](https://gh.io/mit)
