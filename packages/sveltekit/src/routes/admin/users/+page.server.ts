import type { PageServerLoad } from './$types';

export const load = (async () => {
	const apiUrl = process.env.LOCAL_API_URL ?? 'http://localhost:3001';
	const usersUrl = apiUrl + '/user/list';
	const usersResponse = await fetch(usersUrl);
	const users = await usersResponse.json();

	return {
		users
	};
}) satisfies PageServerLoad;
