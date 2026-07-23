# Back-end

## Banco de dados

O arquivo `src/database/app.db` não é versionado no git — cada ambiente (local ou produção) tem o seu.

**Banco novo (primeira vez rodando o projeto):**

```
npm run setup
```

Cria `app.db` a partir de `src/database/schema.sql` e marca todas as migrações existentes como já aplicadas.

**Banco já existente e desatualizado:** não precisa rodar nada manualmente — as migrações pendentes em `src/database/migrations/` são aplicadas automaticamente ao iniciar o servidor (`npm run dev`), antes de qualquer rota começar a atender requisições.

**Adicionando uma nova mudança de schema:** crie um arquivo `.sql` novo em `src/database/migrations/`, numerado sequencialmente (ex: `0002_minha_mudanca.sql`). Ele será aplicado automaticamente na próxima vez que o servidor subir.
