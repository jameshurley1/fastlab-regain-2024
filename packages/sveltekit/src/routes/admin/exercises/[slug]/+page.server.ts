import type { Actions, PageServerLoad } from "./$types";

const API_URL = 'http://localhost:3001';

export const load: PageServerLoad = (async ({ params }) => {
  // Fetch all exercises.
  const exerciseUrl = API_URL + '/exercise/get/' + params.slug;
  const exerciseResponse = await fetch(exerciseUrl);
  const exercise = await exerciseResponse.json();

  const videoUrl = API_URL + '/presignedurl/' + exercise.videoKey;
  const videoResponse = await fetch(videoUrl);
  const video = await videoResponse.json();
  exercise.video = video.url;

  return {
    exercises: exercise
  }
}) satisfies PageServerLoad;

export const actions = {
  async getKey({ request }: { request: Request }) {
    const formData = await request.formData();
    const key = formData.get('key')?.toString();
    const keyUrl = API_URL + '/presignedurl/' + key;
    const keyResponse = await fetch(keyUrl);

    return keyResponse.json();
  }
} satisfies Actions;
