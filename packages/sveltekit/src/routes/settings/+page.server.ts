import type { Actions } from './$types';
import { Api } from 'sst/node/api';

export const actions = {
  async removeData({ request }: { request: Request }) {
    const formData = await request.formData();
    const email = formData.get('email')?.toString();

    // Write this method later.
    console.log(email);

  },
  async saveSettings({ request }: { request: Request }) {
    const formData = await request.formData();
    const email = formData.get('email')?.toString();
    const head = formData.get('head')?.toString();
    const shoulder = formData.get('shoulder')?.toString();
    const arm = formData.get('arm')?.toString();
    const chest = formData.get('chest')?.toString();
    const stomach = formData.get('stomach')?.toString();
    const legs = formData.get('legs')?.toString();
    const hands = formData.get('hands')?.toString();

    try {
      // for each body part, send a POST request to the update userGroups endpoint
      const userUpdateURL = `${Api.regainApi.url}/userGroup/create`;

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
              stomach: stomach,
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
  }
} satisfies Actions;
