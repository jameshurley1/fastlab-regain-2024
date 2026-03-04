import type { PageServerLoad } from './$types';

export const load = (async () => {
	const apiUrl = process.env.LOCAL_API_URL ?? 'http://127.0.0.1:3001';

	const [usersResponse, sessionsResponse, ratingsResponse, exercisesResponse] = await Promise.all([
		fetch(apiUrl + '/user/list'),
		fetch(apiUrl + '/session/list'),
		fetch(apiUrl + '/ratings/list'),
		fetch(apiUrl + '/exercise/list'),
	]);

	const users = await usersResponse.json();
	const allSessions = await sessionsResponse.json();
	const allRatings = await ratingsResponse.json();
	const allExercises = await exercisesResponse.json();

	const exerciseMap: Record<string, string> = {};
	if (Array.isArray(allExercises)) {
		for (const ex of allExercises) {
			exerciseMap[ex.id] = ex.title;
		}
	}

	const ratingsArray = Array.isArray(allRatings) ? allRatings : [];

	const usersWithData = users.map((u: any) => ({
		...u,
		sessions: allSessions.filter((s: any) => s.userId === u.id),
		ratings: ratingsArray
			.filter((r: any) => r.userId === u.id)
			.map((r: any) => ({ ...r, exerciseTitle: exerciseMap[r.exerciseId] ?? r.exerciseId }))
	}));

	return { users: usersWithData };
}) satisfies PageServerLoad;
