<script>
	import LayoutGrid, { Cell } from '@smui/layout-grid';
	import Card, { Content } from '@smui/card';

	import { user } from '$lib/utils/store';

	let { data } = $props();
</script>

<svelte:head>
	<title>Users</title>
</svelte:head>

<posts-panel>
	{#if data?.users}
		<LayoutGrid>
			{#each data.users as u}
				<Cell spanDevices={{ phone: 12, tablet: 4, desktop: 3 }}>
					<Card style="border-radius: 16px;">
						<Content>
							<h3>{u.email}</h3>
							<p>Onboarded: {u.onboard ? 'Yes' : 'No'}</p>
							<p>Groups: {u.groups?.length || 0}</p>
						</Content>
					</Card>
				</Cell>
			{/each}
		</LayoutGrid>
	{:else}
		<p>No users found.</p>
	{/if}
</posts-panel>

<style>
	posts-panel {
		display: flex;
		position: relative;
		height: 100%;
		width: 100vw;
	}
</style>
