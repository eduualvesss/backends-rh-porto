# US07 — Anexo de Documentos Pessoais

Registro do que foi feito, por quê, e o que ficou faltando. Card original tinha 6 itens, 0/6 marcados.

## Contexto

`documentos` (migration 006) já existia no banco antes desta US — só schema, sem model, controller ou rota. Colunas: `colaborador_id` (NOT NULL), `tipo` (CHECK: `ctps`, `cnh`, `dependente`, `outro`), `dependente_nome`, `nome_arquivo`, `caminho_armazenamento`, `tipo_mime`, `tamanho_bytes`, `uploaded_by`, `created_at`.

Permissões `documentos.upload` e `documentos.view` também já estavam no catálogo (migration 003), sem rota nenhuma usando elas.

## Decisões (com o porquê)

### 1. Armazenamento: disco local via multer, não Supabase Storage

`.env.example` não tem nenhuma credencial de storage externo (`DB_URL`, `JWT_SECRET`, `JWT_EXPIRES`, `PORT` só). Configurar Supabase ou S3 agora seria trazer uma dependência de serviço externo pra dentro de uma US que não pede isso.

Ficou isolado em `src/middlewares/uploadDocumento.js` — se decidir migrar depois, troca só esse arquivo. Controller e model não guardam premissa nenhuma sobre onde o arquivo fica, só recebem um caminho.

### 2. Escopo: documento pessoal sempre pertence a um colaborador já cadastrado

`colaborador_id` é `NOT NULL` no schema. Isso define o fluxo pro front: colaborador novo precisa ser criado primeiro (`POST /colaboradores`, pega o `id` de volta) — só depois disso dá pra anexar documento nesse `id`. Não existe "anexar documento antes de o colaborador existir no banco".

### 3. Área de documentos gerais da equipe fica de fora, de propósito

Relatórios, documentação geral, etc. (visíveis pra equipe, não amarrados a um colaborador específico) **não cabem** na tabela `documentos` atual — o `colaborador_id NOT NULL` trava isso estruturalmente. Vai precisar de tabela própria quando essa frente for aberta. Não implementado aqui — fora do escopo do card.

### 4. Permissão de remoção reaproveitada

Catálogo não tem `documentos.delete`. `DELETE /colaboradores/:id/documentos/:documentoId` usa `documentos.upload` (quem anexa, desfaz o próprio anexo). Se o RH quiser separar isso, precisa de permissão nova no catálogo — decisão de negócio, não técnica.

### 5. Validação de tipo e tamanho

`multer` aceita só `application/pdf`, `image/jpeg`, `image/png`, até 5MB. Rejeição vira 400 com JSON (`{ "error": "..." }"`), não stack trace — tratado num middleware de erro próprio (`tratarErroUpload`), porque erro do multer normalmente cai no handler padrão do Express.

### 6. Proteção contra IDOR no download

`GET .../documentos/:documentoId/download` confere `colaborador_id` do documento contra o `:id` da URL. Sem isso, quem tem permissão `documentos.view` conseguiria baixar documento de qualquer colaborador só testando `documentoId` numérico sequencial.

## Arquivos

| Arquivo | O que é |
|---|---|
| `src/middlewares/uploadDocumento.js` | Config do multer (tipo/tamanho aceitos, onde salva no disco) + tratamento de erro |
| `src/models/Documento.js` | Queries na tabela `documentos` |
| `src/controllers/documentoController.js` | Upload, listar, download, remover |
| `src/routes/documentoRoutes.js` | Rotas, aninhadas em `/colaboradores/:id/documentos` |
| `src/routes/colaboradorRoutes.js` | Só montou o router novo (`router.use('/:id/documentos', ...)`) |
| `.gitignore` | Adicionado `uploads/` — arquivo fica só no disco de cada ambiente, nunca commitado |
| `docs/api.md` | Documentado o contrato das rotas novas; corrigido catálogo de permissões que estava desatualizado |
| `README.md` | Tabela de funcionalidades corrigida (US05/06/08/09 estavam marcados pendente, já tinham sido implementados em commits anteriores) |
| `package.json` | Adicionado `multer` |

## Rotas

```
POST   /colaboradores/:id/documentos                   documentos.upload
GET    /colaboradores/:id/documentos                   documentos.view
GET    /colaboradores/:id/documentos/:documentoId/download   documentos.view
DELETE /colaboradores/:id/documentos/:documentoId       documentos.upload
```

Contrato completo (corpo, resposta, códigos de erro) em `docs/api.md`, seção 5.

## Testes

Sem acesso ao Neon a partir de onde isso foi feito (sem `DB_URL`, rede não alcança o host do banco). Testado com o `pool.query` mockado em memória — o resto do fluxo (multer, `authMiddleware`, `authorize`, controller, model) roda de verdade, só o banco é fake.

15 casos cobertos, todos passando:

- upload válido → 201, metadados corretos, `caminho_armazenamento` não vaza na resposta
- `tipo` fora do enum → 400
- mimetype não aceito (`.txt`) → 400
- `tipo=dependente` sem `dependente_nome` → 400
- arquivo maior que 5MB → 400
- colaborador inexistente → 404
- listar → count correto
- download → conteúdo bate byte a byte, nome original no header
- download de documento de outro colaborador (IDOR) → 404
- remover → 204, some da listagem, arquivo some do disco

**Pendente:** rodar esse mesmo fluxo contra o Neon de verdade. Quem tiver `DB_URL` configurado localmente consegue — o teste mockado só prova que a lógica de aplicação está certa, não testa constraint de banco real (`CHECK` de `tipo`, FK de `colaborador_id`, etc.).

## Pendências / próximos passos

- Rodar contra Neon real (item acima)
- Decidir se `documentos.delete` vira permissão própria
- Tabela separada pra documentos gerais da equipe (fora do escopo daqui)
- `docs/api.md` seção 6 ainda lista `ficha-admissao` (US06), `aniversariantes` e `indicadores` (US08/US09) como só "não documentados" — já implementados no código, só falta escrever o contrato

## Nota sobre autoria

`docs/api.md` já creditava US07 ao Cadu antes desta mudança — confirmado nesta sessão que é o dono do card.
