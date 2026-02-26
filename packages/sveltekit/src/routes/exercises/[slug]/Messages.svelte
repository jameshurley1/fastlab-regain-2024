<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { untrack } from 'svelte';
	import { goto } from '$app/navigation';
	import { isEmpty } from '$lib/utils/isEmpty';
	import IconButton from '@smui/icon-button';
	import Button from '@smui/button';

	import { interaction, pain, difficult, isHalfway, isCompleted, isPaused } from '$lib/utils/store';

	// Clear stale session state so persisted values from a previous exercise
	// page visit don't trigger messages immediately on load. Runs synchronously
	// before any $effect callbacks.
	isPaused.current = false;
	isCompleted.current = false;
	isHalfway.current = false;
	interaction.current = null;

	const addPauseMessage = () => {
		interaction.current = [
			{
				closeIcon: false,
				message:
					'Did you pause this video to catch up, or is Regain causing you discomfort or pain?',
				stayOn: true,
				buttons: [
					{
						title: 'Technical issues',
						result: 'technical'
					},
					{
						title: 'Just Catching Up',
						result: 'catchup'
					},
					{
						title: 'Difficulty',
						result: 'difficult'
					},
					{
						title: 'Pain',
						result: 'pain'
					}
				]
			}
		];
	};

	const addTechnicalMessage = () => {
		interaction.current = [
			{
				closeIcon: false,
				message:
					'We understand, technical issues can be frustrating. Please go to the help page and report the issue.',
				stayOn: false,
				buttons: [
					{
						title: 'Help',
						result: 'help'
					}
				]
			}
		];
	};

	const addContinueMessage = () => {
		interaction.current = [
			{
				closeIcon: false,
				message: "You're doing well... carry on",
				stayOn: false,
				buttons: []
			}
		];
	};

	const addComplimentMessage = (type: string) => {
		interaction.current = [
			{
				closeIcon: false,
				message: 'Tell us how much ' + type + " on the meter above, you'll be yourself in no time.",
				stayOn: false,
				buttons: []
			}
		];
	};

	const addHalfwayMessage = () => {
		interaction.current = [
			{
				closeIcon: false,
				message: "You're half way there, continue doing this exercise for as long as you like!",
				stayOn: false,
				buttons: []
			}
		];
		untrack(() => { isHalfway.current = false; });
	};

	let handleResult = (e: string) => {
		if (e === 'help') {
			interaction.current = null;
			goto('/help');
		} else if (e === 'technical') {
			interaction.current = null;
			addTechnicalMessage();
		} else if (e === 'catchup') {
			interaction.current = null;
			addContinueMessage();
		} else if (e === 'pain') {
			interaction.current = null;
			pain.current = true;
			addComplimentMessage('pain');
		} else if (e === 'difficult') {
			interaction.current = null;
			difficult.current = true;
			addComplimentMessage('difficulty');
		}
	};

	const addCompletedMessage = () => {
		interaction.current = [
			{
				closeIcon: false,
				message: "You did it... You completed an exercise, check out how far you've come!",
				stayOn: false,
				buttons: []
			}
		];

		isCompleted.current = false;
	};

	const handleRemoveMessage = () => {
		interaction.current = null;
	};

	const handleMessageTimeout = () => {
		setTimeout(() => {
			if (interaction?.current) {
				if (interaction?.current[0]?.stayOn === false) {
					interaction.current = null;
				}
			}
		}, 5000);
	};

	$effect(() => {
		isHalfway.current && addHalfwayMessage();
		isPaused.current && addPauseMessage();
		isCompleted.current && addCompletedMessage();
		handleMessageTimeout();
	});
</script>

<div class="information-area" in:fly={{ y: 200, duration: 2000 }} out:fade>
	{#if interaction.current}
		{#each interaction.current as message}
			<div class="information">
				<div class="message">
					{#if message.closeIcon}
						<IconButton
							style="padding: 0; margin: 0;"
							class="material-icons"
							onclick={handleRemoveMessage}>remove_circle</IconButton
						>
					{/if}
					<statement>{message.message}</statement>
					{#if message.buttons && !isEmpty(message.buttons)}
						{#each message.buttons as button}
							<div class="button">
								<Button variant="raised" onclick={() => handleResult(button.result)}
									>{button.title}</Button
								>
							</div>
						{/each}
					{/if}
				</div>
			</div>
		{/each}
	{/if}
</div>

<style>
	.information-area {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	.information {
		display: flex;
		flex-direction: row;
		height: 90px;
		align-items: center;
		padding: 1rem;
		justify-content: space-between;
		background: #ffffff;
		border: 3px solid #dadada;
		box-sizing: border-box;
		border-radius: 25px;
	}
	.message {
		display: flex;
		flex-direction: row;
		align-items: center;
		font-family: 'Roboto', sans-serif;
		font-size: 18px;
		font-weight: 700;
		line-height: 26px;
		color: #132a13;
	}
	.button {
		margin-left: 1rem;
	}
</style>
