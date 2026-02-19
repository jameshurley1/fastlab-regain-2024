<script lang="ts">
	import { goto } from '$app/navigation';
	import { v4 as uuidv4 } from 'uuid';
	import CircularProgress from '@smui/circular-progress';
	import Button from '@smui/button';
	import { Icon } from '@smui/icon-button';
	import Textfield from '@smui/textfield';
	import Dialog, { Title, Content } from '@smui/dialog';
	import { currentGroup, currentMode, user } from '$lib/utils/store';
	import LayoutGrid, { Cell } from '@smui/layout-grid';

	let title = currentGroup.current.area || '';
	let checkValid: boolean = $state(false);

	let open: boolean = $state(false);

	const handleEdit = () => {
		if (currentMode.current === 'display') {
			currentMode.current = 'edit';
		} else {
			currentMode.current = 'display';
		}
	};

	const handleSave = async () => {
		open = true;
		if (currentMode.current === 'edit') {
			open = false;
			goto('/admin');

			/*
			editGroup({
				id: currentGroup.current.id,
				area: area,
			});
      */
		} else if (currentMode.current === 'add') {
			open = false;
			goto('/admin');

			/*
			addGroup({
				id: uuidv4(),
				area: area,
			});
      */
		}
	};

	$effect(() => {
		checkValid = title !== '';
	});
</script>

<svelte:head>
	{#if currentMode.current === 'display' || currentMode.current === 'edit'}
		<title>{currentGroup.current.area}</title>
	{/if}
	{#if currentMode.current === 'add'}
		<title>New Group</title>
	{/if}
</svelte:head>

<div class="wrap">
	<header-panel>
		<div></div>
		<div>
			{#if (user && currentMode.current === 'edit') || currentMode.current === 'add'}
				<Button onclick={handleSave} disabled={!checkValid}>SAVE CHANGES</Button>
			{/if}
			{#if (user && currentMode.current === 'display') || currentMode.current === 'edit'}
				<Button onclick={handleEdit} variant="raised">
					{#if currentMode.current === 'display'}
						EDIT
					{:else}
						CANCEL
					{/if}
				</Button>
			{/if}
			{#if currentMode.current === 'add' || currentMode.current === 'display'}
				<Button onclick={() => goto('/admin')} variant="raised">CANCEL</Button>
			{/if}
		</div>
	</header-panel>

	<section>
		<LayoutGrid style="width: 100%;">
			<Cell span={12}>
				<column>
					<span>
						<heading>Group Title</heading>
						{#if currentMode.current === 'add' || currentMode.current === 'edit'}
							<required>
								<Icon class="material-icons required" on>star</Icon>
							</required>
						{/if}
					</span>
					<editor-wrap>
						{#if currentMode.current === 'display'}
							<group-title>{currentGroup.current.area}</group-title>
						{:else}
							<Textfield
								style="width: 100%;"
								variant="filled"
								bind:value={currentGroup.current.area}
								label="Title"
								required
							/>
						{/if}
					</editor-wrap>
				</column>
			</Cell>
		</LayoutGrid>
	</section>
</div>

<Dialog bind:open scrimClickAction="" escapeKeyAction="">
	<Title id="simple-title">SAVING CHANGES</Title>
	<Content id="simple-content">
		<div style="display: flex; justify-content: center">
			<CircularProgress style="height: 32px; width: 32px;" indeterminate />
		</div>
	</Content>
</Dialog>

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
	editor-wrap {
		padding: 1em 0em 1em 0em;
	}
	section {
		display: flex;
		flex-direction: column;
		position: relative;
		background: white;
		padding: 0.5em;
		margin: 0.5em;
	}
	column {
		display: flex;
		flex-direction: column;
	}
	heading {
		font-size: 16px;
		font-weight: 600;
		padding: 1em 0em 1em 0em;
	}
	group-title {
		display: flex;
		position: relative;
		padding: 1em 0em 1em 0em;
	}
</style>
