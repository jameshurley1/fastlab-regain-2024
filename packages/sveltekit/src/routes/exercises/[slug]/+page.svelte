<script lang="ts">
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	import LayoutGrid, { Cell } from '@smui/layout-grid';
	import Card, { Content, Actions } from '@smui/card';
	import Button, { Label } from '@smui/button';

	import { difficult, pain } from '$lib/utils/store';
	import { lazyLoad } from '$lib/utils/lazyload';
	import { calculateRealTime } from '$lib/utils/calculateRealTime';
	import Video from '$lib/components/Video.svelte';

	import Messages from './Messages.svelte';
	import Controls from './Controls.svelte';
	import Guage from './Guage.svelte';
	import RepCounter from './RepCounter.svelte';

	let loaded: boolean = $state(false);
	let notfound: boolean = $state(false);
	let submitting: boolean = $state(false);
	let form: HTMLFormElement | undefined = $state();
	let videoElement: HTMLVideoElement | undefined = $state();
	let action: { success: boolean; key: string } = $state({ success: false, key: '' });
	let videoCompleted: boolean = $state(false);
	let showPostVideoButtons: boolean = $state(false);
	let playCount: number = $state(0);
	let reps: number = $state(0);

	let { data }: { data: PageData } = $props();

	$effect(() => {
		if (videoElement) {
			videoElement.addEventListener('ended', () => {
				playCount += 1;
				reps += 1;
				videoCompleted = true;
				showPostVideoButtons = true;
			});
		}
	});

	function playAgain() {
		if (!videoElement) return;
		videoCompleted = false;
		showPostVideoButtons = false;
		videoElement.currentTime = 0;
		videoElement.play();
	}

	function finishedForNow() {
		showPostVideoButtons = false;
	}
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
	<input type="hidden" name="key" value={data?.exercises?.videoKey} />
</form>

<div class="exercise">
	<LayoutGrid>
		<Cell span={8}>
			<div class="video-wrapper">
				<div
					use:lazyLoad
					onisVisible={() => {
						form?.requestSubmit();
					}}
				>
					{#if action.success === true && notfound === false}
						<Video bind:videoElement src={action.key} width="100%" height="100%" autoplay />
					{:else if notfound || loaded}
						<div class="placeholder">
							<i class="material-icons" style="font-size: 64px;">videocam_off</i>
							<p>Video not available locally</p>
							<p class="hint">Place video files in local-api/files/ to view them</p>
						</div>
					{:else}
						<div class="loader"></div>
					{/if}
				</div>
				{#if showPostVideoButtons}
					<div class="post-video-overlay">
						<button class="post-video-btn post-video-btn--replay" onclick={playAgain}>
							<i class="material-icons">replay</i> Play Again
						</button>
						<button class="post-video-btn post-video-btn--done" onclick={finishedForNow}>
							<i class="material-icons">check</i> Finished for now
						</button>
					</div>
				{/if}
			</div>
		</Cell>
		<Cell span={4}>
			<Card style="border-radius: 16px;">
				<Content>
					<h3 class="mdc-typography--headline6">
						{data?.exercises?.title}
						{calculateRealTime(data?.exercises?.time)}
					</h3>
					<p>{data?.exercises?.description}</p>
				</Content>
				<Actions fullBleed>
					<Button onclick={() => goto(`/exercises`)}>
						<i class="material-icons" aria-hidden="true">arrow_backward</i>
						<Label>Return to the video selection screen</Label>
					</Button>
				</Actions>
			</Card>
			<div class="guage">
				<Controls {videoElement} />
			</div>
			{#if difficult.current || pain.current}
				<div class="guage">
					<Guage video={data?.exercises} type={pain.current ? 'pain' : 'difficult'} />
				</div>
			{/if}
			<div class="guage">
				<RepCounter
					exerciseId={data?.exercises?.id}
					targetReps={data?.targetReps ?? 10}
					bind:reps
					{videoCompleted}
				/>
			</div>
		</Cell>
	</LayoutGrid>
	<Messages />
</div>

<style>
	.exercise {
		display: flex;
		position: relative;
		flex-direction: column;
		align-items: center;
		height: 100%;
		background: rgba(255, 255, 255, 0.1);
		z-index: 0;
	}
	.guage {
		margin-top: 1em;
	}
	.video-wrapper {
		position: relative;
	}
	.post-video-overlay {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		background: rgba(0, 0, 0, 0.6);
		border-radius: 16px;
	}
	.post-video-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.75rem 2rem;
		min-width: 200px;
		border-radius: 8px;
		border: none;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
	}
	.post-video-btn--replay {
		background: white;
		color: #333;
	}
	.post-video-btn--done {
		background: #69b34c;
		color: white;
	}
	.placeholder {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		min-height: 400px;
		background-color: hsl(0, 0%, 92%);
		border-radius: 16px;
		color: hsl(0, 0%, 45%);
	}
	.placeholder .hint {
		font-size: 0.8rem;
		opacity: 0.7;
	}
	.loader {
		display: flex;
		position: relative;
		width: 100%;
		min-height: 400px;
		animation: pulse 2s infinite;
		border-radius: 16px;
		justify-content: center;
		align-items: center;
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
