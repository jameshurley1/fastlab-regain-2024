<script lang="ts">
	import { user } from '$lib/utils/store';
	import Card, { Content } from '@smui/card';
	import Button from '@smui/button';
	import { goto } from '$app/navigation';

	let { data }: { data: any } = $props();

	$effect(() => {
		user.current = data.user;
	});
</script>

<div class="wrapper">
	<Card class="welcome-card">
		<Content>
			<h2>Welcome to Regain</h2>
			<p class="email">{data.user?.email}</p>
			<p>Click below to go to your assigned exercises</p>
			<Button variant="raised" onclick={() => goto('/exercises')}>Let's Go!</Button>
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

	:global(.welcome-card) {
		min-width: 560px;
		padding: 2rem;
	}

	:global(.welcome-card .mdc-card__content) {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
		padding: 2rem !important;
	}

	h2 {
		font-size: 2.5rem;
		margin: 0;
	}

	.email {
		font-size: 1.4rem;
		font-weight: bold;
		margin: 0;
	}

	p:not(.email) {
		font-size: 1.25rem;
		margin: 0;
	}

	:global(.welcome-card .mdc-button) {
		transform: scale(1.5);
		transform-origin: center;
		margin-top: 0.75rem;
		margin-bottom: 0.75rem;
	}
</style>
