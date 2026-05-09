# Changelog — MTA-STS Motor

## [Unreleased]

## [v02.00.11] - 2026-05-09
### Alterado
- **`site/index.html`** — iframe `github.com/sponsors/.../card` (caixa branca cross-origin) substituído por link card dark navy com ❤ pink + meta cyan + seta animada; card movido para DEPOIS dos botões (lcv.dev/sponsor primário, GitHub Sponsors alternativa). Companion ship Phase 3 (12 repos). APP_VERSION em `src/index.ts` bumpada + test fixture em paridade.

## [v02.00.10] - 2026-05-09
### Alterado
- **`site/index.html`** — `<style>` block reskinneado pra nova identidade visual dark-first navy/cyan da org LCV (paleta `#050b18`/`#38bdf8`/`#34d399`, gradientes radiais, glow shadows, gradient text no h1). Coordinated companion ship Phase 2 com `calculadora-app` v04.01.17, `oraculo-financeiro` v01.10.04, `astrologo-app` v02.17.23, `admin-app` v02.01.01, `mainsite-app` v03.23.01/v02.19.01, `maestro-app` v0.5.17. Companion à Phase 1 (cross-review-v1 1.12.9, cross-review-v2 v02.18.07, deepseek-cli 0.3.1, grok-cli 1.6.2, sponsor-motor APP v01.02.02, `.github-org/site`). APP_VERSION em `src/index.ts` bumpada de v02.00.09 para v02.00.10 (o constante é referenciado em log do error path do db-failure; teste em src/index.test.ts atualizado em paridade). Sem mudança no Worker runtime; apenas a página GitHub Pages.
- Entrada [Unreleased] anterior (remoção do widget SumUp em `site/index.html`) consolidada aqui — o widget já havia sido removido em ships anteriores.

## [v02.00.09] - 2026-04-30
### Alterado
- `README.md` passou a seguir o novo padrão organizacional de abertura: logo harmonizado, bloco curto de status, tabela `The version history at a glance`, links públicos de release/clone corrigidos para `LCV-Ideas-Software/mtasts-motor` e manutenção explícita do GitHub Sponsors em `lcv-leo`.

## [v02.00.08] - 2026-04-26
### Adicionado
- **`NOTICE`** — atribuição AGPLv3 ao copyright holder (paridade com baseline do workspace).
- **`THIRDPARTY.md`** — inventário completo de dependências runtime e dev + licenças.
### Alterado
- **`.github/workflows/pages.yml`** — `actions/configure-pages@v6.0.0` passou a declarar `with: enablement: true` para idempotência em forks/clones que ainda não tenham GitHub Pages habilitado (corrige `Get Pages site failed... HTTP 404` em primeiro run).
- **CI/Pages modernization** — workflows migraram de `gh-pages` legacy branch para o padrão atual (artifact deployment via `configure-pages` + `upload-pages-artifact` + `deploy-pages`, todos SHA-pinned).
### Validação
- Trilateral cross-review session `08bc6b9a-f3f5-434d-8276-2b21f562a843` (caller + Codex + Gemini) **READY**: paridade confirmada nos 9 repos públicos do workspace.

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
