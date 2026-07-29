# Sistema de Gestão de Inventário de TI

Sistema web para controle e gestão centralizada de ativos e infraestrutura de TI (notebooks, desktops, switches, celulares, NVRs e câmeras de CFTV), incluindo mapeamento de rede e gerenciamento de portas de switches.

---

## 🛠️ Stack Tecnológica

### Back-end
- **Runtime & Linguagem:** Node.js (ESM), TypeScript
- **Framework Web:** Express (v5)
- **Banco de Dados:** SQLite (via `better-sqlite3`) com suporte a WAL e Foreign Keys
- **Validação & Segurança:** Zod, Helmet, CORS, Express Rate Limit, Bcrypt, JSON Web Token (JWT)
- **Uploads & Tarefas:** Multer, Node-Cron
- **Testes:** Vitest, Supertest

### Front-end
- **Biblioteca & Build:** React (v19), Vite, TypeScript
- **Roteamento:** React Router DOM (v6)
- **Estilização:** Vanilla CSS com CSS Modules e Design Tokens globais em `:root`

---

## 📁 Estrutura do Projeto

- **[`back-end/`](./back-end/README.md):** API RESTful Express, banco de dados SQLite, controle de migrações e suíte de testes.
- **[`front-end/`](./front-end/README.md):** Single Page Application (SPA) desenvolvida em React.

---

## 📋 Pré-requisitos

- **Node.js:** Versão `v18.x` ou superior (recomenda-se a versão LTS mais recente).
- **Gerenciador de Pacotes:** `npm` (geralmente instalado com o Node.js).

---

## 🚀 Primeira Vez Rodando o Projeto

### 1. Configurar e rodar o Back-end

Navegue até a pasta `back-end`:
```bash
cd back-end
npm install
cp .env.example .env
npm run setup
npx tsx src/scripts/criarAdmin.ts
npm run dev
```
O servidor back-end iniciará em `http://localhost:3000`.

*Para mais detalhes sobre variáveis de ambiente, migrations e comandos do back-end, acesse o [README do Back-end](./back-end/README.md).*

### 2. Configurar e rodar o Front-end

Em outro terminal, navegue até a pasta `front-end`:
```bash
cd front-end
npm install
npm run dev
```
A aplicação web estará disponível no navegador em `http://localhost:5173`.

*Para mais detalhes sobre consumo da API, estrutura de componentes e design system, acesse o [README do Front-end](./front-end/README.md).*

---

## Licença

Este projeto está licenciado sob a licença MIT — veja o arquivo LICENSE para mais detalhes.

