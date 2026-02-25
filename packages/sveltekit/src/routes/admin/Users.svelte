<script lang="ts">
	import { onMount } from 'svelte';

	const API = 'http://127.0.0.1:3001';

	let users: User[] = $state([]);
	let allExercises: (Exercise & { groups?: { id: string; area: string }[] })[] = $state([]);
	let allGroups: Group[] = $state([]);
	let allSessions: any[] = $state([]);

	let selectedUser: User | null = $state(null);
	// Working copies — edited locally, saved together in one call
	let draftGroups: Group[] = $state([]);
	let draftExercises: UserExercise[] = $state([]);

	let saving = $state(false);
	let saveMsg = $state('');
	let expandProgress = $state(false);

	onMount(async () => {
		const [usersRes, exRes, groupsRes, sessionsRes] = await Promise.all([
			fetch(`${API}/user/list`),
			fetch(`${API}/exercise/list`),
			fetch(`${API}/group/list`),
			fetch(`${API}/session/list`)
		]);
		users = await usersRes.json();
		allExercises = await exRes.json();
		allGroups = await groupsRes.json();
		allSessions = await sessionsRes.json();
	});

	function selectUser(u: User) {
		selectedUser = u;
		draftGroups = (u.groups ?? []).map((g) => ({ ...g }));
		draftExercises = (u.exercises ?? []).map((e) => ({ ...e }));
		saveMsg = '';
		expandProgress = false;
	}

	// Toggle a body-area group in/out of draftGroups
	function toggleGroup(group: Group) {
		const idx = draftGroups.findIndex((g) => g.id === group.id);
		if (idx >= 0) {
			draftGroups = draftGroups.filter((g) => g.id !== group.id);
		} else {
			draftGroups = [...draftGroups, { ...group }];
		}
	}

	function isGroupActive(groupId: string): boolean {
		return draftGroups.some((g) => g.id === groupId);
	}

	// Exercises that belong to any group currently in draftGroups.
	// Uses the embedded .groups array that seed.js writes onto each exercise.
	const userGroupExercises = $derived.by(() => {
		const activeAreaNames = new Set(draftGroups.map((g) => g.area));
		if (activeAreaNames.size === 0) return [];
		return allExercises.filter((ex) =>
			(ex.groups ?? []).some((g) => activeAreaNames.has(g.area))
		);
	});

	// Exercises from userGroupExercises not yet assigned
	const unassigned = $derived.by(() => {
		const assigned = new Set(draftExercises.map((e) => e.exerciseId));
		return userGroupExercises.filter((ex) => !assigned.has(ex.id));
	});

	function setTargetReps(exerciseId: string, value: number) {
		const idx = draftExercises.findIndex((e) => e.exerciseId === exerciseId);
		if (idx >= 0) {
			draftExercises[idx] = { exerciseId, targetReps: value };
		}
	}

	function addExercise(exerciseId: string) {
		if (!exerciseId) return;
		draftExercises = [...draftExercises, { exerciseId, targetReps: 10 }];
	}

	function removeExercise(exerciseId: string) {
		draftExercises = draftExercises.filter((e) => e.exerciseId !== exerciseId);
	}

	// Single save: persist both groups and exercises together via /user/update
	async function saveUser() {
		if (!selectedUser) return;
		saving = true;
		saveMsg = '';
		try {
			const res = await fetch(`${API}/user/update`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					email: selectedUser.email,
					groups: draftGroups,
					exercises: draftExercises
				})
			});
			if (res.ok) {
				const updated: User = await res.json();
				users = users.map((u) => (u.email === updated.email ? updated : u));
				selectedUser = updated;
				saveMsg = 'Saved!';
			} else {
				saveMsg = 'Save failed.';
			}
		} catch {
			saveMsg = 'Save failed.';
		} finally {
			saving = false;
		}
	}

	function exerciseTitle(id: string): string {
		return allExercises.find((e) => e.id === id)?.title ?? id;
	}

	function userSessions(userId: string): any[] {
		return allSessions.filter((s) => s.userId === userId);
	}

	function lastSession(sessions: any[]): any | null {
		if (!sessions.length) return null;
		return sessions.reduce((a, b) => (a.date > b.date ? a : b));
	}

	function formatDate(iso: string): string {
		return new Date(iso).toLocaleDateString('en-AU', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}

	let addSelectValue = $state('');
</script>

<div class="users-layout">
	<!-- ── Left: user list ── -->
	<div class="user-list">
		<h3>Users ({users.length})</h3>
		{#each users as u}
			<button
				class="user-row"
				class:selected={selectedUser?.email === u.email}
				onclick={() => selectUser(u)}
			>
				<i class="material-icons user-icon">person</i>
				<span>{u.email}</span>
			</button>
		{/each}
	</div>

	<!-- ── Right: detail panel ── -->
	{#if selectedUser}
		<div class="user-detail">
			<h3>{selectedUser.email}</h3>

			<!-- ── Groups section ── -->
			<h4>Body area groups</h4>
			<p class="section-hint">Tick the areas affected by this patient's stroke.</p>
			<div class="group-grid">
				{#each allGroups as group}
					<label class="group-chip" class:active={isGroupActive(group.id)}>
						<input
							type="checkbox"
							checked={isGroupActive(group.id)}
							onchange={() => toggleGroup(group)}
						/>
						{group.area}
					</label>
				{/each}
			</div>

			<!-- ── Exercises section ── -->
			<h4 style="margin-top: 1.75rem;">Assigned exercises &amp; target reps</h4>

			{#if draftGroups.length === 0}
				<p class="empty-msg">Assign at least one body area above to unlock exercises.</p>
			{:else if draftExercises.length === 0}
				<p class="empty-msg">No exercises assigned yet — use the dropdown below to add some.</p>
			{:else}
				<table class="exercise-table">
					<thead>
						<tr>
							<th>Exercise</th>
							<th>Target reps</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{#each draftExercises as assignment}
							<tr>
								<td>{exerciseTitle(assignment.exerciseId)}</td>
								<td>
									<input
										class="reps-input"
										type="number"
										min="0"
										value={assignment.targetReps}
										oninput={(e) =>
											setTargetReps(
												assignment.exerciseId,
												parseInt((e.target as HTMLInputElement).value, 10) || 0
											)}
									/>
								</td>
								<td>
									<button
										class="remove-btn"
										onclick={() => removeExercise(assignment.exerciseId)}
										title="Remove"
									>
										<i class="material-icons">close</i>
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}

			{#if unassigned.length > 0}
				<div class="add-row">
					<select bind:value={addSelectValue} class="add-select">
						<option value="">Add an exercise…</option>
						{#each unassigned as ex}
							<option value={ex.id}>{ex.title}</option>
						{/each}
					</select>
					<button
						class="add-btn"
						onclick={() => {
							addExercise(addSelectValue);
							addSelectValue = '';
						}}
						disabled={!addSelectValue}
					>
						<i class="material-icons">add</i> Add
					</button>
				</div>
			{/if}

			<!-- ── Save ── -->
			<div class="save-row">
				<button class="save-btn" onclick={saveUser} disabled={saving}>
					{saving ? 'Saving…' : 'Save'}
				</button>
				{#if saveMsg}
					<span class="save-msg" class:error={saveMsg === 'Save failed.'}>{saveMsg}</span>
				{/if}
			</div>

			<!-- ── Session progress ── -->
			<h4 style="margin-top: 1.75rem;">Session Progress</h4>
			{@const sessions = userSessions(selectedUser.id)}
			{@const last = lastSession(sessions)}
			{#if sessions.length}
				<p class="session-summary">
					Last session: {formatDate(last.date)} · Total sessions: {sessions.length}
				</p>
			{:else}
				<p class="session-summary no-sessions-text">No sessions yet</p>
			{/if}
			<button class="toggle-btn" onclick={() => (expandProgress = !expandProgress)}>
				{expandProgress ? 'Hide Progress ▲' : 'View Progress ▼'}
			</button>
			{#if expandProgress}
				<div class="session-table-wrap">
					{#if sessions.length}
						<table class="session-hist-table">
							<thead>
								<tr>
									<th>Exercise</th>
									<th>Date</th>
									<th>Reps</th>
									<th>Video</th>
								</tr>
							</thead>
							<tbody>
								{#each sessions.slice().sort((a: any, b: any) => b.date.localeCompare(a.date)) as s}
									<tr>
										<td>{exerciseTitle(s.exerciseId)}</td>
										<td>{formatDate(s.date)}</td>
										<td>{s.repsCompleted}</td>
										<td>{s.videoCompleted ? '✓' : '—'}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					{:else}
						<p class="empty-msg">No sessions recorded.</p>
					{/if}
				</div>
			{/if}
		</div>
	{:else}
		<div class="user-detail empty">
			<p>Select a user to view and edit their profile.</p>
		</div>
	{/if}
</div>

<style>
	.users-layout {
		display: flex;
		gap: 2rem;
		padding: 1rem;
		color: white;
		height: 100%;
		box-sizing: border-box;
	}

	/* ── User list ── */
	.user-list {
		min-width: 220px;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	.user-list h3 {
		margin: 0 0 0.75rem;
		font-size: 1rem;
		color: rgba(255, 255, 255, 0.7);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	.user-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.6rem 0.75rem;
		border-radius: 8px;
		border: none;
		background: rgba(255, 255, 255, 0.08);
		color: white;
		cursor: pointer;
		text-align: left;
		font-size: 0.95rem;
		transition: background 0.15s;
	}
	.user-row:hover {
		background: rgba(255, 255, 255, 0.15);
	}
	.user-row.selected {
		background: rgba(255, 255, 255, 0.25);
		font-weight: 600;
	}
	.user-icon {
		font-size: 1.1rem;
		opacity: 0.7;
	}

	/* ── Detail panel ── */
	.user-detail {
		flex: 1;
		overflow-y: auto;
	}
	.user-detail h3 {
		margin: 0 0 0.25rem;
		font-size: 1.3rem;
		color: white;
	}
	.user-detail h4 {
		margin: 1.25rem 0 0.4rem;
		font-size: 1rem;
		color: rgba(255, 255, 255, 0.85);
	}
	.section-hint {
		margin: 0 0 0.6rem;
		font-size: 0.85rem;
		opacity: 0.55;
	}
	.empty-msg {
		opacity: 0.5;
		font-style: italic;
		font-size: 0.9rem;
	}
	.user-detail.empty {
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0.4;
	}

	/* ── Group chips ── */
	.group-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	.group-chip {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.4rem 0.9rem;
		border-radius: 20px;
		border: 1.5px solid rgba(255, 255, 255, 0.25);
		background: rgba(255, 255, 255, 0.07);
		color: rgba(255, 255, 255, 0.65);
		font-size: 0.9rem;
		cursor: pointer;
		user-select: none;
		transition:
			background 0.15s,
			border-color 0.15s,
			color 0.15s;
	}
	.group-chip input[type='checkbox'] {
		/* hide the native checkbox; the chip style shows state */
		position: absolute;
		opacity: 0;
		width: 0;
		height: 0;
		pointer-events: none;
	}
	.group-chip.active {
		background: rgba(105, 179, 76, 0.3);
		border-color: #69b34c;
		color: white;
		font-weight: 600;
	}
	.group-chip:hover {
		border-color: rgba(255, 255, 255, 0.5);
		color: white;
	}

	/* ── Exercise table ── */
	.exercise-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.95rem;
	}
	.exercise-table th {
		text-align: left;
		padding: 0.4rem 0.6rem;
		opacity: 0.6;
		font-weight: 500;
		border-bottom: 1px solid rgba(255, 255, 255, 0.15);
	}
	.exercise-table td {
		padding: 0.4rem 0.6rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
	}
	.reps-input {
		width: 72px;
		padding: 0.3rem 0.4rem;
		font-size: 1rem;
		border: 1px solid rgba(255, 255, 255, 0.3);
		border-radius: 4px;
		background: rgba(255, 255, 255, 0.1);
		color: white;
		text-align: center;
		-moz-appearance: textfield;
	}
	.reps-input::-webkit-inner-spin-button,
	.reps-input::-webkit-outer-spin-button {
		-webkit-appearance: none;
	}
	.remove-btn {
		background: none;
		border: none;
		color: rgba(255, 80, 80, 0.8);
		cursor: pointer;
		padding: 0.2rem;
		border-radius: 4px;
		display: flex;
		align-items: center;
	}
	.remove-btn:hover {
		color: #ff5050;
	}

	/* ── Add row ── */
	.add-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 0.75rem;
	}
	.add-select {
		padding: 0.4rem 0.6rem;
		border-radius: 6px;
		border: 1px solid rgba(255, 255, 255, 0.3);
		background: rgba(255, 255, 255, 0.1);
		color: white;
		font-size: 0.9rem;
		flex: 1;
		max-width: 320px;
	}
	.add-select option {
		background: #333;
	}
	.add-btn {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.4rem 0.75rem;
		border-radius: 6px;
		border: 1px solid rgba(255, 255, 255, 0.3);
		background: rgba(255, 255, 255, 0.12);
		color: white;
		cursor: pointer;
		font-size: 0.9rem;
	}
	.add-btn:disabled {
		opacity: 0.4;
		cursor: default;
	}

	/* ── Save ── */
	.save-row {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-top: 1.5rem;
	}
	.save-btn {
		padding: 0.55rem 2rem;
		border-radius: 8px;
		border: none;
		background: #69b34c;
		color: white;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
	}
	.save-btn:disabled {
		opacity: 0.5;
		cursor: default;
	}
	.save-msg {
		font-weight: 600;
		color: #69b34c;
	}
	.save-msg.error {
		color: #ff5050;
	}

	/* ── Session progress ── */
	.session-summary {
		font-size: 0.85rem;
		color: rgba(255, 255, 255, 0.65);
		margin: 0.25rem 0 0.5rem;
	}
	.no-sessions-text {
		color: rgba(255, 255, 255, 0.35);
		font-style: italic;
	}
	.toggle-btn {
		background: none;
		border: 1px solid rgba(255, 255, 255, 0.25);
		border-radius: 6px;
		padding: 0.3rem 0.75rem;
		font-size: 0.8rem;
		cursor: pointer;
		color: rgba(255, 255, 255, 0.75);
		margin-bottom: 0.5rem;
	}
	.toggle-btn:hover {
		background: rgba(255, 255, 255, 0.08);
		border-color: rgba(255, 255, 255, 0.45);
		color: white;
	}
	.session-table-wrap {
		margin-top: 0.5rem;
		overflow-x: auto;
	}
	.session-hist-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.875rem;
	}
	.session-hist-table th {
		text-align: left;
		padding: 0.4rem 0.6rem;
		opacity: 0.6;
		font-weight: 500;
		border-bottom: 1px solid rgba(255, 255, 255, 0.15);
	}
	.session-hist-table td {
		padding: 0.35rem 0.6rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
		color: rgba(255, 255, 255, 0.85);
	}
</style>
