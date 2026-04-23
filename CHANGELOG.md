# Changelog — MTA-STS Motor

## [Security Publication Hardening] - 2026-04-23
### Segurança
- Memórias e contexto de agentes passaram a ser locais apenas: `.ai/` e `.github/copilot-instructions.md` foram adicionados ao ignore e removidos do índice Git com `git rm --cached`, preservando os arquivos no disco local.
- Regras de publicação foram endurecidas para impedir envio de `.env*`, `.dev.vars*`, `.wrangler/`, `.tmp/`, logs, bancos locais e artefatos de teste para GitHub/npm.
### Validação
- `git ls-files` confirmou ausência de memórias/artefatos locais rastreados; `npm pack --dry-run --json --ignore-scripts` não incluiu arquivos proibidos.

## [v02.00.07] - 2026-04-17
### Alterado
- `wrangler.json` passou a definir `workers_dev: false`, removendo a exposição do Worker em `mtasts-motor.lcv.workers.dev`.
### Motivação
- O estado ao vivo da Cloudflare confirmou 11 custom domains ativos (`mta-sts.*`) apontando para o `mtasts-motor` e nenhum route clássico, então o `workers.dev` deixou de ser necessário como superfície pública do runtime.

## [v02.00.06] - 2026-04-17
### Corrigido
- O handler agora rejeita métodos diferentes de `GET`/`HEAD` com `405`, remove a exposição desnecessária do `APP_VERSION` em respostas `404` e deixa de enviar `Cache-Control` próprio, em conformidade com a diretiva global do workspace.
- `README.md` e `SECURITY.md` foram realinhados ao comportamento e aos controles realmente verificáveis do repositório, removendo deriva documental sobre TLS-RPT, CodeQL e branch protection.
### Adicionado
- `src/index.test.ts` cobre os caminhos `405`, `404`, `400`, `404 sem policy`, `200` e `500`, reduzindo risco de regressão silenciosa no Worker.
- O workflow `Deploy` passou a executar `npm audit --audit-level=high`, `npm run lint`, `npm run typecheck` e `npm test` antes do deploy, usando o `wrangler` versionado no próprio repositório.
### Alterado
- Tooling atualizado: `@biomejs/biome` `2.4.11 -> 2.4.12`, `@cloudflare/workers-types` `4.20260411.1 -> 4.20260417.1`, `typescript` `6.0.2 -> 6.0.3`, `wrangler` `4.81.1 -> 4.83.0` e `vitest` `4.1.4` adicionado.
### Motivação
- Fechar fragilidades reais de pipeline, documentação e superfície HTTP identificadas na auditoria rigorosa do `mtasts-motor`.

## [v02.00.05] - 2026-04-17
### Alterado
- `wrangler.json` passou a declarar explicitamente `observability.logs.enabled = true`, `observability.logs.invocation_logs = true` e `observability.traces.enabled = true`.
- `src/index.ts` recebeu limpeza de lint/TypeScript (`template literal`, `optional chaining` e contexto `_ctx`) para manter o gate local verde no fechamento.
### Motivação
- Alinhar o baseline de telemetria Cloudflare do `mtasts-motor` ao padrão operacional do workspace.


## [v02.00.04] - 2026-04-11
### Alterado
- **Log prefix**: `console.error` prefixado com `[mtasts-motor]` para observabilidade unificada.

## [v02.00.03] - 2026-04-10
### Adicionado
- **Biome 2.x**: lint + format com organizeImports
- **wrangler local**: adicionado ao devDependencies (antes dependia de instalação global)

### Alterado
- **ESM**: module type mudado de commonjs para module
- **@cloudflare/workers-types**: atualizado para 4.20260411
- **Dependabot groups**: @vitest/* e @biomejs/* adicionados

## [v02.00.02] — 2026-04-06
### Alterado
- **Full Rename**: Worker renomeado de `mta-sts-server` para `mtasts-motor` em `wrangler.json`, `package.json`, `README.md`, código fonte e repositório GitHub.
- **Compatibility Date**: `wrangler.json` atualizado para `2026-04-06`.
### Controle de versão
- `mtasts-motor`: v02.00.01 → v02.00.02


## [v02.00.01] — 2026-04-06
### Alterado
- **Observability 100%**: `head_sampling_rate: 1`, `invocation_logs: true` e `logs.enabled: true` ativados no `wrangler.json`.

### Controle de versão
- `mtasts-motor`: v02.00.00 → v02.00.01

## [v02.00.00] — 2026-04-02
### Alterado
- **Arquitetura D1**: Renomeação da tabela acessada para `mtasts_mta_sts_policies`, permitindo o acesso direto aos dados consolidados pelo Admin-App.
- **Ecossistema Workspace**: Adicionado suporte TypeScript nativo, `wrangler.json`, e diretivas do repositório para deployment automático de CI.

### Corrigido
- Exceções e erros sendo mascarados de instabilidade na consulta agora são expostos no terminal usando padronização Compliance de tipo de execeção (`error instanceof Error`).
