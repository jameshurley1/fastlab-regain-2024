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
	<Card>
		<Content>
			<h2>Welcome to Regain</h2>
			<p class="email">{data.user?.email}</p>
			<p>Below are your assigned exercises</p>
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

	h2 {
		margin: 0 0 0.5rem;
	}

	.email {
		font-weight: bold;
		margin: 0 0 0.75rem;
	}
</style>
