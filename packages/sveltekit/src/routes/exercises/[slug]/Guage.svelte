<script lang="ts">
	import { difficult, pain } from '$lib/utils/store';
	import Card, { Content, Actions } from '@smui/card';
	import Button from '@smui/button';

	let question: string = $state('');
	let header: string = $state('');

	const handleDifficult = (guage: number) => {
		if (type === 'difficult') {
			// Save the gauge value with the video to a user Stat
			console.log('Difficulty rating:', guage, 'for video:', video?.title);
			difficult.current = false;
		}	else {
			// Save the gauge value with the video to a user Stat
			console.log('Pain rating:', guage, 'for video:', video?.title);
			pain.current = false;
		}
	};

	$effect(() => {
		if (type === 'difficult') {
			question = 'hard';
			header = "Complexity";
		}	else {
			question = 'painful';
			header = "Pain";
		}
	})

	let { type, video }: { type: string; video: Exercise | undefined } = $props();
</script>

<Card style="border-radius: 16px;">
	<Content>
		<h2 class="mdc-typography--headline6">{header}</h2>
		<p>How {question} was it to perform this task today?</p>
	</Content>
	<Actions fullBleed>
		<Button style="background: #69B34C; color: white;" onclick={() => handleDifficult(1)}>Easy</Button>
		<Button style="background: #ACB334; color: white;" onclick={() => handleDifficult(2)}>2</Button>
		<Button style="background: #FAB733; color: white;" onclick={() => handleDifficult(3)}>3</Button>
		<Button style="background: #FF8E15; color: white;" onclick={() => handleDifficult(4)}>4</Button>
		<Button style="background: #FF4E11; color: white;" onclick={() => handleDifficult(5)}>5</Button>
		<Button style="background: #FF0D0D; color: white;" onclick={() => handleDifficult(6)}>Hard</Button>
	</Actions>
</Card>
<div class="spacer"></div>

<style>
	.spacer {
		display: flex;
		padding: 1em;
	}
</style>
