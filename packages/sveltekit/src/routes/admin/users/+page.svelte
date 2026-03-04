<script lang="ts">
	import LayoutGrid, { Cell } from '@smui/layout-grid';
	import Card, { Content } from '@smui/card';
	import Button from '@smui/button';
	import { goto } from '$app/navigation';
	import { currentUser, currentMode } from '$lib/utils/store';

	let { data } = $props();

	let expandedUserId: string | null = $state(null);

	function toggleExpand(userId: string) {
		expandedUserId = expandedUserId === userId ? null : userId;
	}

	function lastSession(sessions: any[]) {
		if (!sessions?.length) return null;
		return sessions.reduce((a: any, b: any) => (a.date > b.date ? a : b));
	}

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString('en-AU', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}

	function formatDateTime(iso: string) {
		const d = new Date(iso);
		return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
			+ ' ' + d.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });
	}
</script>

<svelte:head>
	<title>Users</title>
</svelte:head>

<div class="wrap">
	<header-panel>
		<div></div>
		<div>
			<Button onclick={() => goto('/admin')} variant="raised">BACK</Button>
		</div>
	</header-panel>

	<section>
		<LayoutGrid style="width: 100%;">
			{#if data?.users}
				{#each data.users as u}
					<Cell spanDevices={{ phone: 12, tablet: 6, desktop: 4 }}>
						<Card style="border-radius: 16px;">
							<Content>
								<h3>{u.email}</h3>
								<p>Onboarded: {u.onboard ? 'Yes' : 'No'}</p>
								<p>Groups: {u.groups?.length || 0}</p>
								{#if u.sessions?.length}
									<p class="session-summary">
										Last session: {formatDate(lastSession(u.sessions).date)} · Total sessions: {u.sessions.length}
									</p>
								{:else}
									<p class="session-summary no-sessions">No sessions yet</p>
								{/if}
								<button class="toggle-btn" onclick={() => toggleExpand(u.id)}>
									{expandedUserId === u.id ? 'Hide Progress ▲' : 'View Progress ▼'}
								</button>
								{#if expandedUserId === u.id}
									<div class="session-table-wrap">
										{#if u.sessions?.length}
											<table class="session-table">
												<thead>
													<tr>
														<th>Exercise ID</th>
														<th>Date</th>
														<th>Reps</th>
														<th>Video</th>
													</tr>
												</thead>
												<tbody>
													{#each u.sessions.slice().sort((a: any, b: any) => b.date.localeCompare(a.date)) as s}
														<tr>
															<td class="exercise-id">{s.exerciseId}</td>
															<td>{formatDate(s.date)}</td>
															<td>{s.repsCompleted}</td>
															<td>{s.videoCompleted ? '✓' : '—'}</td>
														</tr>
													{/each}
												</tbody>
											</table>
										{:else}
											<p class="no-sessions">No sessions recorded.</p>
										{/if}
									</div>

									<div class="ratings-section">
										<h4 class="ratings-heading">Pain &amp; Difficulty Ratings</h4>
										{#if u.ratings?.length}
											<table class="session-table">
												<thead>
													<tr>
														<th>Date/Time</th>
														<th>Exercise</th>
														<th>Type</th>
														<th>Rating</th>
													</tr>
												</thead>
												<tbody>
													{#each u.ratings.slice().sort((a: any, b: any) => b.timestamp.localeCompare(a.timestamp)) as r}
														<tr class={r.type === 'pain' && r.rating >= 4 ? 'rating-high-pain' : ''}>
															<td>{formatDateTime(r.timestamp)}</td>
															<td class="exercise-id">{r.exerciseTitle}</td>
															<td>{r.type === 'pain' ? 'Pain' : 'Difficulty'}</td>
															<td><strong>{r.rating}</strong> / 6</td>
														</tr>
													{/each}
												</tbody>
											</table>
										{:else}
											<p class="no-sessions">No ratings recorded yet.</p>
										{/if}
									</div>
								{/if}
							</Content>
						</Card>
					</Cell>
				{/each}
			{:else}
				<Cell span={12}>
					<p>No users found.</p>
				</Cell>
			{/if}
		</LayoutGrid>
	</section>
</div>

<style>
	.wrap {
		display: flex;
		position: relative;
		flex-direction: column;
		height: 100%;
		width: 100vw;
	}
	header-panel {
		display: flex;
		position: relative;
		flex-direction: row;
		justify-content: space-between;
		width: 100vw;
	}
	section {
		display: flex;
		flex-direction: column;
		position: relative;
		background: white;
		padding: 0.5em;
		margin: 0.5em;
	}
	.session-summary {
		font-size: 0.85rem;
		color: #555;
		margin: 0.25rem 0 0.5rem;
	}
	.no-sessions {
		color: #999;
	}
	.toggle-btn {
		background: none;
		border: 1px solid #ccc;
		border-radius: 6px;
		padding: 0.3rem 0.75rem;
		font-size: 0.8rem;
		cursor: pointer;
		color: #333;
		margin-bottom: 0.5rem;
	}
	.toggle-btn:hover {
		background: #f5f5f5;
	}
	.session-table-wrap {
		margin-top: 0.5rem;
		overflow-x: auto;
	}
	.session-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.8rem;
	}
	.session-table th {
		text-align: left;
		padding: 0.4rem 0.5rem;
		border-bottom: 2px solid #ddd;
		color: #555;
		font-weight: 600;
	}
	.session-table td {
		padding: 0.35rem 0.5rem;
		border-bottom: 1px solid #eee;
		color: #333;
	}
	.exercise-id {
		font-family: monospace;
		font-size: 0.7rem;
		color: #777;
		max-width: 120px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.ratings-section {
		margin-top: 1rem;
	}
	.ratings-heading {
		font-size: 0.85rem;
		font-weight: 600;
		color: #444;
		margin: 0 0 0.4rem 0;
	}
	.rating-high-pain td {
		background-color: #fff0f0;
		color: #c0392b;
		font-weight: 600;
	}
</style>
