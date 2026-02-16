<script lang="ts">
	import { isPaused, isHalfway, isCompleted } from '$lib/utils/store';

	let time: number = $state(0);
	let duration: number = $state(0);
	let paused: boolean = $state(false);
	let showControls: boolean = $state(true);
	let showControlsTimeout: ReturnType<typeof setTimeout> | undefined;
	let lastMouseDown: Date | undefined;

	function formatTime(seconds: number): string {
		if (isNaN(seconds)) return '0:00';
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}

	const resetControlsTimer = () => {
		showControls = true;
		clearTimeout(showControlsTimeout);
		showControlsTimeout = setTimeout(() => (showControls = false), 4000);
	};

	const handleContainerMove = (e: MouseEvent | TouchEvent) => {
		resetControlsTimer();
	};

	const handleMove = (e: any) => {
		resetControlsTimer();

		if (!duration) return;
		if (e.type !== 'touchmove' && !(e.buttons & 1)) return;

		const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
		const rect = videoElement?.getBoundingClientRect();
		if (rect) {
			const { left, right } = rect;
			time = (duration * (clientX - left)) / (right - left);
		}
	};

	// we can't rely on the built-in click event, because it fires
	// after a drag — we have to listen for clicks ourselves
	const handleMousedown = () => {
		lastMouseDown = new Date();
	};

	const handleMouseup = (e: any) => {
		isPaused.current = false;
		let date = new Date();
		if ((date as any) - (lastMouseDown as any) < 300) {
			if (paused) e.target.play();
			else e.target.pause();
		}
	};

	const handleTimelineClick = (e: MouseEvent) => {
		const bar = e.currentTarget as HTMLElement;
		const rect = bar.getBoundingClientRect();
		const fraction = (e.clientX - rect.left) / rect.width;
		time = duration * Math.max(0, Math.min(1, fraction));
	};

	const togglePlay = () => {
		if (!videoElement) return;
		if (paused) videoElement.play();
		else videoElement.pause();
	};

	$effect(() => {
		if (time > duration / 2) {
			isHalfway.current = true;
		}
		if (Math.round(time) == Math.round(duration)) {
			isCompleted.current = true;
		}
		paused ? (isPaused.current = true) : (isPaused.current = false);
	});

	let progress = $derived(duration ? (time / duration) * 100 : 0);

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

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="container"
	onmousemove={handleContainerMove}
	ontouchmove={handleContainerMove}
>
	<div class="playback-animation">
		<svg class="playback-icons">
			<use class="hidden" href="#play-icon" />
			<use href="#pause" />
		</svg>
	</div>

	<video
		bind:this={videoElement}
		onmousemove={handleMove}
		ontouchmove={handleMove}
		onmousedown={handleMousedown}
		onmouseup={handleMouseup}
		bind:currentTime={time}
		bind:duration
		bind:paused
		{src}
		{autoplay}
		{width}
		{height}
		controls={false}
		loop
		muted
	>
		<track kind="captions" />
	</video>

	<div class="timeline" class:visible={showControls}>
		<button class="timeline-play-btn" onclick={togglePlay} aria-label={paused ? 'Play' : 'Pause'}>
			{#if paused}
				<svg viewBox="0 0 24 24" width="20" height="20" fill="white">
					<path d="M8 5v14l11-7z"/>
				</svg>
			{:else}
				<svg viewBox="0 0 24 24" width="20" height="20" fill="white">
					<rect x="6" y="4" width="4" height="16"/>
					<rect x="14" y="4" width="4" height="16"/>
				</svg>
			{/if}
		</button>

		<span class="timeline-time">{formatTime(time)}</span>

		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="timeline-bar" onclick={handleTimelineClick}>
			<div class="timeline-bar-fill" style="width: {progress}%"></div>
		</div>

		<span class="timeline-time">{formatTime(duration)}</span>
	</div>
</div>

<style>
	.container {
		width: 100%;
		height: 100%;
		display: flex;
		position: relative;
		border-radius: 16px;
		justify-content: center;
		align-items: center;
	}
	video {
		border-radius: 16px;
		pointer-events: none;
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

	.timeline {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 12px;
		background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
		border-radius: 0 0 16px 16px;
		opacity: 0;
		transition: opacity 0.3s ease;
		pointer-events: none;
	}
	.timeline.visible {
		opacity: 1;
		pointer-events: auto;
	}

	.timeline-play-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border: none;
		background: transparent;
		cursor: pointer;
		padding: 0;
		flex-shrink: 0;
	}
	.timeline-play-btn:hover {
		transform: scale(1.1);
	}

	.timeline-time {
		color: white;
		font-size: 13px;
		font-family: monospace;
		flex-shrink: 0;
		min-width: 36px;
		text-align: center;
		user-select: none;
	}

	.timeline-bar {
		flex: 1;
		height: 4px;
		background: rgba(255, 255, 255, 0.3);
		border-radius: 2px;
		cursor: pointer;
		position: relative;
	}
	.timeline-bar:hover {
		height: 6px;
	}
	.timeline-bar-fill {
		height: 100%;
		background: #69B34C;
		border-radius: 2px;
		transition: width 0.1s linear;
	}
</style>
