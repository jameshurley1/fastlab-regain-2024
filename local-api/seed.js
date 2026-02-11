import { writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, 'db.json');

const now = new Date().toISOString();

const groups = [
  { id: randomUUID(), area: 'Head', users: [], exercises: [], createdAt: now, updatedAt: now },
  { id: randomUUID(), area: 'Shoulders', users: [], exercises: [], createdAt: now, updatedAt: now },
  { id: randomUUID(), area: 'Arms', users: [], exercises: [], createdAt: now, updatedAt: now },
  { id: randomUUID(), area: 'Chest', users: [], exercises: [], createdAt: now, updatedAt: now },
  { id: randomUUID(), area: 'Stomach', users: [], exercises: [], createdAt: now, updatedAt: now },
  { id: randomUUID(), area: 'Legs', users: [], exercises: [], createdAt: now, updatedAt: now },
  { id: randomUUID(), area: 'Hands', users: [], exercises: [], createdAt: now, updatedAt: now },
];

const exercises = [
  {
    id: randomUUID(),
    title: 'Neck Stretch',
    time: 30,
    description: 'Gentle neck stretching exercise for rehabilitation',
    imageKey: 'neck-stretch.jpg',
    videoKey: 'neck-stretch.mp4',
    groups: [groups[0]],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: randomUUID(),
    title: 'Shoulder Rotation',
    time: 45,
    description: 'Slow shoulder rotation to improve mobility',
    imageKey: 'shoulder-rotation.jpg',
    videoKey: 'shoulder-rotation.mp4',
    groups: [groups[1]],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: randomUUID(),
    title: 'Arm Raises',
    time: 60,
    description: 'Controlled arm raising exercise',
    imageKey: 'arm-raises.jpg',
    videoKey: 'arm-raises.mp4',
    groups: [groups[2]],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: randomUUID(),
    title: 'Hand Grip',
    time: 30,
    description: 'Squeeze and release hand grip exercise',
    imageKey: 'hand-grip.jpg',
    videoKey: 'hand-grip.mp4',
    groups: [groups[6]],
    createdAt: now,
    updatedAt: now,
  },
];

const users = [
  {
    id: randomUUID(),
    email: 'test@example.com',
    onboard: true,
    overallProgress: 25,
    groups: [groups[0], groups[2]],
    exercises: [],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: randomUUID(),
    email: 'admin@fastlab.com',
    onboard: true,
    overallProgress: 0,
    groups: [],
    exercises: [],
    createdAt: now,
    updatedAt: now,
  },
];

const db = {
  users,
  groups,
  exercises,
  groupExercises: [],
  userGroups: [],
  stats: [],
  messages: [],
  sessions: [],
};

writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
console.log(`Seeded database at ${DB_PATH}`);
console.log(`  ${users.length} users`);
console.log(`  ${groups.length} groups`);
console.log(`  ${exercises.length} exercises`);
