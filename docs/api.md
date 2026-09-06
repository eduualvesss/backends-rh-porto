Contrato da API — Sistema de RH Porto Digital
Versão 1 · 02/09/2026 · back-end Node.js/Express
Este documento descreve o que cada rota recebe e o que devolve. Serve para o front integrar sem precisar ler o código do back.
> ⚠️ **Itens marcados com `[CONFIRMAR]` não foram verificados no código.** Antes de o front usar, alguém precisa abrir o arquivo indicado e conferir.
---
Informações gerais
URL base (desenvolvimento): `http://localhost:3000`
Formato: JSON em todas as requisições e respostas.
Autenticação: todas as rotas, exceto `/auth/register` e `/auth/login`, exigem o cabeçalho:
```
Authorization: Bearer <token>
```
O token vem do login e expira conforme `JWT_EXPIRES` no `.env` (atualmente 1 hora).
Erros padronizados: todo erro devolve um objeto com a chave `error` e uma mensagem em português.
```json
{ "error": "token não fornecido" }
```
Código	Quando acontece
400	Dados inválidos ou faltando na requisição
401	Sem token, token inválido ou expirado, ou credenciais erradas
403	Autenticado, mas sem a permissão necessária
404	Recurso não encontrado
409	Conflito — o recurso já existe
500	Erro no servidor
---
1. Autenticação
Módulo do Cadu (US01). Arquivos: `authController.js`, `authRoutes.js`.
POST `/auth/register`
Cria um usuário do sistema (pessoa do RH, não colaborador).
Não exige token.
Recebe:
```json
{
  "email": "pessoa@portodigital.org",
  "password": "SenhaSegura123"
}
```
⚠️ O campo é `password`, não `senha`. Erro comum.
Devolve — 201:
```json
{
  "id": 6,
  "email": "pessoa@portodigital.org"
}
```
A senha nunca é devolvida, em nenhuma circunstância.
Erros:
Código	Situação
400	`email` ou `password` faltando
409	E-mail já cadastrado
---
POST `/auth/login`
Autentica e devolve o token.
Não exige token.
Recebe:
```json
{
  "email": "pessoa@portodigital.org",
  "password": "SenhaSegura123"
}
```
Devolve — 200:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
O token carrega `id` e `email` do usuário. Não carrega papel nem permissões — isso é consultado no banco a cada requisição, de propósito, para que revogação valha imediatamente.
Erros:
Código	Situação
400	`email` ou `password` faltando
401	Credenciais inválidas
A mensagem de erro do 401 é genérica de propósito: não revela se o e-mail existe ou se apenas a senha está errada.
Efeito colateral: toda tentativa, bem ou mal sucedida, gera registro em `audit_logs` (ações `LOGIN` e `LOGIN_FAILED`).
---
GET `/auth/profile`
Devolve os dados do usuário autenticado.
Exige token.
Devolve — 200: `[CONFIRMAR o formato exato em `User.js`, função `findById`]`
```json
{
  "id": 4,
  "email": "pessoa@portodigital.org"
}
```
⚠️ Ponto de atenção: a coluna `role` foi adicionada à tabela `users` no US02. Confirmar se ela aparece nesta resposta — pode ser informação útil para o front decidir o que mostrar na tela.
Erros:
Código	Situação
401	Token ausente ou inválido
404	Usuário não encontrado
---
2. Log de Auditoria
Módulo do Igor (US03). Arquivos: `auditController.js`, `auditRoutes.js`.
GET `/audit-logs`
Lista os registros de auditoria, do mais recente para o mais antigo.
Exige token + permissão `auditlog.view`.
Parâmetros de consulta (todos opcionais):
Parâmetro	Tipo	Descrição
`page`	número	Página. Começa em 1.
`limit`	número	Registros por página.
`userId`	número	Filtra por quem executou a ação.
`action`	texto	Filtra por tipo de ação.
Exemplo: `GET /audit-logs?page=2&limit=20&action=LOGIN`
Devolve — 200: `[CONFIRMAR o nome da chave que envolve o array em `auditController.js`]`
```json
{
  "logs": [
    {
      "id": 53,
      "user_id": 5,
      "action": "LOGIN",
      "resource": "usuario",
      "resource_id": 5,
      "before_data": null,
      "after_data": null,
      "ip_address": "::1",
      "created_at": "2026-08-30T20:03:08.549Z"
    }
  ]
}
```
Ações registradas hoje:
Ação	Quando	Onde ficam os dados
`LOGIN`	Login bem-sucedido	—
`LOGIN_FAILED`	Login recusado	`after_data`: `attemptedEmail` e `reason` (`user_not_found` ou `invalid_credentials`)
`GRANT_PERMISSION`	Permissão concedida	`after_data`

