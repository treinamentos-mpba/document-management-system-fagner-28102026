# Document Management System com GitHub Copilot

<img src="https://octodex.github.com/images/Professortocat_v2.png" align="right" height="200px" />

Hey jonfagner!

Mona here. I'm done preparing your exercise. Hope you enjoy! 💚

Remember, it's self-paced so feel free to take a break! ☕️

[![](https://img.shields.io/badge/Go%20to%20Exercise-%E2%86%92-1f883d?style=for-the-badge&logo=github&labelColor=197935)](https://github.com/treinamentos-mpba/document-management-system-fagner-28102026/issues/1)

---

## Como executar o projeto

Especificação completa: [docs/specs/dms-spec.md](./docs/specs/dms-spec.md).

### Backend (Node.js + Express)

```bash
cd backend
npm install
npm run dev   # ou npm start
```

- Servidor em `http://localhost:3000`
- Endpoints: `GET /health`, `POST /upload`, `GET /documents`,
  `GET /documents/:id/download`
- Variáveis de ambiente: `PORT` (padrão `3000`) e `STORAGE_DIR`
  (padrão `backend/storage`)
- Testes: `npm test`

### Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

- Interface em `http://localhost:5173` (o proxy `/api` encaminha para o
  backend na porta 3000 — mantenha os dois rodando)

---

&copy; 2025 GitHub &bull; [Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/code_of_conduct.md) &bull; [MIT License](https://gh.io/mit)

