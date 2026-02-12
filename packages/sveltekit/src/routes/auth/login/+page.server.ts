import type { Actions } from './$types';
import { randomUUID } from 'crypto';

const API_URL = 'http://localhost:3001';

export const actions = {
  async magicLinks({ request }: { request: Request }) {
    const formData = await request.formData();
    const email = formData.get('email')?.toString();
    const getUserURL = `${API_URL}/user/getUserByEmail/${email}`;
    const userResponse = await fetch(getUserURL);

    if (!userResponse.ok) {
      return {
        success: false,
        error: 'Failed to fetch user, this error has been logged with FASTlab.'
      };
    } else {
      const user = await userResponse.json();

      if (user === "Error: User doesn't exist") {
        const userCreateURL = `${API_URL}/user/create`;

        const createUserData = await fetch(userCreateURL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: randomUUID().toString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            emailNotify: true,
            chatHelp: true,
            onboard: false,
            overallProgress: 0,
            email: email
          })
        });

        if (!createUserData.ok) {
          return {
            success: false,
            error: 'Failed to create user, this error has been logged with FASTlab.'
          };
        }
      } else {
        const userAuthURL = `${API_URL}/auth/magicLink/authorize?email=${email}`;
        const magicLinkResponse = await fetch(userAuthURL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });

        if (!magicLinkResponse.ok) {
          return {
            success: false,
            error: 'Failed to send magic link, this error has been logged with FASTlab.'
          };
        }
      }
    }

    return { success: true, error: null };
  }
} satisfies Actions;
