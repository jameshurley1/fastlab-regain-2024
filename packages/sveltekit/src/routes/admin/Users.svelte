<script>
	import { onMount } from 'svelte';
	import LayoutGrid, { Cell } from '@smui/layout-grid';
	import Card, { Content } from '@smui/card';

	let users = $state([]);

	onMount(async () => {
		console.log('onMount firing');
		const response = await fetch('http://127.0.0.1:3001/user/list');
		users = await response.json();
		console.log(users);
	});
</script>

<svelte:head>
	<title>Users</title>
</svelte:head>

<posts-panel>
	{#if users.length > 0}
		<LayoutGrid>
			{#each users as u}
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
