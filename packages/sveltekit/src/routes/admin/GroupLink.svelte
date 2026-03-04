<script lang="ts">
	import Card, { Actions, Content, ActionIcons, PrimaryAction } from '@smui/card';
	import { goto } from '$app/navigation';
	import IconButton, { Icon } from '@smui/icon-button';
	import { currentGroup, currentMode, user } from '$lib/utils/store';

	let open: boolean = $state(false);

	let { group }: { group: Group } = $props();
</script>

<Card style="border-radius: 16px; height: 100%;">
	<PrimaryAction
		onclick={() => {
			currentMode.current = 'display';
			currentGroup.current = group;
			goto(`/admin/groups/${group.id}`);
		}}
	>
		<Content style="padding: 1.5rem 1rem;">
			<div class="card-body">
				<span class="material-icons area-icon">fitness_center</span>
				<h2>
					{group.area}
				</h2>
			</div>
		</Content>
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
	.card-body {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 120px;
		gap: 0.75rem;
	}
	.area-icon {
		font-size: 2.5rem;
		opacity: 0.5;
	}
	h2 {
		margin: 0;
		font-size: 1.4rem;
		text-align: center;
		word-break: break-word;
	}
</style>
