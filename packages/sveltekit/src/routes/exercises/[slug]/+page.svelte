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

	let { data }: { data: PageData } = $props();

	$effect(() => {
		if (videoElement) {
			videoElement.addEventListener('ended', () => { videoCompleted = true; });
		}
	});
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
