import { PersistedState } from 'runed';

// Information Messages
export const interaction = new PersistedState<Information[] | null>('interaction', [], {
	storage: 'session'
});

// Active Areas.
export const activeAreas = new PersistedState<Area[]>(
	'activeAreas',
	[
		{
			id: 'e536c320-1e5e-4be1-96c4-620e34b0bce0',
			name: 'Head',
			status: false
		},
		{
			id: 'bf5fc8a5-d933-40cb-94cb-36d6e157b0d1',
			name: 'Shoulders',
			status: false
		},
		{
			id: '77d2f51d-8981-4261-b90f-e5901fef066b',
			name: 'Arms',
			status: false
		},
		{
			id: '4939f4c0-fc8d-4a56-ab99-b67f921568aa',
			name: 'Chest',
			status: false
		},
		{
			id: '1cb15f70-c553-460e-833c-b4753f66bd25',
			name: 'Stomach',
			status: false
		},
		{
			id: 'b2e20191-9d7a-484e-9c49-13f1329b4b3e',
			name: 'Legs',
			status: false
		},
		{
			id: '89de7e09-a1fe-4a93-9421-dda0c70aa956',
			name: 'Hands',
			status: false
		}
	],
	{ storage: 'session' }
);

// Booleans
export const isPaused = new PersistedState<boolean>('isPaused', false, { storage: 'session' });
export const isHalfway = new PersistedState<boolean>('isHalfway', false, { storage: 'session' });
export const isCompleted = new PersistedState<boolean>('isCompleted', false, {
	storage: 'session'
});

// User Difficulty and Pain
export const pain = new PersistedState<boolean>('pain', false, { storage: 'session' });
export const difficult = new PersistedState<boolean>('difficult', false, { storage: 'session' });

// User Store.
export const user = new PersistedState<User>(
	'user',
	{
		id: '',
		email: '',
		createdAt: '',
		updatedAt: '',
		onboard: false,
		overallProgress: 0,
		groups: [],
		exercises: [],
		patientAreas: []
	},
	{ storage: 'local' }
);
export const userGroups = new PersistedState<Group[]>(
	'userGroups',
	[{ id: '', area: '', users: [], exercises: [], createdAt: '', updatedAt: '' }],
	{ storage: 'local' }
);
export const groups = new PersistedState<Group[]>('groups', [], { storage: 'local' });
export const exercises = new PersistedState<Exercise[]>('exercises', [], { storage: 'local' });
export const groupExercises = new PersistedState<GroupExercises>(
	'exerciseGroup',
	{ id: '', groupID: '', exerciseID: '', createdAt: '', updatedAt: '' },
	{ storage: 'local' }
);

// Error states
export const error = new PersistedState<{ status: boolean; message: string }>(
	'error',
	{ status: false, message: '' },
	{ storage: 'session' }
);

// Admin stuff.
export const currentGroup = new PersistedState<Group>(
	'currentGroup',
	{ id: '', area: '', users: [], exercises: [], createdAt: '', updatedAt: '' },
	{ storage: 'session' }
);
export const currentExercise = new PersistedState<Exercise>(
	'currentExercise',
	{ id: '', title: '', time: 0, createdAt: '', updatedAt: '', imageKey: '', videoKey: '' },
	{ storage: 'session' }
);
export const currentUser = new PersistedState<User>(
	'currentUser',
	{
		id: '',
		email: '',
		createdAt: '',
		updatedAt: '',
		onboard: false,
		overallProgress: 0,
		groups: [],
		exercises: []
	},
	{ storage: 'session' }
);
export const currentMode = new PersistedState<string>('currentMode', 'display', {
	storage: 'session'
});
