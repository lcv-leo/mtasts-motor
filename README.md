<p align="center">
  <img src=".github/assets/lcv-ideas-software-logo.svg" alt="LCV Ideas &amp; Software" width="520" />
</p>

# mtasts-motor

[![status: stable](https://img.shields.io/badge/status-stable-brightgreen.svg)](#status)
[![version](https://img.shields.io/github/v/release/LCV-Ideas-Software/mtasts-motor.svg)](https://github.com/LCV-Ideas-Software/mtasts-motor/releases)
[![runtime: Cloudflare Worker](https://img.shields.io/badge/runtime-Cloudflare%20Worker-orange.svg)](https://workers.cloudflare.com/)
[![D1 binding](https://img.shields.io/badge/storage-Cloudflare%20D1-blue.svg)](https://developers.cloudflare.com/d1/)
[![license: AGPL-3.0-or-later](https://img.shields.io/badge/license-AGPL--3.0-blue.svg)](./LICENSE)

A Cloudflare Worker that serves dynamic [MTA-STS](https://datatracker.ietf.org/doc/html/rfc8461) policies from a Cloudflare D1 backing store. Designed to live behind the `mta-sts.<domain>` subdomain convention and respond to `GET /.well-known/mta-sts.txt`.

**Status.** Stable. Current release: **v02.00.11**. See [CHANGELOG.md](./CHANGELOG.md) for the full release history.

The version history at a glance:

| Release                              | Scope                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`v02.00.11`**                      | **Site sponsor card iteration.** `site/index.html` GitHub Sponsors iframe (caixa branca cross-origin) substituído por link card dark navy com ❤ pink + meta cyan + seta animada; card movido para DEPOIS dos botões (lcv.dev/sponsor primário, GitHub Sponsors alternativa). Companion ship Phase 3 (12 repos).                                                                                                                   |
| **`v02.00.10`**                      | **Site visual identity refresh.** `site/index.html` (GitHub Pages) reskinneada para a nova identidade dark-first navy/cyan da org LCV (`#050b18`/`#38bdf8`/`#34d399`, gradientes radiais, glow shadows, gradient text no h1). Coordinated Phase 2 companion ship (calculadora, oraculo, astrologo, admin, mainsite, maestro, mtasts). APP_VERSION bumpada em src/index.ts + test fixture em paridade. Sem mudança no app runtime. |
| **`v02.00.09`**                      | **README organizational standardization.** Adopted the shared repository README opening pattern, corrected public release and clone links to the organization, surfaced the top-level version-history table, and kept the GitHub Sponsors link on `example-beneficiary` by explicit beneficiary decision.                                                                                                                                     |
| **`v02.00.08`**                      | **Publication completeness and Pages modernization.** Added `NOTICE`, `THIRDPARTY.md`, and migrated fully to the current GitHub Pages artifact-deployment model.                                                                                                                                                                                                                                                                  |
| **`v02.00.07`**                      | **Pre-modernization stable line.** Baseline immediately before the publication and documentation completion pass.                                                                                                                                                                                                                                                                                                                 |
| **`Security Publication Hardening`** | **Public repo hygiene.** Hardened ignore rules and package contents so local memories, secrets, and runtime artifacts do not leak into public distribution.                                                                                                                                                                                                                                                                       |

## What it does

[RFC 8461](https://datatracker.ietf.org/doc/html/rfc8461) (MTA-STS, "SMTP MTA Strict Transport Security") requires a sending mail server to fetch a policy file at `https://mta-sts.<recipient-domain>/.well-known/mta-sts.txt` to discover the recipient's enforced TLS posture. Most operators serve this as a static file — fine for a single domain, awkward for multi-domain operators who want a single deploy surface and DB-managed policy text.

This Worker:

- Listens on `GET` / `HEAD` `/.well-known/mta-sts.txt` (other methods → `405`, other paths → `404`).
- Resolves the recipient domain from the `mta-sts.<domain>` host header.
- Looks the policy up in a D1 table `mtasts_mta_sts_policies(domain TEXT PRIMARY KEY, policy_text TEXT)`.
- Returns the raw policy with `Content-Type: text/plain; charset=utf-8`. Cache headers are not set (Cloudflare-managed).
- Restricts methods, scrubs error responses (no version disclosure), and rejects domains that have no row.

## Architecture

```
DNS:  mta-sts.example.com  CNAME  -> mtasts-motor.<account>.workers.dev (or custom domain)
                                 |
                                 v
                         Cloudflare Worker (this repo)
                                 |
                                 v
                          D1 binding: BIGDATA_DB
                                 |
                                 v
              SELECT policy_text FROM mtasts_mta_sts_policies WHERE domain = ?
```

## Deploy your own fork

You will need:

- A Cloudflare account ([free tier](https://www.cloudflare.com/plans/)) with Workers + D1 enabled.
- The Cloudflare CLI [`wrangler`](https://developers.cloudflare.com/workers/wrangler/) (installed locally OR used via `npx`).
- Node.js 20+.

### 1. Clone + install

```bash
git clone https://github.com/LCV-Ideas-Software/mtasts-motor.git
cd mtasts-motor
npm ci
```

### 2. Create your D1 database

```bash
npx wrangler d1 create example_db
# wrangler outputs:
#   database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

Take note of the `database_id` value — you need it for step 3 BEFORE any other `wrangler d1` command can run, because `wrangler d1 execute` resolves the binding via `wrangler.json` and the shipped placeholder will fail the API call.

### 3. Wire the database_id into wrangler.json

`wrangler.json` ships with a placeholder `00000000-0000-0000-0000-000000000000`. Replace it with the ID from step 2:

```jsonc
{
  "d1_databases": [
    {
      "binding": "BIGDATA_DB",
      "database_name": "example_db",
      "database_id": "<your-d1-id-from-step-2>",
    },
  ],
}
```

### 4. Apply the schema

Now that `wrangler.json` has the real ID:

```bash
npx wrangler d1 execute example_db --remote --command "
  CREATE TABLE IF NOT EXISTS mtasts_mta_sts_policies (
    domain TEXT PRIMARY KEY,
    policy_text TEXT NOT NULL
  );
"
```

### 5. Insert at least one policy

```bash
npx wrangler d1 execute example_db --remote --command "
  INSERT INTO mtasts_mta_sts_policies (domain, policy_text) VALUES
    ('example.com', 'version: STSv1
mode: enforce
mx: mail.example.com
max_age: 86400');
"
```

### 6. Deploy

```bash
npx wrangler deploy
```

### 7. Bind a custom domain

For each domain whose policy this Worker should serve, configure a Cloudflare custom domain on the Worker for `mta-sts.<that-domain>`. The Worker host header dispatches per-domain automatically.

## CI deploy (this repo)

This repo's [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) runs `lint → typecheck → test → npm audit (high) → wrangler deploy` on every push to `main`. The deploy step substitutes the placeholder `database_id` in `wrangler.json` from a `D1_DATABASE_ID` GitHub Actions secret before invoking wrangler — keeping the literal D1 ID out of the public source tree.

For your fork, the alternatives are:

- Edit `wrangler.json` directly (commit your real ID — fine for private forks).
- Replicate the secret-injection pattern: set a `D1_DATABASE_ID` repo secret, keep the placeholder in committed `wrangler.json`.

## Repository conventions

- **License**: [AGPL-3.0-or-later](./LICENSE). Network-service trigger applies — running a modified fork as a service obligates you to publish the modifications.
- **Security disclosure**: see [SECURITY.md](./SECURITY.md).
- **Changelog**: [CHANGELOG.md](./CHANGELOG.md).
- **Sponsorship**: see the repo's `Sponsor` button or [central sponsor page](https://www.lcv.dev/sponsor).
- **Action pinning**: all GitHub Actions are pinned by full SHA per supply-chain hardening baseline.

## Links

- Site: [https://mtasts-motor.lcv.dev](https://mtasts-motor.lcv.dev)
- GitHub: [https://github.com/LCV-Ideas-Software/mtasts-motor](https://github.com/LCV-Ideas-Software/mtasts-motor)
- Sponsors: [https://github.com/sponsors/LCV-Ideas-Software](https://github.com/sponsors/LCV-Ideas-Software)

## License

AGPL-3.0-or-later. See [LICENSE](./LICENSE), [NOTICE](./NOTICE), and [THIRDPARTY](./THIRDPARTY.md).

---

<p align="center"><span style="font-size: 1.5em;"><strong>© LCV Ideas &amp; Software</strong></span><br><sub>LEONARDO CARDOZO VARGAS TECNOLOGIA DA INFORMACAO LTDA<br>Rua Pais Leme, 215 Conj 1713 - Pinheiros<br>São Paulo - SP<br>CEP 05.424-150<br>CNPJ: 66.584.678/0001-77<br>IM 05.424-150</sub></p>
