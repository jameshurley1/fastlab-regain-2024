import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

const apiUrl = process.env.LOCAL_API_URL ?? 'http://127.0.0.1:3001';

export const load: LayoutServerLoad = async ({ locals }) => {
	const userId = locals.session?.userId;

	if (!userId) {
		redirect(303, '/exercises');
	}

	const response = await fetch(`${apiUrl}/user/list`);
	const users: User[] = await response.json();
	const user = users.find((u) => u.id === userId);

	if (!user || (!user.isAdmin && user.email !== 'admin@fastlab.com')) {
		redirect(303, '/exercises');
	}
};
