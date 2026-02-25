import type { PageServerLoad } from './$types';

export const load = (async () => {
	const apiUrl = process.env.LOCAL_API_URL ?? 'http://localhost:3001';

	const [usersResponse, sessionsResponse] = await Promise.all([
		fetch(apiUrl + '/user/list'),
		fetch(apiUrl + '/session/list')
	]);

	const users = await usersResponse.json();
	const allSessions = await sessionsResponse.json();

	const usersWithSessions = users.map((u: any) => ({
		...u,
		sessions: allSessions.filter((s: any) => s.userId === u.id)
	}));

	return { users: usersWithSessions };
}) satisfies PageServerLoad;
