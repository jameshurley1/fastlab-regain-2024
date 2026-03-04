import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const apiUrl = process.env.LOCAL_API_URL ?? 'http://127.0.0.1:3001';

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();

	try {
		await fetch(`${apiUrl}/ratings`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				userId: body.userId ?? '',
				exerciseId: body.exerciseId ?? '',
				type: body.type ?? '',
				rating: Number(body.rating),
				timestamp: body.timestamp ?? new Date().toISOString()
			})
		});
	} catch {
		// best-effort — don't fail the response if the local API is unreachable
	}

	return json({ success: true });
};
