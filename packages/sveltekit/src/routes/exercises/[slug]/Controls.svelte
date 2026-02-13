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

<Card style="border-radius: 16px;">
  <Actions>
    <div class="spacer">
      <IconButton style="background: gray" onclick={() => { if (videoElement) videoElement.currentTime = 0 }} class="material-icons">reply_all</IconButton>
    </div>
    {#if isPaused}
      <div class="spacer">
        <IconButton style="background: gray" onclick={() => { if (videoElement) videoElement?.play() }} class="material-icons">play_arrow</IconButton>
      </div>
    {:else}
      <div class="spacer">
        <IconButton style="background: #69B34C" onclick={() => { if (videoElement) videoElement?.pause() }} class="material-icons">pause</IconButton>
      </div>
    {/if}
  </Actions>
</Card>

<style>
	.spacer {
		display: flex;
		padding: 1em;
	}
</style>
