import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
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

// Group indices for readability
const HEAD = 0, SHOULDERS = 1, ARMS = 2, CHEST = 3, STOMACH = 4, LEGS = 5, HANDS = 6;

const exercises = [
  {
    id: randomUUID(),
    title: 'Neck Stretch',
    time: 84,
    description: 'Gentle neck stretching exercise to improve flexibility and reduce tension.',
    imageKey: 'neck-stretch.jpg',
    videoKey: '01 - Neck Stretch 720p.mp4',
    groups: [groups[HEAD]],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: randomUUID(),
    title: 'Shoulder Circles',
    time: 111,
    description: 'Circular shoulder movements to improve range of motion and loosen the joints.',
    imageKey: 'shoulder-circles.jpg',
    videoKey: '02 - Shoulder Circles 720p.mp4',
    groups: [groups[SHOULDERS]],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: randomUUID(),
    title: 'Seated Row',
    time: 44,
    description: 'Seated rowing motion to strengthen the upper back and shoulders.',
    imageKey: 'seated-row.jpg',
    videoKey: '03 - Seated Row 720p.mp4',
    groups: [groups[SHOULDERS], groups[CHEST]],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: randomUUID(),
    title: 'Shoulder Rolls',
    time: 108,
    description: 'Rolling shoulder movements to relieve stiffness and improve mobility.',
    imageKey: 'shoulder-rolls.jpg',
    videoKey: '04 - Shoulder Rolls 720p.mp4',
    groups: [groups[SHOULDERS]],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: randomUUID(),
    title: 'Shoulder Shrugs',
    time: 90,
    description: 'Shrugging movements to strengthen and relax the upper trapezius muscles.',
    imageKey: 'shoulder-shrugs.jpg',
    videoKey: '05 - Shoulder Shrugs 720p.mp4',
    groups: [groups[SHOULDERS]],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: randomUUID(),
    title: 'Seated Jumping Jacks',
    time: 79,
    description: 'Modified jumping jacks performed while seated for a low-impact cardio workout.',
    imageKey: 'seated-jumping-jacks.jpg',
    videoKey: '06 - Seated Jumping Jacks 720p.mp4',
    groups: [groups[CHEST]],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: randomUUID(),
    title: 'Toe Taps',
    time: 41,
    description: 'Alternating toe tapping exercise to improve lower limb coordination.',
    imageKey: 'toe-taps.jpg',
    videoKey: '07 - Toe Taps 720p.mp4',
    groups: [groups[LEGS]],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: randomUUID(),
    title: 'Toe Taps Variation',
    time: 58,
    description: 'A variation of toe taps with different movement patterns for added challenge.',
    imageKey: 'toe-taps-variation.jpg',
    videoKey: '08 - Toe Taps Variation 720p.mp4',
    groups: [groups[LEGS]],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: randomUUID(),
    title: 'Heel Slides',
    time: 144,
    description: 'Sliding heel movements to improve hip and knee flexibility.',
    imageKey: 'heel-slides.jpg',
    videoKey: '09 - Heel Slides 720p.mp4',
    groups: [groups[LEGS]],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: randomUUID(),
    title: "Captain's Chair",
    time: 75,
    description: 'Core strengthening exercise performed while seated to target abdominal muscles.',
    imageKey: 'captains-chair.jpg',
    videoKey: '10 - Captain_s Chair 720p.mp4',
    groups: [groups[STOMACH]],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: randomUUID(),
    title: 'Knee Lifts',
    time: 144,
    description: 'Alternating knee lifts to strengthen hip flexors and improve balance.',
    imageKey: 'knee-lifts.jpg',
    videoKey: '11 - Knee Lifts 720p.mp4',
    groups: [groups[LEGS]],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: randomUUID(),
    title: 'Modified Leg Lifts',
    time: 108,
    description: 'Gentle leg lifting exercise modified for comfort and safety.',
    imageKey: 'modified-leg-lifts.jpg',
    videoKey: '12 -  Modified Leg Lifts 720p.mp4',
    groups: [groups[LEGS]],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: randomUUID(),
    title: 'Seated Forward Bend',
    time: 74,
    description: 'Forward bending stretch performed while seated to improve lower back flexibility.',
    imageKey: 'seated-forward-bend.jpg',
    videoKey: '13 - Setaed Forward Bend 720p.mp4',
    groups: [groups[STOMACH]],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: randomUUID(),
    title: 'Knee to Chest',
    time: 141,
    description: 'Bringing the knee to chest to stretch the lower back and hip muscles.',
    imageKey: 'knee-to-chest.jpg',
    videoKey: '14 - Knee to Chest 720p.mp4',
    groups: [groups[LEGS]],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: randomUUID(),
    title: 'Ankle Rotation',
    time: 98,
    description: 'Circular ankle movements to improve joint mobility and reduce stiffness.',
    imageKey: 'ankle-rotation.jpg',
    videoKey: '15 - Ankle Rotation 720p.mp4',
    groups: [groups[LEGS]],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: randomUUID(),
    title: 'Seated Hip Marches',
    time: 95,
    description: 'Marching in place while seated to improve hip strength and coordination.',
    imageKey: 'seated-hip-marches.jpg',
    videoKey: '16 - Seated Hip Marches 720p.mp4',
    groups: [groups[LEGS]],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: randomUUID(),
    title: 'Sit to Stand',
    time: 54,
    description: 'Standing up from a seated position to build lower body strength and balance.',
    imageKey: 'sit-to-stand.jpg',
    videoKey: '17 - Sit to Stand 720p.mp4',
    groups: [groups[LEGS]],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: randomUUID(),
    title: 'Heel and Toe Raises',
    time: 54,
    description: 'Alternating heel and toe raises to strengthen calves and improve balance.',
    imageKey: 'heel-and-toe-raises.jpg',
    videoKey: '18 - Heel and Toe Raises 720p.mp4',
    groups: [groups[LEGS]],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: randomUUID(),
    title: 'Arm to Front',
    time: 45,
    description: 'Raising arms to the front to improve shoulder strength and range of motion.',
    imageKey: 'arm-to-front.jpg',
    videoKey: '19 - Arm to Front 720p.mp4',
    groups: [groups[ARMS]],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: randomUUID(),
    title: 'Arm to Side',
    time: 65,
    description: 'Lateral arm raises to strengthen the deltoids and improve mobility.',
    imageKey: 'arm-to-side.jpg',
    videoKey: '20 - Arm to Side 720p.mp4',
    groups: [groups[ARMS]],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: randomUUID(),
    title: 'Hand and Wrist Stretch',
    time: 72,
    description: 'Stretching exercises for the hands and wrists to reduce tension and stiffness.',
    imageKey: 'hand-and-wrist-stretch.jpg',
    videoKey: '21 - Hand and Wrist Stretch 720p.mp4',
    groups: [groups[HANDS]],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: randomUUID(),
    title: 'Wrist Stretch',
    time: 88,
    description: 'Targeted wrist stretching to improve flexibility and relieve discomfort.',
    imageKey: 'wrist-stretch.jpg',
    videoKey: '22 - Wrist Stretch 720p.mp4',
    groups: [groups[HANDS]],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: randomUUID(),
    title: 'Elbow Stretch',
    time: 59,
    description: 'Stretching the elbow joint to improve extension and reduce tightness.',
    imageKey: 'elbow-stretch.jpg',
    videoKey: '23 - Elbow Stretch 720p.mp4',
    groups: [groups[ARMS]],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: randomUUID(),
    title: 'Squeeze',
    time: 108,
    description: 'Hand squeezing exercise to build grip strength and hand endurance.',
    imageKey: 'squeeze.jpg',
    videoKey: '24 - Squeeze 720p.mp4',
    groups: [groups[HANDS]],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: randomUUID(),
    title: 'Ball Roll',
    time: 52,
    description: 'Rolling a ball with the hands to improve dexterity and coordination.',
    imageKey: 'ball-roll.jpg',
    videoKey: '25 - Ball Roll 720p.mp4',
    groups: [groups[HANDS]],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: randomUUID(),
    title: 'Finger Power',
    time: 99,
    description: 'Strengthening exercises for individual finger muscles and grip.',
    imageKey: 'finger-power.jpg',
    videoKey: '26 - Finger Power 720p.mp4',
    groups: [groups[HANDS]],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: randomUUID(),
    title: 'Finger Strength',
    time: 121,
    description: 'Building finger strength through resistance exercises for improved hand function.',
    imageKey: 'finger-strength.jpg',
    videoKey: '27 - Finger Strength 720p.mp4',
    groups: [groups[HANDS]],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: randomUUID(),
    title: 'Waiter-Cup',
    time: 65,
    description: 'Wrist and forearm exercise mimicking a waiter holding a cup to build stability.',
    imageKey: 'waiter-cup.jpg',
    videoKey: '28 - Waiter-Cup 720p.mp4',
    groups: [groups[HANDS]],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: randomUUID(),
    title: 'Fingertip to Palm',
    time: 67,
    description: 'Touching fingertips to palm to improve finger flexibility and coordination.',
    imageKey: 'fingertip-to-palm.jpg',
    videoKey: '29 - Fingertip to Plam 720p.mp4',
    groups: [groups[HANDS]],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: randomUUID(),
    title: 'Laundry',
    time: 81,
    description: 'Functional hand exercise simulating laundry folding movements.',
    imageKey: 'laundry.jpg',
    videoKey: '30 - Laundry 720p.mp4',
    groups: [groups[HANDS]],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: randomUUID(),
    title: 'Single Limb Stance',
    time: 138,
    description: 'Standing on one leg to improve balance, stability, and lower body strength.',
    imageKey: 'single-limb-stance.jpg',
    videoKey: '31 - Single Limb Stance 720p.mp4',
    groups: [groups[LEGS]],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: randomUUID(),
    title: 'Tummy Twists',
    time: 49,
    description: 'Seated twisting movements to engage the core and improve spinal mobility.',
    imageKey: 'tummy-twists.jpg',
    videoKey: '32 - Tummy Twists 720p.mp4',
    groups: [groups[STOMACH]],
    createdAt: now,
    updatedAt: now,
  },
];

