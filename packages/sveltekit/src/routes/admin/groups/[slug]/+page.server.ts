import type { PageServerLoad } from './$types';

const API_URL = 'http://127.0.0.1:3001';

export const load = (async ({ params }) => {
	const groupUrl = API_URL + '/group/get/' + params.slug;
	const groupResponse = await fetch(groupUrl);
	const group = await groupResponse.json();

	return {
		group
	};
}) satisfies PageServerLoad;
