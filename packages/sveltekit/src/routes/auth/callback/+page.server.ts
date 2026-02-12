import type { Actions, PageServerLoad } from './$types';
import jwt from 'jsonwebtoken';
import { redirect } from '@sveltejs/kit';
import { SESSION_COOKIE_NAME } from '$lib/utils/constants.js';
import { createSessionForUser } from '$lib/utils/auth.js';

const API_URL = 'http://localhost:3001';

export const load: PageServerLoad = async ({ cookies, url }) => {
	// Extract authentication token from URL query parameters
	const token = url.searchParams.get('token') ?? '';

	// If token is missing, redirect to home page
	if (!token) {
		redirect(303, '/');
	}

	// Decode the authentication token
	const decodedUser = jwt.decode(token) as UserToken;

	// Create a session for the user
	const session = createSessionForUser(decodedUser.userId);

	// Set session cookie in browser with user id and expiration time
	cookies.set(SESSION_COOKIE_NAME, session.id, {
		maxAge: 7884000,
		path: '/' // set cookie for all routes
	});

	// Return the user id and email
	const getUserURL = `${API_URL}/user/getUserByEmail/${decodedUser.email}`;
	const userResponse = await fetch(getUserURL);

	const user = await userResponse.json();

	if (!userResponse.ok) {
		return {
			success: false,
			error: 'Failed to fetch user, this error has been logged with FASTlab.'
		};
	}

	return {
		user
	};
};

export const actions = {
	async redirect({ request }: { request: Request }) {
		const formData: FormData = await request.formData();
		const location: string = formData.get('location')?.toString() || '';

		redirect(303, location);
	}
} satisfies Actions;
