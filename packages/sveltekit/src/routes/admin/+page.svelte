<script lang="ts">
	import Drawer, { AppContent, Content, Header, Title, Subtitle } from '@smui/drawer';
	import Button, { Label } from '@smui/button';
	import List, { Item, Text } from '@smui/list';
	import Exercises from './Exercises.svelte';
	import Groups from './Groups.svelte';
	import Users from './Users.svelte';

	let open = $state(true);
	let active = $state('Users');

	function setActive(value: string) {
		active = value;
	}
</script>

<div class="wrapper">
	<Drawer variant="dismissible" bind:open>
		<Header>
			<Title>Regain Administration</Title>
			<Subtitle>Doctor & Researcher platform</Subtitle>
		</Header>
		<Content>
			<List>
				<Item
					href="javascript:void(0)"
					onclick={() => setActive('Users')}
					activated={active === 'Users'}
				>
					<Text>Users</Text>
				</Item>
				<Item
					href="javascript:void(0)"
					onclick={() => setActive('Exercises')}
					activated={active === 'Exercises'}
				>
					<Text>Exercises</Text>
				</Item>
				<Item
					href="javascript:void(0)"
					onclick={() => setActive('Groups')}
					activated={active === 'Groups'}
				>
					<Text>Groups</Text>
				</Item>
			</List>
		</Content>
	</Drawer>

	<AppContent class="app-content">
		<main class="main-content">
			<Button onclick={() => (open = !open)}
				><Label>
					{open ? 'Close' : 'Open'} Drawer
				</Label></Button
			>
			{#if active === 'Users'}
				<Users />
			{/if}
			{#if active === 'Exercises'}
				<Exercises />
			{/if}
			{#if active === 'Groups'}
				<Groups />
			{/if}
		</main>
	</AppContent>
</div>

<style>
	.wrapper {
		display: flex;
		position: relative;
		height: 100%;
		background: rgba(255, 255, 255, 0.1);
		z-index: 0;
	}
	.main-content {
		display: block;
		position: relative;
		flex-direction: column;
		padding: 1em;
	}
</style>
