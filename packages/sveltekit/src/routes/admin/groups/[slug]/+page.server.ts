import type { PageServerLoad } from './$types';
import { Api } from 'sst/node/api';

export const load = (async ({ params }) => {
	const groupUrl = Api.regainApi.url + '/group/get/' + params.slug;
	const groupResponse = await fetch(groupUrl);
	const group = await groupResponse.json();

	return {
		group
	};
}) satisfies PageServerLoad;
