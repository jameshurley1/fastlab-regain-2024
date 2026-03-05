<script lang="ts">
	import { onMount } from 'svelte';
	import { user } from '$lib/utils/store';

	const API = 'http://127.0.0.1:3001';

	let { exercise, refreshTrigger = 0 }: { exercise: any; refreshTrigger?: number } = $props();

	let allExercises: any[] = $state([]);
	let sessions: any[] = $state([]);
	let loading = $state(true);

	const area = $derived((exercise?.groups ?? [])[0]?.area ?? '');

	async function fetchData() {
		const userId = user.current?.id;
		const [exRes, sessRes] = await Promise.all([
			fetch(`${API}/exercise/list`),
			userId ? fetch(`${API}/session/listByUser/${userId}`) : Promise.resolve(null)
		]);
		allExercises = await exRes.json();
		sessions = sessRes ? await sessRes.json() : [];
		loading = false;
	}

	onMount(fetchData);

	$effect(() => {
		// Re-fetch whenever refreshTrigger is incremented (after a rep submission)
		if (refreshTrigger > 0) fetchData();
	});

	const userAssignments = $derived(user.current?.exercises ?? []);

	function latestReps(exerciseId: string): number {
		return sessions
			.filter((s) => s.exerciseId === exerciseId)
			.reduce((sum, s) => sum + (s.repsCompleted ?? 0), 0);
	}

	const areaExercises = $derived.by(() => {
		if (!area || loading) return [];
		return userAssignments
			.filter((a: any) => {
				const ex = allExercises.find((e) => e.id === a.exerciseId);
				return ex && (ex.groups ?? []).some((g: any) => g.area === area);
			})
			.map((a: any) => {
				const ex = allExercises.find((e) => e.id === a.exerciseId)!;
				const repsCompleted = latestReps(a.exerciseId);
				const pct =
					a.targetReps > 0 ? Math.min(100, Math.round((repsCompleted / a.targetReps) * 100)) : 0;
				return { title: ex.title, targetReps: a.targetReps, repsCompleted, pct };
			});
	});

	function barColor(pct: number): string {
		if (pct >= 100) return '#4caf50';
		if (pct >= 50) return '#ff9800';
		return '#2196f3';
	}
</script>

{#if area}
	<div class="area-progress">
		<h4 class="area-heading">{area} Progress</h4>
		{#if loading}
			<p class="hint">Loading…</p>
		{:else if areaExercises.length === 0}
			<p class="hint">No assigned exercises in this area.</p>
		{:else}
			{#each areaExercises as bar}
				{@const color = barColor(bar.pct)}
				<div class="bar-row">
					<span class="ex-title">{bar.title}</span>
					<div class="bar-track">
						<div class="bar-fill" style="width: {bar.pct}%; background: {color};"></div>
					</div>
					<span class="meta">{bar.repsCompleted}&thinsp;/&thinsp;{bar.targetReps} · {bar.pct}%</span>
				</div>
			{/each}
		{/if}
	</div>
{/if}

<style>
	.area-progress {
		background: rgba(255, 255, 255, 0.08);
		border-radius: 12px;
		padding: 1.25rem 1.5rem;
		box-sizing: border-box;
	}
	.area-heading {
		margin: 0 0 0.875rem;
		font-size: 1rem;
		font-weight: 700;
		color: white;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		opacity: 0.85;
	}
	.hint {
		color: rgba(255, 255, 255, 0.5);
		font-size: 0.85rem;
		margin: 0;
	}
	.bar-row {
		display: flex;
		align-items: center;
		margin-bottom: 0.65rem;
	}
	.ex-title {
		flex: 0 0 40%;
		max-width: 40%;
		white-space: normal;
		font-size: 0.85rem;
		font-weight: 500;
		color: white;
		margin-right: 8px;
	}
	.bar-track {
		flex: 1;
		height: 6px;
		margin: 0 8px;
		background: rgba(255, 255, 255, 0.15);
		border-radius: 3px;
		overflow: hidden;
	}
	.bar-fill {
		height: 100%;
		max-width: 100%;
		border-radius: 3px;
		transition: width 0.4s ease;
	}
	.meta {
		flex: 0 0 auto;
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.55);
		white-space: nowrap;
		margin-left: 8px;
	}
</style>
