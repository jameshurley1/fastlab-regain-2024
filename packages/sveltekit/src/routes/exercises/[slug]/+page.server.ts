import type { Actions, PageServerLoad } from './$types';

const API_URL = 'http://localhost:3001';

export const load: PageServerLoad = (async ({ params }) => {
	// Fetch all exercises.
	const exerciseUrl = API_URL + '/exercise/get/' + params.slug;
	const exerciseResponse = await fetch(exerciseUrl);
	const exercise = await exerciseResponse.json();

	return {
		exercises: exercise
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
