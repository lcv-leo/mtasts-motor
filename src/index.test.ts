import { afterEach, describe, expect, it, vi } from 'vitest';

import worker from './index';

type PolicyRecord = { policy_text?: string } | null;

function createEnv(record: PolicyRecord, options?: { throwOnFirst?: boolean }) {
  return {
    BIGDATA_DB: {
      prepare(query: string) {
        expect(query).toBe('SELECT policy_text FROM mtasts_mta_sts_policies WHERE domain = ?');

        return {
          bind(domain: string) {
            return {
              async first() {
                if (options?.throwOnFirst) {
                  throw new Error(`db-failure:${domain}`);
                }

                return record;
              },
            };
          },
        };
      },
    },
  } as unknown as { BIGDATA_DB: D1Database };
}

describe('mtasts-motor', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 405 for unsupported methods', async () => {
    const response = await worker.fetch(
      new Request('https://mta-sts.example.com/.well-known/mta-sts.txt', { method: 'POST' }),
      createEnv({ policy_text: 'unused' }),
      {} as ExecutionContext,
    );

    expect(response.status).toBe(405);
    expect(response.headers.get('Allow')).toBe('GET, HEAD');
    expect(await response.text()).toBe('Method Not Allowed');
  });

  it('returns 404 for non-policy paths without leaking the app version', async () => {
    const response = await worker.fetch(
      new Request('https://mta-sts.example.com/'),
      createEnv({ policy_text: 'unused' }),
      {} as ExecutionContext,
    );

    expect(response.status).toBe(404);
    expect(await response.text()).toBe('Not found');
  });

  it('returns 400 when the hostname is not under mta-sts', async () => {
    const response = await worker.fetch(
      new Request('https://example.com/.well-known/mta-sts.txt'),
      createEnv({ policy_text: 'unused' }),
      {} as ExecutionContext,
    );

    expect(response.status).toBe(400);
    expect(await response.text()).toBe('Invalid hostname setup for MTA-STS');
  });

  it('returns 404 when no policy is configured for the domain', async () => {
    const response = await worker.fetch(
      new Request('https://mta-sts.example.com/.well-known/mta-sts.txt'),
      createEnv(null),
      {} as ExecutionContext,
    );

    expect(response.status).toBe(404);
    expect(await response.text()).toBe('MTA-STS policy not configured for this domain.');
  });

  it('returns the policy text with a plain-text content type and no custom cache header', async () => {
    const response = await worker.fetch(
      new Request('https://mta-sts.example.com/.well-known/mta-sts.txt'),
      createEnv({
        policy_text: 'version: STSv1\nmode: enforce\nmx: example.com\nmax_age: 86400',
      }),
      {} as ExecutionContext,
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/plain; charset=utf-8');
    expect(response.headers.has('Cache-Control')).toBe(false);
    expect(await response.text()).toContain('mode: enforce');
  });

  it('returns 500 and logs the failure when D1 throws', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const response = await worker.fetch(
      new Request('https://mta-sts.example.com/.well-known/mta-sts.txt'),
      createEnv(null, { throwOnFirst: true }),
      {} as ExecutionContext,
    );

    expect(response.status).toBe(500);
    expect(await response.text()).toBe('Internal Server Error');
    expect(consoleError).toHaveBeenCalledWith('[mtasts-motor] APP v02.00.11 db-failure:example.com');
  });
});
