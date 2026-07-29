# Back-end — API & Banco de Dados

API RESTful desenvolvida em Node.js, Express e TypeScript para o Sistema de Gestão de Inventário de TI.

---

## ⚙️ Instalação

Dentro do diretório `back-end`, instale as dependências:

```bash
npm install
```

---

## 🔐 Configuração de Variáveis de Ambiente

Crie o arquivo `.env` copiando o modelo de `.env.example`:

```bash
cp .env.example .env
```

### Variáveis Documentadas no `.env.example`:

| Variável | Descrição | Exemplo / Padrão |
|---|---|---|
| `PORT` | Porta onde o servidor HTTP do Express irá escutar. | `3000` |
| `JWT_SECRET` | Chave secreta alfanumérica usada para assinar e verificar tokens JWT. | `troque_por_um_segredo_forte` |
| `FRONTEND_URL` | Origem autorizada no CORS para comunicação do front-end. | `http://localhost:5173` |
| `ADMIN_EMAIL` | *(Opcional)* E-mail usado pelo script de criação do admin inicial. | `admin@suaempresa.com` |
| `ADMIN_SENHA` | *(Opcional)* Senha usada pelo script de criação do admin inicial. | `SenhaForteAdmin123!` |

> ⚠️ **Aviso de Segurança:** Antes de realizar a implantação em ambiente de produção, leia atentamente a seção [⚠️ Segurança — antes de usar em produção](../README.md#-segurança--antes-de-usar-em-produção) no README principal.

---

## 🗄️ Banco de Dados e Migrações

O projeto utiliza **SQLite** via biblioteca `better-sqlite3`. O arquivo do banco (`src/database/app.db`) **NÃO** é versionado no Git; cada ambiente possui sua própria instância.

### 1. Criando um banco novo (primeira instalação)

Execute o comando de setup inicial:

```bash
npm run setup
```

Esse script cria o arquivo `app.db`, executa o `src/database/schema.sql` (que cria a estrutura completa de tabelas) e marca todas as migrações existentes em `src/database/migrations/` como aplicadas na tabela de controle `migracoes_aplicadas`.

### 2. Migrações automáticas em bancos existentes

Ao iniciar o servidor (`npm run dev`), a função `rodarMigracoes()` é chamada automaticamente antes que a API comece a receber requisições. Quaisquer arquivos `.sql` novos pendentes na pasta `src/database/migrations/` serão aplicados de forma sequencial e transacional.

---

## 👤 Criando o Primeiro Usuário Administrador

Para acessar o sistema pela primeira vez, crie o usuário administrador inicial executando o script CLI:

```bash
npx tsx src/scripts/criarAdmin.ts
```

- O script lê as variáveis `ADMIN_EMAIL` e `ADMIN_SENHA` do arquivo `.env`.
- Caso as variáveis não estejam preenchidas, um aviso é emitido no console e o script utiliza as credenciais padrão de fallback (`admin@admin.com` / `admin123`).
- A senha inserida deve possuir no mínimo 8 caracteres e será criptografada com `bcrypt` antes de ser persistida.

---

## 🚀 Executando a Aplicação

### Modo Desenvolvimento
Inicia o servidor com hot-reload via `tsx`:
```bash
npm run dev
```

### Testes Automatizados
Executa a suíte de testes (Vitest + Supertest contra um banco em memória/isolado `test.db`):
```bash
# Execução única
npm test

# Modo de observação (watch)
npm run test:watch
```

### Build de Produção
Compila o código TypeScript para JavaScript na pasta `dist`:
```bash
npm run build
```

---

## 📁 Estrutura de Pastas

```text
back-end/src/
├── controllers/    # Recebe requisições HTTP, valida entradas e envia respostas.
├── services/       # Regras de negócio e consultas SQL (better-sqlite3).
├── routes/         # Definição dos endpoints REST e middlewares associados.
├── schemas/        # Schemas de validação Zod para payloads e query params.
├── middlewares/    # Autenticação JWT, autorização por perfil (ADMIN), validação e erros.
├── database/       # Conexão SQLite, schema.sql, migrator.ts e pasta migrations/.
│   └── migrations/ # Scripts de alteração incremental do banco (.sql).
├── cron/           # Rotinas de backup e tarefas agendadas em segundo plano.
├── scripts/        # Scripts utilitários de CLI (ex: criarAdmin.ts).
└── tests/          # Suítes de testes automatizados (unitários e integração).
```

---

## 📝 Como Adicionar uma Nova Migração de Banco

Ao necessitar alterar a estrutura do banco de dados (adicionar colunas, novas tabelas ou índices):

1. Crie um novo arquivo `.sql` dentro de `src/database/migrations/`.
2. Siga o padrão de nomenclatura com prefixo numérico sequencial (exemplo: `0004_minha_nova_alteracao.sql`).
3. O `migrator.ts` identificará e aplicará o arquivo automaticamente na próxima vez que o servidor for iniciado via `npm run dev`.

> ⚠️ **Regra Fundamental de Migrações:**
> **NUNCA** altere tabelas já existentes apenas modificando o arquivo `schema.sql`. Alterações em ambientes já em execução devem ser feitas obrigatoriamente criando um novo arquivo de migração em `src/database/migrations/`.
