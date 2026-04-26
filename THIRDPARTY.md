# Third-Party Components

`mtasts-motor` is a Cloudflare Worker with **zero runtime dependencies**. The lockfile entries (169 packages) are transitive devDependencies of the development toolchain only — they do NOT ship in the deployed Worker bundle.

## License inventory (lockfile, 169 packages — devDeps transitive only)

| License | Count |
|---------|-------|
| MIT | 104 |
| Apache-2.0 | 20 |
| MIT OR Apache-2.0 | 13 |
| MPL-2.0 | 12 |
| LGPL-3.0-or-later | 10 |
| Apache-2.0 AND LGPL-3.0-or-later | 3 |
| ISC | 3 |
| Apache-2.0 AND LGPL-3.0-or-later AND MIT | 1 |
| CC0-1.0 | 1 |
| BSD-3-Clause | 1 |
| 0BSD | 1 |

All licenses are permissive or copyleft-compatible with this project's AGPL-3.0-or-later license. LGPL/MPL packages are tooling (not runtime); their compatibility constraints don't apply since none are bundled into the Worker.

## Direct dependencies (devDependencies only)

| Package | Version | License | Origin |
|---------|---------|---------|--------|
| @biomejs/biome | ^2.4.12 | MIT | https://registry.npmjs.org/@biomejs/biome |
| @cloudflare/workers-types | latest | MIT OR Apache-2.0 | https://registry.npmjs.org/@cloudflare/workers-types |
| typescript | ^6.0.3 | Apache-2.0 | https://registry.npmjs.org/typescript |
| vitest | latest | MIT | https://registry.npmjs.org/vitest |
| wrangler | ^4.83.0 | MIT-0 | https://registry.npmjs.org/wrangler |

For an exhaustive package-by-package inventory, run:

```bash
npm ls --all
# or
npx license-checker --json
```

`package-lock.json` in the repo root is the authoritative source for all transitive dependencies and their resolved versions.
