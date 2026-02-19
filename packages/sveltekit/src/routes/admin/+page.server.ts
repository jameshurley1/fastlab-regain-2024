import type { Actions, PageServerLoad } from './$types';

const API_URL = 'http://127.0.0.1:3001';

export const load = (async () => {
	const usersUrl = API_URL + '/user/list';
	const usersResponse = await fetch(usersUrl);
	const users = await usersResponse.json();

	return { users };
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
