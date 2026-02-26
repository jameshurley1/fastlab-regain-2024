<script lang="ts">
	import { onMount } from 'svelte';
	import { user } from '$lib/utils/store';

	const API = 'http://127.0.0.1:3001';

	// All exercises from the API (for title + group membership)
	let allExercises: Exercise[] = $state([]);
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

	// The user's exercise assignments: [{ exerciseId, targetReps }]
	const userAssignments = $derived(user.current?.exercises ?? []);

	// For each assignment, find the most recent session's repsCompleted
	function latestReps(exerciseId: string): number {
		const relevant = sessions
			.filter((s) => s.exerciseId === exerciseId)
			.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
		return relevant[0]?.repsCompleted ?? 0;
	}

	// Group assignments by body area, derived from the exercises' own group memberships.
	// Only areas that have at least one assigned exercise will appear.
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
		const map = new Map<string, BarData[]>();
		const seen = new Set<string>();
		for (const assignment of userAssignments) {
			if (seen.has(assignment.exerciseId)) continue;
			const ex = allExercises.find((e) => e.id === assignment.exerciseId);
			if (!ex) continue;
			seen.add(assignment.exerciseId);
			const bar: BarData = {
				exerciseId: assignment.exerciseId,
				title: ex.title,
				targetReps: assignment.targetReps,
				repsCompleted: latestReps(assignment.exerciseId)
			};
			// Place the exercise in its primary group only to avoid duplicates.
			const primaryGroup = (ex.groups ?? [])[0];
			if (primaryGroup) {
				if (!map.has(primaryGroup.area)) map.set(primaryGroup.area, []);
				map.get(primaryGroup.area)!.push(bar);
			}
		}
		return Array.from(map, ([area, bars]) => ({ area, bars }));
	});

	// Patient-selected area groups: exercises from patientAreas not already in clinician assignments.
	// Session history is always preserved regardless of current patientAreas setting.
	const patientAreaGroups = $derived.by((): AreaGroup[] => {
		const patientAreas = user.current?.patientAreas ?? [];
		if (patientAreas.length === 0) return [];
		const assignedIds = new Set(userAssignments.map((a) => a.exerciseId));
		const map = new Map<string, BarData[]>();
		const seen = new Set<string>();
		for (const area of patientAreas) {
			for (const ex of allExercises) {
				if (seen.has(ex.id)) continue;
				if (assignedIds.has(ex.id)) continue;
				if (!(ex.groups ?? []).some((g) => g.area === area)) continue;
				seen.add(ex.id);
				const bar: BarData = {
					exerciseId: ex.id,
					title: ex.title,
					targetReps: 0,
					repsCompleted: latestReps(ex.id)
				};
				if (!map.has(area)) map.set(area, []);
				map.get(area)!.push(bar);
			}
		}
		return Array.from(map, ([area, bars]) => ({ area, bars })).filter((g) => g.bars.length > 0);
	});

	function barPercent(reps: number, target: number): number {
		if (target <= 0) return 0;
		return Math.min(100, Math.round((reps / target) * 100));
	}

	// For patient-selected exercises with no target, use 10 reps as a soft reference.
	function patientBarPercent(reps: number): number {
		if (reps <= 0) return 0;
		return Math.min(100, Math.round((reps / 10) * 100));
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
	{:else if areaGroups.length === 0 && patientAreaGroups.length === 0}
		<div class="empty-state">
			<i class="material-icons" style="font-size: 3rem; opacity: 0.4;">bar_chart</i>
			<p>No exercises assigned yet.</p>
			<p class="hint">Ask your clinician to assign exercises in the admin panel.</p>
		</div>
	{:else}
		{#if areaGroups.length > 0}
			<div class="cards-grid">
				{#each areaGroups as group}
					<div class="area-card">
						<h3 class="area-heading">{group.area}</h3>
						{#each group.bars as bar}
							{@const pct = barPercent(bar.repsCompleted, bar.targetReps)}
							<div class="bar-row">
								<span class="ex-title">{bar.title}</span>
								<div class="bar-track">
									<div
										class="bar-fill"
										style="width: {pct}%; background: {barColor(pct)};"
									></div>
								</div>
								<span class="meta">{bar.repsCompleted}&thinsp;/&thinsp;{bar.targetReps} · {pct}%</span>
							</div>
						{/each}
					</div>
				{/each}
			</div>
		{/if}

		{#if patientAreaGroups.length > 0}
			<div class="patient-section-header">
				<h2 class="patient-section-title">Your additions</h2>
				<span class="patient-section-hint">Areas you selected — no clinician target set</span>
			</div>
			<div class="cards-grid">
				{#each patientAreaGroups as group}
					<div class="area-card patient-card">
						<h3 class="area-heading patient-area-heading">
							{group.area}
							<span class="patient-label">Your choice</span>
						</h3>
						{#each group.bars as bar}
							{@const pct = patientBarPercent(bar.repsCompleted)}
							<div class="bar-row">
								<span class="ex-title">{bar.title}</span>
								<div class="bar-track">
									<div
										class="bar-fill"
										style="width: {pct}%; background: {barColor(pct)};"
									></div>
								</div>
								<span class="meta">
									{bar.repsCompleted} reps · {pct > 0 ? `${pct}%` : 'not started'}
								</span>
							</div>
						{/each}
					</div>
				{/each}
			</div>
		{/if}
	{/if}
</div>

<style>
	.layout {
		display: flex;
		flex-direction: column;
		background: rgba(255, 255, 255, 0.1);
		min-height: calc(100vh - 200px);
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

	/* 3-column auto-fill grid */
	.cards-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 0.75rem;
		margin-bottom: 0.5rem;
		align-items: start;
	}

	/* Area card */
	.area-card {
		background: rgba(255, 255, 255, 0.08);
		border-radius: 12px;
		padding: 1.5rem 1.75rem;
		box-sizing: border-box;
	}
	.area-heading {
		margin: 0 0 1rem;
		font-size: 1.2rem;
		font-weight: 700;
		color: white;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		opacity: 0.85;
	}

	/* Patient-selected section */
	.patient-section-header {
		display: flex;
		align-items: baseline;
		gap: 1rem;
		padding: 0.75rem 0.25rem 0.5rem;
	}
	.patient-section-title {
		margin: 0;
		font-size: 1rem;
		font-weight: 700;
		color: #57c9d5;
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}
	.patient-section-hint {
		font-size: 0.85rem;
		color: rgba(255, 255, 255, 0.45);
	}
	.patient-card {
		border: 1px solid rgba(87, 201, 213, 0.25);
	}
	.patient-area-heading {
		color: #57c9d5 !important;
		opacity: 1 !important;
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
	}
	.patient-label {
		font-size: 0.7rem;
		font-weight: 400;
		text-transform: none;
		letter-spacing: 0;
		opacity: 0.65;
	}

	/* Single-line exercise rows */
	.bar-row {
		display: flex;
		align-items: center;
		margin-bottom: 0.65rem;
	}
	.ex-title {
		flex: 0 0 40%;
		max-width: 40%;
		white-space: normal;
		font-size: 0.9rem;
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
		border-radius: 3px;
		transition: width 0.4s ease;
		min-width: 0;
	}
	.meta {
		flex: 0 0 auto;
		font-size: 0.78rem;
		color: rgba(255, 255, 255, 0.55);
		white-space: nowrap;
		margin-left: 8px;
	}
</style>
