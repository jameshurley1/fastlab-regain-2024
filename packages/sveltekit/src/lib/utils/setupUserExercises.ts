import { onlyUnique } from './onlyUnique';

export const setupUserExercises = async (exercises: Exercise[], usersettings: User) => {
	let exerciseList: Exercise[] = [];

	for (let i = 0; i < exercises.length; i++) {
		for (let j = 0; j < usersettings.groups.length; j++) {
			if (usersettings.groups[j].id === exercises[i].groups?.[0]?.id) {
				exerciseList.push(exercises[i]);
			}
		}
	}

	// Make me a filter for unique values
	const unique = exerciseList.filter(onlyUnique);
	exerciseList = unique;

	return { exerciseList };
};
