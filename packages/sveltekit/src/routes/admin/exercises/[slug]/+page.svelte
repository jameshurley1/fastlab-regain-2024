<script lang="ts">
	import { goto } from '$app/navigation';
	import { v4 as uuidv4 } from 'uuid';
	import CircularProgress from '@smui/circular-progress';
	import SegmentedButton, { Segment, Label } from '@smui/segmented-button';
	import Button from '@smui/button';
	import { Icon } from '@smui/icon-button';
	import Textfield from '@smui/textfield';
	import Dialog, { Title, Content } from '@smui/dialog';
	import { currentExercise, currentMode, user, groups } from '$lib/utils/store';
	import LayoutGrid, { Cell } from '@smui/layout-grid';
	// import FilePond from "../../components/FilePond.svelte";

	let title: string = $state(currentExercise.current.title || '');
	let description: string = $state(currentExercise.current.description || '');

	let video: object = [];
	let thumbnail: object = [];
	let exerciseVideo = $state(currentExercise.current.video || null);
	let exerciseThumb = $state(currentExercise.current.video || null);

	let duration: number;

	$effect(() => {
		duration = 0;
		checkValid = title !== '';
	});

	let checkValid: boolean = $state(false);
	let open: boolean = $state(false);

	let groupChoices = groups.current;
	let groupsSelected = $state(currentExercise.current.groups || []);

	const handleEdit = () => {
		if (currentMode.current === 'display') {
			currentMode.current = 'edit';
		} else {
			currentMode.current = 'display';
		}
	};

	const handleSave = async () => {
		console.log(' handleSave() ');
	};
</script>

<svelte:head>
	{#if currentMode.current === 'display' || currentMode.current === 'edit'}
		<title>{currentExercise.current.title}</title>
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
				<Button onclick={handleSave} variant="raised" disabled={!checkValid}>SAVE CHANGES</Button>
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
			<Cell span={4}>
				<column>
					<span>
						<heading>Exercise Title</heading>
						{#if currentMode.current === 'add' || currentMode.current === 'edit'}
							<required>
								<Icon class="material-icons required" on>star</Icon>
							</required>
						{/if}
					</span>
					<editor-wrap>
						{#if currentMode.current === 'display'}
							<group-title>{currentExercise.current.title}</group-title>
						{:else}
							<Textfield
								style="width: 100%;"
								variant="filled"
								bind:value={title}
								label="Title"
								required
							/>
						{/if}
					</editor-wrap>
				</column>
			</Cell>
			<Cell span={5}>
				<column>
					<span>
						<heading>Exercise Groups</heading>
						{#if currentMode.current === 'add' || currentMode.current === 'edit'}
							<required>
								<Icon class="material-icons required" on>star</Icon>
							</required>
						{/if}
					</span>
					<editor-wrap>
						{#if currentMode.current === 'display'}
							<SegmentedButton
								segments={groupChoices}
								key={(segment) => segment.id}
								bind:selected={groupsSelected}
							>
								{#snippet segment(segment)}
									<Segment {segment} disabled>
										<Label>{segment.area}</Label>
									</Segment>
								{/snippet}
							</SegmentedButton>
						{:else}
							<SegmentedButton
								segments={groupChoices}
								key={(segment) => segment.id}
								bind:selected={groupsSelected}
							>
								{#snippet segment(segment)}
									<Segment {segment}>
										<Label>{segment.area}</Label>
									</Segment>
								{/snippet}
							</SegmentedButton>
						{/if}
					</editor-wrap>
				</column>
			</Cell>
			<Cell span={2}>
				<column>
					<span>
						<heading>Exercise Time</heading>
						{#if currentMode.current === 'add' || currentMode.current === 'edit'}
							<required>
								<Icon class="material-icons required" on>star</Icon>
							</required>
						{/if}
					</span>
					<editor-wrap>
						{#if currentMode.current === 'display'}
							<post-title>
								{currentExercise.current.time}
							</post-title>
						{:else if currentMode.current === 'edit'}
							<Textfield
								style="width: 100%;"
								variant="filled"
								bind:value={currentExercise.current.time}
								label="Title"
								required
								disabled
							/>
						{/if}
					</editor-wrap>
				</column>
			</Cell>
			<Cell span={12}>
				<span>
					<heading>Description</heading>
					{#if currentMode.current === 'add' || currentMode.current === 'edit'}
						<required>
							<Icon class="material-icons required" on>star</Icon>
						</required>
					{/if}
				</span>
				<editor-wrap>
					{#if currentMode.current === 'display'}
						<post-details>{@html currentExercise.current.description}</post-details>
					{:else}
						<Textfield
							style="width: 100%;"
							variant="filled"
							bind:value={currentExercise.current.description}
							label="Description"
							required
						/>
					{/if}
				</editor-wrap>
			</Cell>
			<Cell span={6}>
				<column>
					<span>
						<heading>Video File</heading>
						{#if currentMode.current === 'add' || currentMode.current === 'edit'}
							<required>
								<Icon class="material-icons required" on>star</Icon>
							</required>
						{/if}
					</span>
					<editor-wrap>
						{#if currentMode.current === 'display'}
							<post-title>
								<!--
							<S3Video
								width="525px"
								height="auto"
								key={currentExercise.current.video.key}
								autoplay
							/>
              -->
							</post-title>
						{:else}
							<!--
						<FilePond
							type="video"
							bind:duration
							multiple={false}
							bind:files={video}
							filesToLoad={exerciseVideo.key}
						/>
          -->
						{/if}
					</editor-wrap>
				</column>
			</Cell>
			<Cell span={6}>
				<column>
					<span>
						<heading>Thumbnail</heading>
						{#if currentMode.current === 'add' || currentMode.current === 'edit'}
							<required>
								<Icon class="material-icons required" on>star</Icon>
							</required>
						{/if}
					</span>
					<editor-wrap>
						{#if currentMode.current === 'display'}
							<post-title>
								<!--
							  <S3Image image={currentExercise.current.thumbnail.key} />
              -->
							</post-title>
						{:else}
							<!--
						<FilePond
							type="thumb"
							multiple={false}
							bind:duration
							bind:files={thumbnail}
							filesToLoad={exerciseThumb.key}
						/>
          -->
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
		padding: 1rem;
		margin: 1rem;
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
