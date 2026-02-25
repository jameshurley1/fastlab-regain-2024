import type { Actions, PageServerLoad } from './$types';

export const load = (async () => {
	const apiUrl = process.env.LOCAL_API_URL ?? 'http://localhost:3001';
	// Fetch all exercises.
	const exerciseUrl = apiUrl + '/exercise/list';
	const exerciseResponse = await fetch(exerciseUrl);
	const exercises = await exerciseResponse.json();

	return {
		exercises: exercises
	};
}) satisfies PageServerLoad;

export const actions = {
	async getKey({ request }: { request: Request }) {
		const formData = await request.formData();
		const key = formData.get('key')?.toString() || undefined;
		const keyUrl = (process.env.LOCAL_API_URL ?? 'http://localhost:3001') + '/presignedurl/' + key;
		const keyResponse = await fetch(keyUrl);

		return keyResponse.json();
	}
} satisfies Actions;
