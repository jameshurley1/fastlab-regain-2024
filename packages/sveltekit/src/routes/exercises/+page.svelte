<script lang="ts">
	import LayoutGrid from '@smui/layout-grid';
	import Exercise from './Exercise.svelte';
	import { activeAreas } from '$lib/utils/store';

	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let filteredExercises = $derived.by(() => {
		const selectedAreaNames = activeAreas.current
			.filter((area: Area) => area.status)
			.map((area: Area) => area.name);

		if (selectedAreaNames.length === 0) {
			return data.exercises;
		}

		return data.exercises.filter((exercise: Exercise) =>
			exercise.groups?.some((group: { area: string }) =>
				selectedAreaNames.includes(group.area)
			)
		);
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