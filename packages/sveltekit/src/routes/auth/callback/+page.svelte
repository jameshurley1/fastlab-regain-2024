<script lang="ts">
	import { user } from '$lib/utils/store';
	import Card, { Content } from '@smui/card';
	import Button from '@smui/button';
	import { goto } from '$app/navigation';

	let form: HTMLFormElement;

	$effect(() => {
		user.current = data.user;
	});

	const redirect = () => {
		if (form) form.requestSubmit();
	};

	setTimeout(redirect, 10000);

	let { data }: { data: any } = $props();
</script>

<div class="wrapper">
	<Card>
		<Content>
			<h5>Successfully Logged in...</h5>
			<form bind:this={form} class="form" method="POST" action="?/redirect">
				{#if !user.current.onboard}
					<input hidden name="location" value="/settings" />
					<p>Looks like this is your first time using Regain.</p>
					<p>You will be redirected to the onboarding process.</p>
					<p>Wait 10 seconds to be automatically redirected, or click next to skip.</p>
					<Button variant="raised" onclick={() => goto('/settings')}>Next</Button>
				{:else}
					<input hidden name="location" value="/" />
					<p>Looks like you've been using Regain before.</p>
					<p>You will be redirected to your regular scheduled exercises.</p>
					<p>Wait 10 seconds to be automatically redirected, or click next to skip.</p>
					<Button variant="raised" onclick={() => goto('/')}>Next</Button>
				{/if}
			</form>
		</Content>
	</Card>
</div>

<style>
	.wrapper {
		display: flex;
		position: relative;
		justify-content: center;
		align-items: center;
		height: 100%;
		background: rgba(255, 255, 255, 0.1);
		width: 100vw;
		z-index: 0;
	}
</style>
