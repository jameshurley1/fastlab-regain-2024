import type { Actions, PageServerLoad } from './$types';
import { Api } from 'sst/node/api';

export const load: PageServerLoad = (async ({ params, locals }) => {
	const apiUrl = Api.regainApi.url;

	// Fetch the exercise
	const exerciseResponse = await fetch(`${apiUrl}/exercise/get/${params.slug}`);
	const exercise = await exerciseResponse.json();

	// Fetch the current user's targetReps for this exercise (if logged in)
	let targetReps = 10;
	if (locals.session?.userId) {
		const usersResponse = await fetch(`${apiUrl}/user/list`);
		const users: User[] = await usersResponse.json();
		const currentUser = users.find((u) => u.id === locals.session!.userId);
		if (currentUser) {
			const assignment = currentUser.exercises.find((e) => e.exerciseId === params.slug);
			if (assignment) targetReps = assignment.targetReps;
		}
	}

	return {
		exercises: exercise,
		targetReps
	};
}) satisfies PageServerLoad;

export const actions = {
	async getKey({ request }: { request: Request }) {
		const formData = await request.formData();
		const key = formData.get('key')?.toString() || undefined;
		const keyUrl = `${Api.regainApi.url}/presignedurl/${key}`;
		const keyResponse = await fetch(keyUrl);
		return keyResponse.json();
	},

	async submitReps({ request, locals }: { request: Request; locals: App.Locals }) {
		const formData = await request.formData();
		const exerciseId = formData.get('exerciseId')?.toString() || '';
		const repsCompleted = parseInt(formData.get('repsCompleted')?.toString() || '0', 10);
		const videoCompleted = formData.get('videoCompleted') === 'true';
		const userId = locals.session?.userId || '';

		await fetch(`${Api.regainApi.url}/session/create`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				userId,
				exerciseId,
				repsCompleted,
				videoCompleted,
				date: new Date().toISOString()
			})
		});

		return { success: true };
	}
} satisfies Actions;
