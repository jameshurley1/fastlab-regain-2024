<script lang="ts">
	import LayoutGrid, { Cell } from '@smui/layout-grid';
	import Card, { Content } from '@smui/card';
	import Button from '@smui/button';
	import { goto } from '$app/navigation';
	import { currentUser, currentMode } from '$lib/utils/store';

	let { data } = $props();
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
</style>
