<script lang="ts">
	import { onMount } from 'svelte';
	import LayoutGrid, { Cell } from '@smui/layout-grid';
	import { user, activeAreas } from '$lib/utils/store';

	const API = 'http://127.0.0.1:3001';

	// All exercises from the API (for title + group membership)
	let allExercises: (Exercise & { groups?: { area: string }[] })[] = $state([]);
	// Sessions for the current user
	let sessions: Session[] = $state([]);
	let loading = $state(true);

	onMount(async () => {
		const userId = user.current?.id;
		const [exRes, sessRes] = await Promise.all([
			fetch(`${API}/exercise/list`),
			userId ? fetch(`${API}/session/listByUser/${userId}`) : Promise.resolve(null)
		]);
		allExercises = await exRes.json();
		sessions = sessRes ? await sessRes.json() : [];
		loading = false;
	});

	// Active body areas (those with status: true in the store)
	const activeAreaNames = $derived(
		activeAreas.current.filter((a) => a.status).map((a) => a.name)
	);

	// The user's exercise assignments: [{ exerciseId, targetReps }]
	const userAssignments = $derived(user.current?.exercises ?? []);

	// For each assignment, find the most recent session's repsCompleted
	function latestReps(exerciseId: string): number {
		const relevant = sessions
			.filter((s) => s.exerciseId === exerciseId)
			.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
		return relevant[0]?.repsCompleted ?? 0;
	}

	// Group assignments by body area, filtered to active areas only
	type BarData = {
		exerciseId: string;
		title: string;
		targetReps: number;
		repsCompleted: number;
	};
	type AreaGroup = {
		area: string;
		bars: BarData[];
	};

	const areaGroups = $derived.by((): AreaGroup[] => {
		const result: AreaGroup[] = [];

		for (const areaName of activeAreaNames) {
			const bars: BarData[] = [];
			for (const assignment of userAssignments) {
				const ex = allExercises.find((e) => e.id === assignment.exerciseId);
				if (!ex) continue;
				const inArea = (ex.groups ?? []).some((g) => g.area === areaName);
				if (!inArea) continue;
				bars.push({
					exerciseId: assignment.exerciseId,
					title: ex.title,
					targetReps: assignment.targetReps,
					repsCompleted: latestReps(assignment.exerciseId)
				});
			}
			if (bars.length > 0) {
				result.push({ area: areaName, bars });
			}
		}

		return result;
	});

	// If no areas are active yet, fall back to showing all assigned exercises flat
	const fallbackBars = $derived.by((): BarData[] => {
		return userAssignments.map((assignment) => {
			const ex = allExercises.find((e) => e.id === assignment.exerciseId);
			return {
				exerciseId: assignment.exerciseId,
				title: ex?.title ?? assignment.exerciseId,
				targetReps: assignment.targetReps,
				repsCompleted: latestReps(assignment.exerciseId)
			};
		});
	});

	function barPercent(reps: number, target: number): number {
		if (target <= 0) return 0;
		return Math.min(100, Math.round((reps / target) * 100));
	}

	function barColor(pct: number): string {
		if (pct >= 100) return '#4caf50';
		if (pct >= 50) return '#ff9800';
		return '#2196f3';
	}
</script>

<div class="layout">
	{#if loading}
		<div class="loading">
			<div class="spinner"></div>
			<p>Loading progress…</p>
		</div>
	{:else if activeAreaNames.length === 0 && fallbackBars.length === 0}
		<div class="empty-state">
			<i class="material-icons" style="font-size: 3rem; opacity: 0.4;">bar_chart</i>
			<p>No exercises assigned yet.</p>
			<p class="hint">Ask your clinician to assign exercises in the admin panel.</p>
		</div>
	{:else}
		<LayoutGrid>
			{#if activeAreaNames.length === 0}
				<!-- No areas selected — show all assignments flat -->
				<Cell span={12}>
					<div class="area-card">
						<h3 class="area-heading">All exercises</h3>
						{#each fallbackBars as bar}
							{@const pct = barPercent(bar.repsCompleted, bar.targetReps)}
							<div class="bar-row">
								<div class="bar-label">
									<span class="ex-title">{bar.title}</span>
									<span class="rep-fraction">{bar.repsCompleted} / {bar.targetReps}</span>
								</div>
								<div class="bar-track">
									<div
										class="bar-fill"
										style="width: {pct}%; background: {barColor(pct)};"
									></div>
								</div>
								<span class="pct-label">{pct}%</span>
							</div>
						{/each}
					</div>
				</Cell>
			{:else}
				{#each areaGroups as group}
					<Cell span={6}>
						<div class="area-card">
							<h3 class="area-heading">{group.area}</h3>
							{#each group.bars as bar}
								{@const pct = barPercent(bar.repsCompleted, bar.targetReps)}
								<div class="bar-row">
									<div class="bar-label">
										<span class="ex-title">{bar.title}</span>
										<span class="rep-fraction">{bar.repsCompleted} / {bar.targetReps}</span>
									</div>
									<div class="bar-track">
										<div
											class="bar-fill"
											style="width: {pct}%; background: {barColor(pct)};"
										></div>
									</div>
									<span class="pct-label">{pct}%</span>
								</div>
							{/each}
						</div>
					</Cell>
				{/each}
				{#if areaGroups.length === 0}
					<Cell span={12}>
						<div class="empty-state">
							<i class="material-icons" style="font-size: 3rem; opacity: 0.4;">fitness_center</i>
							<p>No exercises assigned in the selected body areas.</p>
						</div>
					</Cell>
				{/if}
			{/if}
		</LayoutGrid>
	{/if}
</div>

<style>
	.layout {
		display: flex;
		flex-direction: column;
		background: rgba(255, 255, 255, 0.1);
		min-height: 100%;
		padding: 1rem;
		box-sizing: border-box;
	}

	/* Loading */
	.loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		padding: 4rem;
		color: white;
		opacity: 0.7;
	}
	.spinner {
		width: 40px;
		height: 40px;
		border: 4px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}
	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	/* Empty state */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 4rem;
		color: white;
		text-align: center;
	}
	.empty-state p {
		margin: 0;
	}
	.empty-state .hint {
		opacity: 0.5;
		font-size: 0.9rem;
	}

	/* Area card */
	.area-card {
		background: rgba(255, 255, 255, 0.08);
		border-radius: 12px;
		padding: 1.25rem 1.5rem;
		margin-bottom: 0.5rem;
	}
	.area-heading {
		margin: 0 0 1rem;
		font-size: 1.1rem;
		font-weight: 700;
		color: white;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		opacity: 0.85;
	}

	/* Bar rows */
	.bar-row {
		display: grid;
		grid-template-columns: 1fr auto;
		grid-template-rows: auto auto;
		gap: 0.2rem 0.75rem;
		margin-bottom: 0.9rem;
		align-items: center;
	}
	.bar-label {
		grid-column: 1;
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		color: white;
	}
	.ex-title {
		font-size: 0.95rem;
		font-weight: 500;
	}
	.rep-fraction {
		font-size: 0.82rem;
		opacity: 0.65;
		margin-left: 0.5rem;
	}
	.bar-track {
		grid-column: 1;
		height: 18px;
		background: rgba(255, 255, 255, 0.15);
		border-radius: 9px;
		overflow: hidden;
	}
	.bar-fill {
		height: 100%;
		border-radius: 9px;
		transition: width 0.4s ease;
		min-width: 0;
	}
	.pct-label {
		grid-column: 2;
		grid-row: 2;
		font-size: 0.82rem;
		color: rgba(255, 255, 255, 0.65);
		white-space: nowrap;
		text-align: right;
	}
</style>
