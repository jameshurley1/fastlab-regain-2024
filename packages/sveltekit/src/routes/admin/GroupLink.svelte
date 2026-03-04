<script lang="ts">
	import Card, { Actions, Content, ActionIcons, PrimaryAction } from '@smui/card';
	import { goto } from '$app/navigation';
	import IconButton, { Icon } from '@smui/icon-button';
	import { currentGroup, currentMode, user } from '$lib/utils/store';

	let open: boolean = $state(false);

	let { group }: { group: Group } = $props();

	const areaColors: Record<string, string> = {
		'Head': '#4CAF50',
		'Shoulders': '#2196F3',
		'Arms': '#FF9800',
		'Chest': '#E91E63',
		'Core/Abdomen': '#9C27B0',
		'Legs': '#00BCD4',
		'Hands': '#FF5722',
	};

	const color = areaColors[group.area] ?? '#607D8B';
</script>

<Card style="border-radius: 16px; height: 100%; overflow: hidden;">
	<PrimaryAction
		onclick={() => {
			currentMode.current = 'display';
			currentGroup.current = group;
			goto(`/admin/groups/${group.id}`);
		}}
	>
		<div class="color-block" style="background-color: {color};">
			<h2>{group.area}</h2>
		</div>
	</PrimaryAction>
	{#if user}
		<Actions>
			<ActionIcons>
				<IconButton onclick={() => (open = !open)} aria-label="Delete Group" title="Delete Group">
					<Icon class="material-icons">delete</Icon>
				</IconButton>
			</ActionIcons>
		</Actions>
	{/if}
</Card>

<!--
<DeleteModal object={group} type="group" bind:open />
-->

<style>
	.color-block {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 120px;
		padding: 1.5rem 1rem;
	}
	h2 {
		margin: 0;
		font-size: 1.4rem;
		font-weight: 600;
		text-align: center;
		color: white;
		word-break: break-word;
	}
</style>
