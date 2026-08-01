# Front-end — Aplicação Web Single Page Application (SPA)

Interface do usuário para a plataforma de Gestão de Inventário de TI, desenvolvida com React 19, TypeScript e Vite.

---

## ⚙️ Instalação

Dentro do diretório `front-end`, instale as dependências:

```bash
npm install
```

---

## 🔗 Configuração de Comunicação com a API

A URL base do servidor back-end é configurada através da variável de ambiente do Vite:

```env
VITE_API_URL=http://localhost:3000
```

- A camada de serviço HTTP ([`src/services/api.ts`](./src/services/api.ts)) lê a variável `import.meta.env.VITE_API_URL`.
- Se a variável não estiver definida no ambiente, a aplicação utiliza automaticamente o valor padrão de fallback `http://localhost:3000`.

---

## 🚀 Executando a Aplicação

### Modo Desenvolvimento
Inicia o servidor de desenvolvimento do Vite com Hot Module Replacement (HMR) na porta `5173`:
```bash
npm run dev
```
Acesse `http://localhost:5173` no seu navegador.

### Build de Produção
Executa a checagem de tipos do TypeScript e compila o bundle de produção otimizado:
```bash
npm run build
```
Os arquivos estáticos resultantes serão gerados no diretório `dist/`.

### Captura Automatizada de Screenshots (Playwright)
Com os servidores de back-end (`:3000`) e front-end (`:5173`) já em execução:
```bash
npm run screenshots
```
O script automatizado (Playwright) faz o login, percorre as telas principais com um viewport de notebook (`1440x900`) e atualiza as imagens no diretório `docs/screenshots/` da raiz do projeto.

---

## 📁 Estrutura de Pastas

```text
front-end/src/
├── pages/
│   ├── Login/                 # Tela de autenticação.
│   ├── Dashboard/             # Painel com métricas e alertas.
│   ├── Equipamentos/
│   │   ├── Listagem/          # Tabela paginada com filtros em cascata.
│   │   ├── Cadastro/          # Formulário de criação por categoria.
│   │   └── Detalhes/          # Visualização e edição de equipamento.
│   ├── Switches/
│   │   ├── Listagem/          # Lista de switches cadastrados.
│   │   └── Portas.tsx         # Mapa de portas em grade e lista.
│   ├── Nvrs/
│   │   ├── Listagem/          # Lista de NVRs cadastrados.
│   │   └── Canais.tsx         # Mapa de canais em grade e lista.
│   ├── MapeamentoRede/        # IPs/MACs por sub-rede, colapsáveis, com busca.
│   └── Admin/
│       ├── Usuarios/          # CRUD de usuários e redefinição de senha.
│       ├── Opcoes/            # Cadastro de marcas, modelos e outros valores.
│       └── Localizacoes/      # Cadastro de filiais e salas.
├── components/
│   ├── Layout/                # Shell da aplicação (sidebar, header).
│   ├── ComboBoxSelect/        # Selects encadeados com busca (Marca → Modelo, etc.).
│   └── ModalConfirmacao/      # Modal genérico de confirmação de ações destrutivas.
├── services/              # Camada de comunicação com a API (api.ts, equipamentos.ts, auth.ts, etc.).
├── contexts/
│   ├── AuthContext.tsx        # Usuário autenticado e token JWT.
│   └── ToastContext.tsx        # Sistema global de notificações (toasts).
└── utils/                 # Utilitários e formatadores reutilizáveis (MAC, IMEI, IP, Tag Patrimônio).
```

---

## 🗂️ Páginas e Rotas

| Rota | Página | Descrição |
|---|---|---|
| `/login` | Login | Autenticação com e-mail e senha. |
| `/dashboard` | Dashboard | Métricas, contadores por status e alertas de garantia. |
| `/equipamentos` | Equipamentos — Listagem | Tabela paginada, busca por nome/IP/MAC, filtros em cascata. |
| `/equipamentos/novo` | Equipamentos — Cadastro | Formulário dinâmico adaptado à categoria selecionada. |
| `/equipamentos/:id` | Equipamentos — Detalhes | Visualização, edição e upload de anexo. |
| `/switches` | Switches — Listagem | Lista de switches com link para o mapa de portas. |
| `/switches/:id/portas` | Portas do Switch | Grade e lista de portas; vinculação de equipamento a porta. |
| `/nvrs` | NVRs — Listagem | Lista de NVRs com link para o mapa de canais. |
| `/nvrs/:id/canais` | Canais do NVR | Grade e lista de canais; vinculação de câmera a canal. |
| `/mapeamento-rede` | Mapeamento de Rede | IPs e MACs por sub-rede, grupos colapsáveis, busca livre. |
| `/admin/usuarios` | Admin — Usuários | CRUD de usuários e redefinição de senha (somente ADMIN). |
| `/admin/opcoes` | Admin — Opções | Gerenciamento de marcas, modelos e outros valores (ADMIN). |
| `/admin/localizacoes` | Admin — Localizações | Cadastro de filiais e salas (ADMIN). |

---

## 🎨 Design System e Estilização

- O projeto utiliza **Vanilla CSS** com suporte a **CSS Modules** para isolamento de estilos por componente.
- Os tokens de design globais do sistema estão centralizados em [`src/index.css`](./src/index.css) sob o seletor `:root`:
  - **Cores Semânticas & Tema:** `var(--cor-fundo)`, `var(--cor-cartao)`, `var(--cor-acento)`, `var(--cor-texto)`, etc.
  - **Espaçamento e Raios de Borda:** `var(--raio-sm)`, `var(--raio-md)`, `var(--raio-lg)`, `var(--sombra-cartao)`.
  - **Tipografia:** `var(--fonte-corpo)`, `var(--fonte-display)` e `var(--fonte-mono)` (para IPs, MACs e outros identificadores técnicos).

> 💡 **Boa Prática:** Novos componentes desenvolvidos devem sempre consumir as variáveis de CSS globais (`var(--...)`) em vez de utilizar valores hexadecimais ou medidas em píxeis soltas.
