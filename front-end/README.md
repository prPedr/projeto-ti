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
├── pages/       # Telas da aplicação (Login, Equipamentos, MapeamentoRede, Switches, Admin, etc.).
├── components/  # Componentes reutilizáveis de UI (Layout, ComboBoxSelect, ModalConfirmacao, etc.).
├── services/    # Camada de comunicação com a API (api.ts, equipamentos.ts, auth.ts, etc.).
├── contexts/    # Provedores de estado global do React (AuthContext.tsx, ToastContext.tsx).
└── utils/       # Utilitários e formatadores reutilizáveis (MAC, IMEI, IP, Tag Patrimonio).
```

---

## 🎨 Design System e Estilização

- O projeto utiliza **Vanilla CSS** com suporte a **CSS Modules** para isolamento de estilos por componente.
- Os tokens de design globais do sistema estão centralizados em [`src/index.css`](./src/index.css) sob o seletor `:root`:
  - **Cores Semânticas & Tema:** `var(--cor-fundo)`, `var(--cor-cartao)`, `var(--cor-acento)`, `var(--cor-texto)`, etc.
  - **Espaçamento e Raios de Borda:** `var(--raio-sm)`, `var(--raio-md)`, `var(--sombra-cartao)`.
  - **Tipografia:** `var(--fonte-corpo)` e `var(--fonte-display)`.

> 💡 **Boa Prática:** Novos componentes desenvolvidos devem sempre consumir as variáveis de CSS globais (`var(--...)`) em vez de utilizar valores hexadecimais ou medidas em píxeis soltas.
