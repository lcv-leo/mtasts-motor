// Módulo: mtasts-motor/src/index.ts
// Descrição: Worker que intercepta subdomínios `mta-sts.*` e fornece dinamicamente políticas MTA-STS ativas conectadas via BIGDATA_DB.

const APP_VERSION = 'APP v02.00.11';

interface Env {
  BIGDATA_DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method Not Allowed', {
        status: 405,
        headers: {
          Allow: 'GET, HEAD',
        },
      });
    }

    if (url.pathname !== '/.well-known/mta-sts.txt') {
      return new Response('Not found', { status: 404 });
    }

    const hostParts = url.hostname.split('.');

    // Valida o prefixo 'mta-sts' obrigatório do subdomínio
    if (hostParts[0] !== 'mta-sts' || hostParts.length < 3) {
      return new Response('Invalid hostname setup for MTA-STS', { status: 400 });
    }

    // Extrai o domínio raiz
    const rootDomain = hostParts.slice(1).join('.');

    try {
      // Consulta a tabela oficial padronizada na BIGDATA_DB
      const stmt = env.BIGDATA_DB.prepare('SELECT policy_text FROM mtasts_mta_sts_policies WHERE domain = ?').bind(
        rootDomain,
      );
      const record = await stmt.first<{ policy_text: string }>();

      if (!record?.policy_text) {
        return new Response('MTA-STS policy not configured for this domain.', { status: 404 });
      }

      return new Response(record.policy_text, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
        },
      });
    } catch (error) {
      // Compliance: tratamento rígido de exceções (no-explicit-any)
      const errMessage = error instanceof Error ? error.message : String(error);
      console.error(`[mtasts-motor] ${APP_VERSION} ${errMessage}`);
      return new Response('Internal Server Error', { status: 500 });
    }
  },
};