// exercises indices for reference:
// HEAD: 0 = Neck Stretch
// ARMS: 18 = Arm to Front, 19 = Arm to Side, 22 = Elbow Stretch
const users = [
  {
    id: randomUUID(),
    email: 'test@example.com',
    onboard: true,
    overallProgress: 25,
    groups: [groups[0], groups[2]],
    exercises: [
      { exerciseId: exercises[0].id, targetReps: 10 },  // Neck Stretch
      { exerciseId: exercises[18].id, targetReps: 12 }, // Arm to Front
      { exerciseId: exercises[19].id, targetReps: 12 }, // Arm to Side
      { exerciseId: exercises[22].id, targetReps: 8 },  // Elbow Stretch
    ],
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

// Derive groupExercises join table from the embedded groups on each exercise
const groupExercises = exercises.flatMap((ex) =>
  ex.groups.map((g) => ({
    id: randomUUID(),
    groupId: g.id,
    exerciseId: ex.id,
    createdAt: now,
    updatedAt: now,
  }))
);

const db = {
  users,
  groups,
  exercises,
  groupExercises,
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
console.log(`  ${groupExercises.length} groupExercise join rows`);

// Generate placeholder images for local development
const FILES_DIR = join(__dirname, 'files');
if (!existsSync(FILES_DIR)) mkdirSync(FILES_DIR, { recursive: true });

const groupColors = {
  Head: '#4CAF50',
  Shoulders: '#2196F3',
  Arms: '#FF9800',
  Chest: '#E91E63',
  Stomach: '#9C27B0',
  Legs: '#00BCD4',
  Hands: '#FF5722',
};

let placeholderCount = 0;
for (const exercise of exercises) {
  const color = groupColors[exercise.groups[0]?.area] || '#607D8B';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360">
  <rect width="640" height="360" fill="${color}"/>
  <text x="320" y="160" text-anchor="middle" fill="white" font-family="sans-serif" font-size="28" font-weight="bold">${exercise.title}</text>
  <text x="320" y="200" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-family="sans-serif" font-size="18">${exercise.groups.map(g => g.area).join(', ')}</text>
  <text x="320" y="240" text-anchor="middle" fill="rgba(255,255,255,0.6)" font-family="sans-serif" font-size="16">${Math.floor(exercise.time / 60)}:${String(exercise.time % 60).padStart(2, '0')}</text>
</svg>`;

  // Write as SVG (rename .jpg to .svg won't work, so write actual image key)
  const imgPath = join(FILES_DIR, exercise.imageKey);
  writeFileSync(imgPath, svg);
  placeholderCount++;
}
console.log(`  ${placeholderCount} placeholder images generated in ${FILES_DIR}`);
