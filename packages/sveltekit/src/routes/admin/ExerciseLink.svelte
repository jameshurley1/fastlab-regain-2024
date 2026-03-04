<script lang="ts">
	import { enhance } from '$app/forms';
	import Card, {
		Actions,
		ActionIcons,
		Content,
		Media,
		PrimaryAction,
		MediaContent
	} from '@smui/card';
	import IconButton, { Icon } from '@smui/icon-button';
	import { goto } from '$app/navigation';
	import { lazyLoad } from '$lib/utils/lazyload';

	import { currentExercise } from '$lib/utils/store';
	import { currentGroup, currentMode, user } from '$lib/utils/store';

	let open: boolean = $state(false);
	let url: string = $state('');

	let loaded: boolean = $state(false);
	let notfound: boolean = $state(false);
	let submitting: boolean = $state(false);
	let form: HTMLFormElement | undefined = $state();
	let action: { success: boolean; key: string } = $state({ success: false, key: '' });

	let { exercise }: { exercise: Exercise } = $props();
</script>

<form
	style="display: none;"
	bind:this={form}
	method="POST"
	action="?/getKey"
	use:enhance={({ cancel }) => {
		if (loaded || submitting) {
			cancel();
			return;
		}
		submitting = true;
		return async ({ result }: { result: any }) => {
			submitting = false;
			if (result.data?.url) {
				action = { success: result.status === 200, key: result.data.url };
				const url = await fetch(action.key);
				if (url.status === 404) {
					notfound = true;
				}
				loaded = true;
			} else {
				notfound = true;
				loaded = true;
			}
		};
	}}
>
	<input type="hidden" name="key" value={exercise.imageKey} />
</form>

<Card style="border-radius: 16px; height: 100%;">
	<PrimaryAction
		onclick={() => {
			currentExercise.current = exercise;
			currentMode.current = 'display';
			goto(`/admin/exercises/${exercise.id}`);
		}}
	>
		<Media class="card-media-16x9" aspectRatio="16x9">
			<MediaContent>
				<div
					use:lazyLoad
					onisVisible={() => {
						form?.requestSubmit();
					}}
				>
					{#if action.success === true && notfound === false}
						<img src={action.key} alt="Video Thumbnail" loading="lazy" />
					{:else if notfound || loaded}
						<div class="placeholder">
							<Icon class="material-icons">videocam</Icon>
							<p>{exercise.title}</p>
						</div>
					{:else}
						<div class="loader"></div>
					{/if}
				</div>
			</MediaContent>
		</Media>
		<Content style="padding: 1rem;">
			<div class="subtitle">
				<h3 class="mdc-typography--headline6">
					{exercise.title}
				</h3>
				<p class="mdc-typography--body2">
					{exercise.description}
				</p>
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
  <DeleteModal object={exercise} type="exercise" bind:open />
-->

<style>
	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.subtitle {
		width: 100%;
	}
	.subtitle h3 {
		margin: 0 0 0.25rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.subtitle p {
		margin: 0;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.placeholder {
		display: flex;
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		background-color: hsl(0, 0%, 92%);
		color: hsl(0, 0%, 50%);
	}
	.placeholder p {
		margin: 0.5em 0 0;
		font-size: 0.8rem;
	}
	.loader {
		display: flex;
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		animation: pulse 2s infinite;
	}
	@keyframes pulse {
		0%,
		100% {
			background-color: hsl(0, 0%, 95%);
		}
		50% {
			background-color: hsl(0, 0%, 90%);
		}
	}
</style>
