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

## 📡 Grupos de Rotas da API

Todas as rotas requerem o header `Authorization: Bearer <token>` (exceto `/auth/login`).
As rotas marcadas com `🔒 ADMIN` exigem perfil de administrador.

| Grupo | Método | Endpoint | Descrição |
|---|---|---|---|
| **Auth** | `POST` | `/api/auth/login` | Autenticação com e-mail e senha. Rate-limited. |
| **Equipamentos** | `GET` | `/api/equipamentos` | Lista paginada com filtros (busca, categoria, marca, modelo). |
| | `GET` | `/api/equipamentos/filtros-disponiveis` | Opções disponíveis para os selects de filtro em cascata. |
| | `GET` | `/api/equipamentos/:id` | Detalhe de um equipamento. |
| | `PUT` | `/api/equipamentos/:id` | Editar equipamento. |
| | `DELETE` | `/api/equipamentos/:id` | Descartar equipamento (soft delete de dados sensíveis). |
| | `POST` | `/api/equipamentos/:id/anexos` | Upload de anexo PDF (Termo de Responsabilidade). |
| **Criação por categoria** | `POST` | `/api/computadores` | Criar Computador. |
| | `POST` | `/api/switches` | Criar Switch. |
| | `POST` | `/api/celulares` | Criar Celular. |
| | `POST` | `/api/nvrs` | Criar NVR. |
| | `POST` | `/api/cameras` | Criar Câmera. |
| | `POST` | `/api/impressoras` | Criar Impressora. |
| | `POST` | `/api/antenas` | Criar Antena Wi-Fi. |
| **Switches — Portas** | `GET` | `/api/switches` | Listar switches. |
| | `GET` | `/api/switches/equipamentos-conectaveis` | Equipamentos aptos a serem conectados em porta. |
| | `GET` | `/api/switches/:id/portas` | Mapa de portas do switch (grade ou lista). |
| | `PUT` | `/api/switches/:id/portas/:numeroPorta` | Vincular/desvincular equipamento a uma porta. |
| **NVRs — Canais** | `GET` | `/api/nvrs` | Listar NVRs. |
| | `GET` | `/api/nvrs/cameras-conectaveis` | Câmeras aptas a serem vinculadas a canal. |
| | `GET` | `/api/nvrs/:id/canais` | Mapa de canais do NVR. |
| | `PUT` | `/api/nvrs/:id/canais/:numeroCanal` | Vincular/desvincular câmera a um canal. |
| **Mapeamento de Rede** | `GET` | `/api/mapeamento-rede` | IPs e MACs; aceita `?subrede=` p/ busca livre. |
| | `GET` | `/api/mapeamento-rede/switches` | Switches listados no mapeamento. |
| **Dashboard** | `GET` | `/api/dashboard` | Resumo: contadores, distribuição por categoria, garantias, IPs e câmeras. |
| **Usuários** 🔒 | `GET` | `/api/usuarios` | Listar usuários. |
| | `POST` | `/api/usuarios` | Criar usuário. |
| | `PUT` | `/api/usuarios/:id` | Editar usuário. |
| | `PUT` | `/api/usuarios/:id/senha` | Redefinir senha. |
| **Opções** | `GET` | `/api/opcoes` | Listar opções pré-definidas (Marca, Modelo, etc.). |
| | `POST` | `/api/opcoes` 🔒 | Criar opção. |
| | `PUT` | `/api/opcoes/:id` 🔒 | Editar opção. |
| | `DELETE` | `/api/opcoes/:id` 🔒 | Excluir opção. |
| **Localizações** | `GET` | `/api/localizacoes` | Listar filiais/salas. |
| | `POST` | `/api/localizacoes` 🔒 | Criar localização. |
| **Impressoras** | `GET` | `/api/impressoras/computadores-conectaveis` | Computadores aptos para vinculação. |

---

## 🛡️ Segurança implementada

- **JWT** para autenticação em todas as rotas (exceto `/auth/login`).
- **Autorização por perfil** via middleware `exigirPerfil('ADMIN')` nas operações sensíveis.
- **Proteção contra SQL Injection**: colunas dinâmicas (ex: `ORDER BY`) usam whitelist no serviço, não interpolação direta.
- **Upload seguro**: extensão e mime-type verificados pelo `uploadMiddleware.ts` antes de persistir.
- **Rate limiting** no endpoint de login (`express-rate-limit`).
- **Helmet** e CORS configurados com lista de origens.

---

## 🧪 Testes Automatizados

Executa a suíte de testes (Vitest + Supertest contra banco isolado `test.db`):
```bash
# Execução única
npm test

# Modo de observação (watch)
npm run test:watch
```

Arquivos em `src/tests/`:

| Arquivo | Cobertura |
|---|---|
| `sanity.test.ts` | Smoke test básico da API. |
| `autorizacao.test.ts` | Autorização por perfil (ADMIN vs comum). |
| `equipamentosService.test.ts` | Serviços de equipamento (CRUD, descarte). |
| `nvrsAndCanais.test.ts` | CRUD de NVRs e vinculação de canais. |
| `antena.test.ts` + `antenasEndpoint.test.ts` | Criação e endpoint de antenas. |
| `migrator.test.ts` | Sistema de migrações automáticas. |
| `nvrCameraMigration.test.ts` | Migração específica de NVR/Câmera. |

---

## 🚀 Executando a Aplicação

### Modo Desenvolvimento
Inicia o servidor com hot-reload via `tsx`:
```bash
npm run dev
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
└── tests/          # Suítes de testes automatizados (sanity, autorizacao, equipamentos,
                    # nvrs, antenas, migrator, nvrCameraMigration).
```

---

## 📝 Como Adicionar uma Nova Migração de Banco

Ao necessitar alterar a estrutura do banco de dados (adicionar colunas, novas tabelas ou índices):

1. Crie um novo arquivo `.sql` dentro de `src/database/migrations/`.
2. Siga o padrão de nomenclatura com prefixo numérico sequencial (exemplo: `0004_minha_nova_alteracao.sql`).
3. O `migrator.ts` identificará e aplicará o arquivo automaticamente na próxima vez que o servidor for iniciado via `npm run dev`.

> ⚠️ **Regra Fundamental de Migrações:**
> **NUNCA** altere tabelas já existentes apenas modificando o arquivo `schema.sql`. Alterações em ambientes já em execução devem ser feitas obrigatoriamente criando um novo arquivo de migração em `src/database/migrations/`.
