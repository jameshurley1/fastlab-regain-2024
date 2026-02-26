<script lang="ts">
	import { isPaused, isHalfway } from '$lib/utils/store';

	let time: number = $state(0);
	let duration: number = $state(0);
	let paused: boolean = $state(false);
	let hasPlayed: boolean = $state(false);
	let halfwayFired: boolean = false;
	$effect(() => {
		if (!paused) hasPlayed = true;
	});

	$effect(() => {
		if (time > duration / 2 && !halfwayFired) {
			halfwayFired = true;
			isHalfway.current = true;
		}
		const newIsPaused = paused && hasPlayed && !videoElement?.ended;
		if (isPaused.current !== newIsPaused) isPaused.current = newIsPaused;
	});

	let {
		videoElement = $bindable(),
		src,
		width,
		height,
		autoplay
	}: {
		videoElement: HTMLVideoElement | undefined;
		src: string;
		width: string;
		height: string;
		autoplay: boolean;
	} = $props();
</script>

<div class="container">
	<div class="playback-animation">
		<svg class="playback-icons">
			<use class="hidden" href="#play-icon" />
			<use href="#pause" />
		</svg>
	</div>

	<video
		bind:this={videoElement}
		ontimeupdate={() => { time = videoElement?.currentTime ?? 0; }}
		ondurationchange={() => { duration = videoElement?.duration ?? 0; }}
		bind:paused
		{src}
		{autoplay}
		{width}
		{height}
		controls={true}
		muted
	>
		<track kind="captions" />
	</video>
</div>

<style>
	.container {
		width: 100%;
		height: 100%;
		display: flex;
		border-radius: 16px;
		justify-content: center;
		align-items: center;
	}
	video {
		border-radius: 16px;
	}
	.playback-animation {
		pointer-events: none;
		position: absolute;
		top: 50%;
		left: 50%;
		margin-left: -40px;
		margin-top: -40px;
		width: 80px;
		height: 80px;
		border-radius: 80px;
		background-color: rgba(0, 0, 0, 0.6);
		display: flex;
		justify-content: center;
		align-items: center;
		opacity: 0;
	}
</style>
