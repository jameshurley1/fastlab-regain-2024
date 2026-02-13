<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { calculateRealTime } from '$lib/utils/calculateRealTime';
	import { lazyLoad } from '$lib/utils/lazyload';
	import Card, { PrimaryAction, Media, MediaContent, Content } from '@smui/card';
	import { Icon } from '@smui/common';
	import { Cell } from '@smui/layout-grid';

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
			if (result.data.url) {
				action = { success: result.status === 200, key: result.data.url };
				const url = await fetch(action.key);
				if (url.status === 404) {
					notfound = true;
				}
				loaded = true;
			}
		};
	}}
>
	<input type="hidden" name="key" value={exercise.imageKey} />
</form>

<Cell span={3}>
	<Card style="border-radius: 16px; height: 100%;">
		<PrimaryAction
			onclick={() => {
				goto(`/exercises/${exercise.id}`);
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
					<p class="mdc-typography--headline3">
						{exercise.description}
					</p>
					<div class="time">
						{calculateRealTime(exercise.time)}<Icon class="material-icons">timer</Icon>
					</div>
				</div>
			</Content>
		</PrimaryAction>
	</Card>
</Cell>

<style>
	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.time {
		display: flex;
		width: 80px;
		justify-content: space-between;
		align-items: center;
	}
	.subtitle {
		display: flex;
		width: 100%;
		flex-direction: column;
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
