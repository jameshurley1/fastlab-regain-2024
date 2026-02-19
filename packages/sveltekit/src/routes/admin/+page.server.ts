import type { Actions, PageServerLoad } from './$types';
import { Api } from 'sst/node/api';

export const load = (async () => {
	const usersUrl = Api.regainApi.url + '/user/list';
	console.log('[admin load] fetching:', usersUrl);
	const usersResponse = await fetch(usersUrl);
	console.log('[admin load] response status:', usersResponse.status);
	const users = await usersResponse.json();
	console.log('[admin load] users:', JSON.stringify(users));

	return { users };
}) satisfies PageServerLoad;

export const actions = {
	async getKey({ request }: { request: Request }) {
		const formData = await request.formData();
		const key = formData.get('key')?.toString() || undefined;
		const keyUrl = Api.regainApi.url + '/presignedurl/' + key;
		const keyResponse = await fetch(keyUrl);

		return keyResponse.json();
	}
} satisfies Actions;
