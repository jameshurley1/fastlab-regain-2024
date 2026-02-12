<script>
	import { onMount } from 'svelte';
	import LayoutGrid, { Cell } from '@smui/layout-grid';
	import Button from '@smui/button';
	import { goto } from '$app/navigation';
	import GroupLink from './GroupLink.svelte';

	import { groups, currentGroup, currentMode, user } from '$lib/utils/store';

	onMount(async () => {
		currentGroup.current = {
			id: '',
			area: '',
			users: [],
			exercises: [],
			createdAt: '',
			updatedAt: ''
		};
		currentMode.current = 'display';
	});
</script>

<svelte:head>
	<title>Groups</title>
</svelte:head>

{#if user.current}
	<header-panel>
		<div></div>
		<div>
			<Button
				variant="raised"
				onclick={() => {
					currentMode.current = 'add';
					goto('/admin/groups/new');
				}}
			>
				ADD GROUP
			</Button>
		</div>
	</header-panel>
{/if}

<posts-panel>
	{#if groups.current}
		<LayoutGrid>
			{#each groups.current as group}
				<Cell spanDevices={{ phone: 12, tablet: 4, desktop: 3 }}>
					<GroupLink {group} />
				</Cell>
			{/each}
		</LayoutGrid>
	{/if}
</posts-panel>

<style>
	posts-panel {
		display: flex;
		position: relative;
		height: 100%;
	}
	header-panel {
		display: flex;
		position: relative;
		flex-direction: row;
		justify-content: space-between;
		width: 100%;
	}
</style>
