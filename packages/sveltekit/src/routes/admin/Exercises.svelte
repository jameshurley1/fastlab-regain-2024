<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import LayoutGrid, { Cell } from '@smui/layout-grid';
	import Button from '@smui/button';
	import ExerciseLink from './ExerciseLink.svelte';

	import { exercises, currentExercise, currentMode, user } from '$lib/utils/store';

	onMount(async () => {
		currentExercise.current = {
			id: '',
			title: '',
			description: '',
			imageKey: '',
			videoKey: '',
			time: 0,
			video: '',
			createdAt: '',
			updatedAt: ''
		};
		currentMode.current = 'display';

		const res = await fetch('http://127.0.0.1:3001/exercise/list');
		exercises.current = await res.json();
	});
</script>

<svelte:head>
	<title>Exercises</title>
</svelte:head>

{#if user.current}
	<div class="header-panel">
		<div></div>
		<div>
			<Button
				variant="raised"
				onclick={() => {
					currentMode.current = 'add';
					goto('/admin/exercises/new');
				}}
			>
				ADD EXERCISE
			</Button>
		</div>
	</div>
{/if}

<div class="posts-panel">
	{#if exercises.current}
		<LayoutGrid>
			{#each exercises.current as exercise}
				<Cell spanDevices={{ phone: 12, tablet: 4, desktop: 3 }}>
					<ExerciseLink {exercise} />
				</Cell>
			{/each}
		</LayoutGrid>
	{/if}
</div>

<style>
	.posts-panel {
		display: flex;
		position: relative;
		height: 100%;
	}
	.header-panel {
		display: flex;
		position: relative;
		flex-direction: row;
		justify-content: space-between;
		width: 100%;
	}
</style>
