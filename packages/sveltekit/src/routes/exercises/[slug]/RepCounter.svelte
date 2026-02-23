<script lang="ts">
	import { enhance } from '$app/forms';
	import Card, { Content, Actions } from '@smui/card';
	import Button, { Label } from '@smui/button';
	import IconButton from '@smui/icon-button';

	let {
		exerciseId,
		targetReps = 10,
		defaultReps = 0,
		videoCompleted = false
	}: {
		exerciseId: string;
		targetReps?: number;
		defaultReps?: number;
		videoCompleted?: boolean;
	} = $props();

	let reps = $state(defaultReps);
	let submitted = $state(false);
	let submitting = $state(false);

	function decrement() {
		if (reps > 0) reps -= 1;
	}

	function increment() {
		reps += 1;
	}

	function handleInput(e: Event) {
		const val = parseInt((e.target as HTMLInputElement).value, 10);
		if (!isNaN(val) && val >= 0) reps = val;
	}
</script>

<Card style="border-radius: 16px;">
	<Content>
		<h4 class="counter-label">Reps completed</h4>
		<div class="counter-row">
			<IconButton
				class="material-icons counter-btn"
				onclick={decrement}
				style="font-size: 2rem; width: 64px; height: 64px;"
			>
				remove
			</IconButton>
			<input
				class="rep-input"
				type="number"
				min="0"
				value={reps}
				oninput={handleInput}
				aria-label="Reps completed"
			/>
			<IconButton
				class="material-icons counter-btn"
				onclick={increment}
				style="font-size: 2rem; width: 64px; height: 64px;"
			>
				add
			</IconButton>
		</div>
		{#if targetReps > 0}
			<p class="target-hint">Target: {targetReps} reps</p>
		{/if}
	</Content>
	<Actions>
		{#if submitted}
			<p class="submitted-msg">
				<i class="material-icons" style="vertical-align: middle;">check_circle</i>
				Saved!
			</p>
		{:else}
			<form
				method="POST"
				action="?/submitReps"
				use:enhance={({ cancel }) => {
					if (submitting) { cancel(); return; }
					submitting = true;
					return async ({ result }: { result: any }) => {
						submitting = false;
						if (result.type === 'success' || result.status === 200) {
							submitted = true;
						}
					};
				}}
			>
				<input type="hidden" name="exerciseId" value={exerciseId} />
				<input type="hidden" name="repsCompleted" value={reps} />
				<input type="hidden" name="videoCompleted" value={videoCompleted ? 'true' : 'false'} />
				<Button type="submit" variant="raised" disabled={submitting} style="width: 100%;">
					<Label>{submitting ? 'Saving…' : 'Submit reps'}</Label>
				</Button>
			</form>
		{/if}
	</Actions>
</Card>

<style>
	.counter-label {
		margin: 0 0 0.75rem 0;
		font-size: 1rem;
		font-weight: 600;
		text-align: center;
	}
	.counter-row {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}
	.rep-input {
		width: 80px;
		height: 64px;
		font-size: 2rem;
		text-align: center;
		border: 2px solid #ccc;
		border-radius: 8px;
		/* remove spinner arrows */
		-moz-appearance: textfield;
	}
	.rep-input::-webkit-inner-spin-button,
	.rep-input::-webkit-outer-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
	.target-hint {
		margin: 0.5rem 0 0 0;
		font-size: 0.85rem;
		color: #666;
		text-align: center;
	}
	.submitted-msg {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.5rem 1rem;
		color: #4caf50;
		font-weight: 600;
	}
	form {
		width: 100%;
		padding: 0 0.5rem 0.5rem;
	}
</style>
