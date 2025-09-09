import { env, createExecutionContext, waitOnExecutionContext, SELF } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';
import worker from '../src';

describe('IP Data worker', () => {
	it('serves static assets for non-API routes (unit style)', async () => {
		const request = new Request('http://example.com');
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);
		// Should return a response from ASSETS
		expect(response.status).toBe(200);
	});

	it('serves static assets for non-API routes (integration style)', async () => {
		const response = await SELF.fetch('http://example.com');
		// Should return a response from ASSETS
		expect(response.status).toBe(200);
	});

	it('handles API requests to /api/ips', async () => {
		const request = new Request('http://example.com/api/ips');
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);
		
		// Should return JSON response
		expect(response.status).toBe(200);
		expect(response.headers.get('Content-Type')).toBe('application/json');
		expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
	});
});
