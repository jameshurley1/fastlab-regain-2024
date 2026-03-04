<script lang="ts">
	import { enhance } from '$app/forms';
	import { interaction, pain, difficult } from '$lib/utils/store';
	import Card, { Content, Actions } from '@smui/card';
	import Button from '@smui/button';

	let { type, video, userId, exerciseId }: {
		type: string;
		video: Exercise | undefined;
		userId: string;
		exerciseId: string;
	} = $props();

	let formEl: HTMLFormElement | undefined = $state();
	let selectedRating = $state(0);

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
		selectedRating = rating;
		formEl?.requestSubmit();
	}

	function showPostRatingMessage(rating: number) {
		pain.current = false;
		difficult.current = false;

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
		// For difficulty: dismiss quietly, no message
	}
</script>

<form
	bind:this={formEl}
	method="POST"
	action="?/submitRating"
	use:enhance={() => {
		return async ({ result }: { result: any }) => {
			showPostRatingMessage(selectedRating);
		};
	}}
>
	<input type="hidden" name="userId" value={userId} />
	<input type="hidden" name="exerciseId" value={exerciseId} />
	<input type="hidden" name="type" value={type} />
	<input type="hidden" name="rating" value={selectedRating} />

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
					onclick={() => selectRating(btn.value)}
				>{btn.label}</Button>
			{/each}
		</Actions>
	</Card>
</form>
<div class="spacer"></div>

<style>
	.spacer {
		display: flex;
		padding: 1em;
	}
</style>
