# Sistema de RH — Porto Digital

Sistema de RH desenvolvido para a Residência Tecnológica do Porto Digital. Este repositório contém o back-end.

## Stack

- Node.js + Express
- PostgreSQL (hospedado no Neon)
- JWT + bcrypt para autenticação
- Sem ORM — conexão direta via `pg`, queries sempre parametrizadas

## Como rodar

```bash
npm install
cp .env.example .env
# preencher DB_URL, JWT_SECRET, JWT_EXPIRES no .env

# rodar as migrations, em ordem, contra o banco (ver pasta migrations/)
node migrations/000_create_users.sql
# ...

npm start
```

O servidor sobe na porta definida em `PORT` no `.env` (padrão 3000).

## Estrutura de pastas

```
src/
  config/       conexão com o banco
  controllers/  lógica de cada rota
  middlewares/  autenticação (authMiddleware) e permissões (authorize)
  models/       queries ao banco
  routes/       mapeamento de endpoints
migrations/     scripts de criação/alteração de tabelas, numerados em ordem
seeds/          dados de exemplo para testes
docs/           contrato da API (api.md)
```

MVC direto, sem pasta de módulo por cima — todo controller/model/route fica direto em `src/`.

## Autenticação e permissões

Toda rota protegida passa por `authMiddleware` (confere se o token é válido) e, quando a ação exige permissão específica, também por `authorize('chave.da.permissao')` (confere se o usuário tem aquela permissão concedida).

Usuários com `role = 'admin'` passam direto em qualquer `authorize()`, sem precisar de permissão concedida — é a trava de segurança contra lockout do sistema.

Catálogo de permissões e como conceder: ver `docs/api.md` e a tabela `permissions` no banco.

## Funcionalidades

| Módulo | Status |
|---|---|
| Autenticação (login/registro) | ✅ Pronto |
| Log de auditoria | ✅ Pronto |
| Permissões granulares (US02) | ✅ Pronto |
| Cadastro de colaboradores (US04) | ✅ Pronto |
| Busca por CPF (US05) | ⏳ Pendente |
| Ficha de admissão em PDF (US06) | ⏳ Pendente |
| Documentos (US07) | ⏳ Pendente |

## Códigos de erro do Postgres tratados

| Código | Significa | Resposta da API |
|---|---|---|
| `23505` | Valor duplicado (email/CPF já existe) | 409 |
| `23514` | Valor fora do permitido (CHECK) | 400 |
| `23502` | Campo obrigatório faltando | 400 |

## Time

Ver `docs/api.md` para o contrato completo de cada rota (parâmetros, respostas, exemplos).