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

	// Show exercises from patient-selected areas that are NOT in the clinician-assigned list.
	let additionalExercises = $derived.by(() => {
		const patientAreas = new Set(user.current?.patientAreas ?? []);
		if (patientAreas.size === 0) return [];
		const assignedIds = new Set(
			(user.current?.exercises ?? []).map((e: { exerciseId: string }) => e.exerciseId)
		);
		return data.exercises.filter(
			(exercise: any) =>
				!assignedIds.has(exercise.id) &&
				(exercise.groups ?? []).some((g: { area: string }) => patientAreas.has(g.area))
		);
	});
</script>

<div class="exercises">
	<LayoutGrid>
		{#each filteredExercises as exercise}
			<Exercise {exercise} />
		{/each}
	</LayoutGrid>
	{#if additionalExercises.length}
		<h3 class="additional-heading">Additional exercises you can try</h3>
		<LayoutGrid>
			{#each additionalExercises as exercise}
				<Exercise {exercise} />
			{/each}
		</LayoutGrid>
	{/if}
</div>

<style>
	.exercises {
		display: flex;
		position: relative;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 100%;
		background: rgba(255, 255, 255, 0.1);
		z-index: 0;
	}
	.additional-heading {
		align-self: flex-start;
		padding: 1rem 1.5rem 0;
	}
	</style>
