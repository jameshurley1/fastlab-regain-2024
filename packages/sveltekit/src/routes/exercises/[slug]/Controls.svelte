<script lang="ts">
	import Card, { Actions } from '@smui/card';
	import IconButton from '@smui/icon-button';

  let { videoElement = $bindable() }: { videoElement: HTMLVideoElement | undefined } = $props();

  // Listen for state changes
  let isPaused = $derived.by(() => {
    console.log('state change detected', {videoElement});

    return videoElement?.paused;
  });


</script>
