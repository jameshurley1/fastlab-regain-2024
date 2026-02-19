import type { PageServerLoad } from './$types';
import { Api } from 'sst/node/api';

export const load = (async () => {
	const usersUrl = Api.regainApi.url + '/user/list';
	const usersResponse = await fetch(usersUrl);
	const users = await usersResponse.json();

	return {
		users
	};
}) satisfies PageServerLoad;
