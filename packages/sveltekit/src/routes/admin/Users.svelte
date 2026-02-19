<script>
	import { onMount } from 'svelte';

	let users = $state([]);

	onMount(async () => {
		const res = await fetch('http://127.0.0.1:3001/user/list');
		users = await res.json();
	});
</script>

<p style="color: white">Users: {users.length}</p>
{#each users as u}
	<p style="color: white">{u.email}</p>
{/each}
