<script lang="ts">
	import { onMount } from 'svelte';

	const API = 'http://127.0.0.1:3001';

	let users: User[] = $state([]);
	let allExercises: Exercise[] = $state([]);
	let selectedUser: User | null = $state(null);
	// Working copy of the selected user's exercise assignments (exerciseId → targetReps)
	let draftExercises: UserExercise[] = $state([]);
	let saving = $state(false);
	let saveMsg = $state('');

	onMount(async () => {
		const [usersRes, exRes] = await Promise.all([
			fetch(`${API}/user/list`),
			fetch(`${API}/exercise/list`)
		]);
		users = await usersRes.json();
		allExercises = await exRes.json();
	});

	function selectUser(u: User) {
		selectedUser = u;
		// Deep-copy so edits don't mutate the store directly
		draftExercises = (u.exercises ?? []).map((e) => ({ ...e }));
		saveMsg = '';
	}

	// Exercises that belong to any of the user's groups
	const userGroupExercises = $derived.by(() => {
		if (!selectedUser) return [];
		const userAreaNames = new Set((selectedUser.groups ?? []).map((g: any) => g.area));
		return allExercises.filter((ex: Exercise) =>
			(ex as any).groups?.some((g: any) => userAreaNames.has(g.area))
		);
	});

	// All exercises not already assigned (for the "add" dropdown)
	const unassigned = $derived.by(() => {
		const assigned = new Set(draftExercises.map((e) => e.exerciseId));
		return userGroupExercises.filter((ex) => !assigned.has(ex.id));
	});

	function getTargetReps(exerciseId: string): number {
		return draftExercises.find((e) => e.exerciseId === exerciseId)?.targetReps ?? 0;
	}

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

	async function saveTargets() {
		if (!selectedUser) return;
		saving = true;
		saveMsg = '';
		try {
			const res = await fetch(`${API}/user/updateExerciseTargets`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: selectedUser.email, exercises: draftExercises })
			});
			if (res.ok) {
				const updated: User = await res.json();
				// Sync back into the users list
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

	// Look up exercise title by id
	function exerciseTitle(id: string): string {
		return allExercises.find((e) => e.id === id)?.title ?? id;
	}

	let addSelectValue = $state('');
</script>

<div class="users-layout">
	<!-- User list panel -->
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

	<!-- Detail panel -->
	{#if selectedUser}
		<div class="user-detail">
			<h3>{selectedUser.email}</h3>
			<p class="groups-label">
				Groups: {(selectedUser.groups ?? []).map((g: any) => g.area).join(', ') || '—'}
			</p>

			<h4>Assigned exercises &amp; target reps</h4>

			{#if draftExercises.length === 0}
				<p class="empty-msg">No exercises assigned yet.</p>
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
						onclick={() => { addExercise(addSelectValue); addSelectValue = ''; }}
						disabled={!addSelectValue}
					>
						<i class="material-icons">add</i> Add
					</button>
				</div>
			{/if}

			<div class="save-row">
				<button class="save-btn" onclick={saveTargets} disabled={saving}>
					{saving ? 'Saving…' : 'Save'}
				</button>
				{#if saveMsg}
					<span class="save-msg" class:error={saveMsg === 'Save failed.'}>{saveMsg}</span>
				{/if}
			</div>
		</div>
	{:else}
		<div class="user-detail empty">
			<p>Select a user to view and edit their exercise targets.</p>
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

	/* ---- User list ---- */
	.user-list {
		min-width: 220px;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	.user-list h3 {
		margin: 0 0 0.75rem;
		font-size: 1rem;
		opacity: 0.7;
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

	/* ---- Detail panel ---- */
	.user-detail {
		flex: 1;
	}
	.user-detail h3 {
		margin: 0 0 0.25rem;
		font-size: 1.3rem;
	}
	.user-detail h4 {
		margin: 1.25rem 0 0.5rem;
		font-size: 1rem;
		opacity: 0.85;
	}
	.groups-label {
		margin: 0;
		font-size: 0.9rem;
		opacity: 0.6;
	}
	.empty-msg {
		opacity: 0.5;
		font-style: italic;
	}
	.user-detail.empty {
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0.4;
	}

	/* ---- Exercise table ---- */
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

	/* ---- Add row ---- */
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

	/* ---- Save ---- */
	.save-row {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-top: 1.25rem;
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
</style>
