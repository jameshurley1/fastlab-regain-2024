<script lang="ts">
	import LayoutGrid from '@smui/layout-grid';
	import Exercise from './Exercise.svelte';
	import { user } from '$lib/utils/store';

	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Show only the exercises the clinician has assigned to this patient.
	let filteredExercises = $derived.by(() => {
		const assignedIds = new Set(
			(user.current?.exercises ?? []).map((e: { exerciseId: string }) => e.exerciseId)
		);
		if (assignedIds.size === 0) return data.exercises;
		return data.exercises.filter((exercise: Exercise) => assignedIds.has(exercise.id));
	});
</script>

<div class="exercises">
	<LayoutGrid>
		{#each filteredExercises as exercise}
			<Exercise {exercise} />
		{/each}
	</LayoutGrid>
</div>

<style>
	.exercises {
		display: flex;
		position: relative;
		justify-content: center;
		align-items: center;
		height: 100%;
		background: rgba(255, 255, 255, 0.1);
		z-index: 0;
	}
	</style>