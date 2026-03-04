<script lang="ts">
	import { interaction, pain, difficult } from '$lib/utils/store';
	import Card, { Content, Actions } from '@smui/card';
	import Button from '@smui/button';

	let { type, video, userId, exerciseId }: {
		type: string;
		video: Exercise | undefined;
		userId: string;
		exerciseId: string;
	} = $props();

	let submitting = $state(false);

	let question = $derived(
		type === 'difficult'
			? 'How difficult was this exercise?'
			: 'How much pain or discomfort are you feeling?'
	);

	const DIFFICULTY_BUTTONS = [
		{ label: 'EASY', value: 1, color: '#69B34C' },
		{ label: '2',    value: 2, color: '#ACB334' },
		{ label: '3',    value: 3, color: '#FAB733' },
		{ label: '4',    value: 4, color: '#FF8E15' },
		{ label: '5',    value: 5, color: '#FF4E11' },
		{ label: 'HARD', value: 6, color: '#FF0D0D' },
	];

	const PAIN_BUTTONS = [
		{ label: 'NONE',   value: 1, color: '#69B34C' },
		{ label: '2',      value: 2, color: '#ACB334' },
		{ label: '3',      value: 3, color: '#FAB733' },
		{ label: '4',      value: 4, color: '#FF8E15' },
		{ label: '5',      value: 5, color: '#FF4E11' },
		{ label: 'SEVERE', value: 6, color: '#FF0D0D' },
	];

	const buttons = $derived(type === 'difficult' ? DIFFICULTY_BUTTONS : PAIN_BUTTONS);

	function selectRating(rating: number) {
		if (submitting) return;
		submitting = true;

		// Show the message FIRST — before clearing pain/difficult flags.
		// Svelte 5 fine-grained reactivity can unmount this component
		// synchronously once pain.current / difficult.current become false,
		// so we must set interaction.current while the component is still live.
		showPostRatingMessage(rating);

		// Background save — fire and forget, JSON body avoids FormData
		// multipart parsing issues with SvelteKit form actions.
		fetch('/api/rating', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				userId,
				exerciseId,
				type,
				rating,
				timestamp: new Date().toISOString()
			})
		}).catch(() => {});
	}

	function showPostRatingMessage(rating: number) {
		if (type === 'pain') {
			// PAIN THRESHOLD: currently set to 3. Review with clinicians before deployment.
			if (rating <= 3) {
				interaction.current = [
					{
						closeIcon: false,
						message: "Thank you, we've noted that. Please take it easy.",
						stayOn: false,
						buttons: []
					}
				];
				setTimeout(() => {
					if (interaction.current && interaction.current[0]?.stayOn === false) {
						interaction.current = null;
					}
				}, 5000);
			} else {
				interaction.current = [
					{
						closeIcon: false,
						message:
							'Please stop exercising if you are in pain. Contact your clinician or call 000 in an emergency.',
						stayOn: true,
						buttons: [{ title: 'I understand', result: 'dismiss' }]
					}
				];
			}
		}
		// For difficulty: no message — gauge just disappears

		// Clear the flags AFTER setting interaction.current so the store write
		// completes before Svelte unmounts this component.
		pain.current = false;
		difficult.current = false;
	}
</script>

<Card style="border-radius: 16px;">
	<Content>
		<h2 class="mdc-typography--headline6">
			{type === 'difficult' ? 'Complexity' : 'Pain'}
		</h2>
		<p>{question}</p>
	</Content>
	<Actions fullBleed>
		{#each buttons as btn}
			<Button
				style="background: {btn.color}; color: white;"
				disabled={submitting}
				onclick={() => selectRating(btn.value)}
			>{btn.label}</Button>
		{/each}
	</Actions>
</Card>
<div class="spacer"></div>

<style>
	.spacer {
		display: flex;
		padding: 1em;
	}
</style>
