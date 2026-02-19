<script>
	import { onMount } from 'svelte';

	console.log('USERS COMPONENT LOADED');

	let users = $state([]);

	onMount(async () => {
		console.log('onMount firing');
		const res = await fetch('http://127.0.0.1:3001/user/list');
		users = await res.json();
		console.log('users loaded:', users.length);
	});
</script>

<p>Users: {users.length}</p>
{#each users as u}
	<p>{u.email}</p>
{/each}

<style>
	p {
		color: white;
	}
</style>
