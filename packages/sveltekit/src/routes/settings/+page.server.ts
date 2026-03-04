import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { SESSION_COOKIE_NAME } from '$lib/utils/constants.js';

const API_URL = process.env.LOCAL_API_URL ?? 'http://127.0.0.1:3001';

export const actions = {
  async removeData({ request, cookies }) {
    const formData = await request.formData();
    const email = formData.get('email')?.toString();

    if (email) {
      await fetch(`${API_URL}/user/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      }).catch(() => {});
    }

    cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
    throw redirect(302, '/auth/login');
  },
  async saveSettings({ request }: { request: Request }) {
    const formData = await request.formData();
    const email = formData.get('email')?.toString();
    const head = formData.get('head')?.toString();
    const shoulder = formData.get('shoulder')?.toString();
    const arm = formData.get('arm')?.toString();
    const chest = formData.get('chest')?.toString();
    const coreAbdomen = formData.get('core-abdomen')?.toString();
    const legs = formData.get('legs')?.toString();
    const hands = formData.get('hands')?.toString();

    try {
      // for each body part, send a POST request to the update userGroups endpoint
      const userUpdateURL = `${process.env.LOCAL_API_URL ?? 'http://localhost:3001'}/userGroup/create`;

      const updateResponse = await fetch(
        userUpdateURL,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email,
            onboard: true,
            groups: {
              head: head,
              shoulder: shoulder,
              arm: arm,
              chest: chest,
              coreAbdomen: coreAbdomen,
              legs: legs,
              hands: hands
            }
          })
        }
      );

      if (!updateResponse.ok) {
        return {
          success: false,
          error: 'Failed to send magic link, this error has been logged with FASTlab.'
        }
      } else {
        return {
          success: true,
          error: ''
        }
      }
    } catch (err) {
      return {
        success: false,
        error: err
      }
    }
  },
  async savePatientAreas({ request }) {
    const apiUrl = process.env.LOCAL_API_URL ?? 'http://localhost:3001';
    const formData = await request.formData();
    const email = formData.get('email')?.toString() || '';
    const patientAreas = JSON.parse(formData.get('patientAreas')?.toString() || '[]');
    await fetch(`${apiUrl}/user/update`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, patientAreas })
    });
    return { success: true };
  }
} satisfies Actions;