`REVOKE_PERMISSION`	Permissão revogada	`before_data`
Erros:
Código	Situação
401	Token ausente ou inválido
403	Sem a permissão `auditlog.view`
---
3. Permissões
Módulo do Igor (US02). Arquivos: `permissionController.js`, `permissionRoutes.js`, `Permission.js`, `authorize.js`.
Como funciona o controle de acesso
Duas camadas:
`role` na tabela `users` — `'admin'` ou `'usuario'`. Quem é admin passa em qualquer verificação, sem consultar permissões.
Permissões individuais — para todos os outros, concedidas uma a uma.
Um usuário admin não precisa de nenhuma linha em `user_permissions`.
Catálogo de permissões
Chave	Protege
`colaboradores.view`	`GET /colaboradores`, `GET /colaboradores/:id`, `GET /colaboradores/cpf/:cpf`, `GET /colaboradores/:id/ficha-admissao`, `GET /dashboard/*`
`colaboradores.create`	`POST /colaboradores`
`colaboradores.edit`	`PUT /colaboradores/:id`
`colaboradores.delete`	`DELETE /colaboradores/:id`
`documentos.upload`	`POST /colaboradores/:id/documentos`, `DELETE /colaboradores/:id/documentos/:documentoId` (ver seção 5 — sem chave própria pra delete)
`documentos.view`	`GET /colaboradores/:id/documentos`, `GET /colaboradores/:id/documentos/:documentoId/download`
`auditlog.view`	`GET /audit-logs`
`usuarios.manage`	Todas as rotas desta seção
`relatorios.export`	Ainda sem rota
Chave fora dessa lista é rejeitada com 400.
---
GET `/usuarios/:id/permissoes`
Lista as permissões de um usuário.
Exige token + permissão `usuarios.manage`.
Devolve — 200: `[CONFIRMAR formato em `permissionController.js`]`
```json
[
  { "key": "auditlog.view", "description": "Visualizar log de auditoria" }
]
```
⚠️ Limitação conhecida: usuário inexistente e usuário sem permissões devolvem a mesma coisa — array vazio. O front não consegue distinguir os dois casos.
Erros:
Código	Situação
400	`id` não é numérico
401	Token ausente ou inválido
403	Sem a permissão `usuarios.manage`
---
POST `/usuarios/:id/permissoes`
Concede uma permissão.
Exige token + permissão `usuarios.manage`.
Recebe:
```json
{ "key": "colaboradores.view" }
```
Devolve — 201: `[CONFIRMAR corpo da resposta]`
Comportamento: conceder uma permissão que o usuário já tem não gera erro nem duplica (tratado por `ON CONFLICT`), e também não gera registro no log de auditoria.
Erros:
Código	Situação
400	`id` não numérico, ou `key` fora do catálogo
401	Token ausente ou inválido
403	Sem a permissão `usuarios.manage`
404	Usuário não existe
---
DELETE `/usuarios/:id/permissoes/:key`
Revoga uma permissão.
Exige token + permissão `usuarios.manage`.
Exemplo: `DELETE /usuarios/5/permissoes/auditlog.view`
Devolve: `[CONFIRMAR se é 200 com corpo ou 204 sem corpo]`
Comportamento importante para o front: a revogação vale imediatamente. Um token emitido antes da revogação deixa de dar acesso na requisição seguinte, sem precisar de novo login. Isso foi testado e confirmado.
Erros:
Código	Situação
400	`id` não numérico ou `key` inválida
401	Token ausente ou inválido
403	Sem a permissão `usuarios.manage`
404	Usuário não existe
---
4. Colaboradores
Arquivos: `colaboradorController.js`, `colaboradorRoutes.js`, `Colaborador.js`.
GET `/colaboradores/cpf/:cpf`
Busca um colaborador pelo CPF. Complementa a busca por `:id` (US04) para os casos em que o front só tem o CPF em mãos (ex.: conferência de admissão).
Exige token + permissão `colaboradores.view`.
Aceita o CPF com ou sem pontuação na URL (`/colaboradores/cpf/52998224725` ou `/colaboradores/cpf/529.982.247-25`) — os caracteres não numéricos são descartados antes da validação.
⚠️ Precisa vir antes de `GET /colaboradores/:id` no router — senão o Express entende "cpf" como valor de `:id`.
Devolve — 200:
```json
{
  "id": 12,
  "nome": "Fulano de Tal",
  "email": "fulano@portodigital.org",
  "cpf": "52998224725",
  "telefone": "11999999999",
  "cargo": "Analista",
  "departamento": "TI",
  "data_admissao": "2024-03-01",
  "status": "ativo"
}
```
Erros:
Código	Situação
400	CPF com formato ou dígitos verificadores inválidos
401	Token ausente ou inválido
403	Sem a permissão `colaboradores.view`
404	Nenhum colaborador com esse CPF
---
5. Documentos (US07)
Módulo do Cadu (US07). Arquivos: `documentoController.js`, `documentoRoutes.js`, `Documento.js`, `uploadDocumento.js`. Tabela `documentos` (migration 006).
Armazenamento: disco local via `multer`, não Supabase/S3 — `.env.example` não tem credencial de storage externo configurada, então subir uma dependência de serviço externo ficaria fora do escopo desta US. Migrar depois é só trocar `uploadDocumento.js`; controller e model não sabem onde o arquivo fica salvo.
Todas as rotas abaixo são aninhadas em `/colaboradores/:id/documentos`, onde `:id` é o colaborador dono do documento.
POST `/colaboradores/:id/documentos`
Anexa um documento (CTPS, CNH ou documento de dependente) a um colaborador.
Exige token + permissão `documentos.upload`.
Corpo: `multipart/form-data`, não JSON.
Campo	Tipo	Obrigatório
`arquivo`	arquivo	Sim — PDF, JPG ou PNG, até 5MB
`tipo`	texto	Sim — um de: `ctps`, `cnh`, `dependente`, `outro`
`dependente_nome`	texto	Só se `tipo = dependente`
Devolve — 201:
```json
{
  "id": 7,
  "colaborador_id": 42,
  "tipo": "ctps",
  "dependente_nome": null,
  "nome_arquivo": "ctps-joao.pdf",
  "tipo_mime": "application/pdf",
  "tamanho_bytes": 184320,
  "uploaded_by": 1,
  "created_at": "2026-09-06T20:47:00.000Z"
}
```
⚠️ O campo `caminho_armazenamento` (onde o arquivo fica no disco do servidor) nunca aparece na resposta — é detalhe interno.
Erros:
Código	Situação
400	`arquivo` ausente, `tipo` fora do enum, `dependente_nome` faltando quando `tipo = dependente`, tipo de arquivo não aceito, ou arquivo maior que 5MB
401	Token ausente ou inválido
403	Sem a permissão `documentos.upload`
404	Colaborador não encontrado
---
GET `/colaboradores/:id/documentos`
Lista os documentos de um colaborador, mais recente primeiro.
Exige token + permissão `documentos.view`.
Devolve — 200:
```json
{
  "colaborador_id": 42,
  "count": 1,
  "documentos": [
    {
      "id": 7,
      "colaborador_id": 42,
      "tipo": "ctps",
      "dependente_nome": null,
      "nome_arquivo": "ctps-joao.pdf",
      "tipo_mime": "application/pdf",
      "tamanho_bytes": 184320,
      "uploaded_by": 1,
      "created_at": "2026-09-06T20:47:00.000Z"
    }
  ]
}
```
Erros:
Código	Situação
400	`id` do colaborador não é numérico
401	Token ausente ou inválido
403	Sem a permissão `documentos.view`
404	Colaborador não encontrado
---
GET `/colaboradores/:id/documentos/:documentoId/download`
Baixa o arquivo original. Resposta é o binário do arquivo, não JSON.
Exige token + permissão `documentos.view`.
⚠️ `:documentoId` precisa pertencer ao colaborador `:id` da URL — um documento de outro colaborador devolve 404, mesmo que o `:documentoId` exista de verdade (proteção contra acessar documento de colaborador errado só adivinhando o id numérico).
Erros:
Código	Situação
400	`id` ou `documentoId` não numérico
401	Token ausente ou inválido
403	Sem a permissão `documentos.view`
404	Documento não encontrado, não pertence a esse colaborador, ou o arquivo sumiu do disco do servidor
---
DELETE `/colaboradores/:id/documentos/:documentoId`
Remove o documento (registro no banco + arquivo no disco).
Exige token + permissão `documentos.upload`.
⚠️ O catálogo de permissões não tem uma chave própria pra deletar documento — esta rota reaproveita `documentos.upload` (quem pode anexar também pode desfazer o próprio anexo). Se isso não for o comportamento desejado, precisa de uma permissão `documentos.delete` nova no catálogo.
Devolve — 204, sem corpo.
Erros:
Código	Situação
400	`id` ou `documentoId` não numérico
401	Token ausente ou inválido
403	Sem a permissão `documentos.upload`
404	Documento não encontrado ou não pertence a esse colaborador
---
6. Rotas ainda não documentadas neste arquivo
⚠️ Estas rotas já existem no código (não são "não implementadas" — foram entregues antes do documento ser atualizado), só falta escrever o contrato aqui. Não confundir com pendência de desenvolvimento.
Rota	US	Dono
`GET /colaboradores/:id/ficha-admissao`	US06	Igor
`GET /dashboard/aniversariantes`	US08	Igor
`GET /dashboard/indicadores`	US09	Igor
Quem for mexer numa dessas, documentar aqui no mesmo formato das seções acima antes do front integrar.
---
6. Observações para quem for consumir a API
Sempre trate o 403 diferente do 401. O 401 significa "faça login de novo". O 403 significa "você está logado, mas não pode fazer isso" — pedir novo login não resolve, e mandar o usuário para a tela de login nesse caso é confuso.
Não guarde permissões no front como verdade permanente. Elas mudam no servidor a qualquer momento e a mudança vale na hora. Se a tela esconder um botão baseado em permissão, ela pode ficar desatualizada — mas o back vai barrar de qualquer forma.
Inconsistência de rotas conhecida: `/auth/*` usa prefixo montado no `server.js`, enquanto as rotas de auditoria e permissões trazem o caminho completo dentro do próprio router. Funciona igual, é só um detalhe de organização interna. Não afeta quem consome.
