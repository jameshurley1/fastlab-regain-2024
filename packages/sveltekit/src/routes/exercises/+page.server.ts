import type { Actions, PageServerLoad } from './$types';

const API_URL = 'http://localhost:3001';

export const load = (async () => {
	// Fetch all exercises.
	const exerciseUrl = API_URL + '/exercise/list';
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
		const keyUrl = API_URL + '/presignedurl/' + key;
		const keyResponse = await fetch(keyUrl);

		return keyResponse.json();
	}
} satisfies Actions;
