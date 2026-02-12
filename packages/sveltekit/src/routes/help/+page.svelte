<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import LayoutGrid, { Cell } from '@smui/layout-grid';
	import Card, { Content } from '@smui/card';
	import Paper, { Title, Subtitle } from '@smui/paper';
	import Textfield from '@smui/textfield';
	import IconButton from '@smui/icon-button';
	import Button from '@smui/button';

	let author: string;
	let newMessage: string;
	let updatingId: string | null = null;
	let helpMessages: HelpMessage[] = [];

	onMount(() => {});

	onDestroy(() => {});

	const handleSubmit = async (e: any) => {
		e.key === 'Enter' && newMessage !== null && submitMessage();
	};

	const handleEdit = async (e: any, message: HelpMessage) => {
		e.key === 'Enter' && newMessage !== null && updateMessage(message);
	};

	// Add the message.
	const submitMessage = async () => {};

	// Update the message.
	const updateMessage = async (message: HelpMessage) => {};

	const deleteMessage = async (id: string) => {};

	const handleReset = () => {};

	const handleUpdating = (id: string) => {
		if (updatingId === null) {
			updatingId = id;
		} else {
			updatingId = null;
		}
	};

	onMount(() => {});
</script>

<div class="wrapper">
	<LayoutGrid>
		<Cell span={4}>
			<Card>
				<Paper>
					<Title>Direct message to developer</Title>
					<Subtitle>EMERGENCY ONLY</Subtitle>
					<Button variant="raised" onclick={handleReset}>RESET APP</Button>
				</Paper>
			</Card>
		</Cell>
		<Cell span={8}>
			<Card>
				<Content>
					<div class="message-scroller">
						{#each helpMessages as message}
							<div class="message">
								<div class="header">
									<div class="staff">
										{#if message.user}
											{message.user.username}
										{:else}
											GUEST
										{/if}
									</div>
									<div class="time">
										{new Date(message.createdAt).toUTCString()}
									</div>
								</div>
								<div class="message-content">
									<div class="message-text">
										{#if updatingId == message.id}
											<Textfield
												style="width: 100%;"
												variant="outlined"
												bind:value={message.content}
												onkeydown={(e) => handleEdit(e, message)}
											/>
										{:else}
											{message.content}
										{/if}
									</div>
									<div class="message-button">
										<IconButton
											style="color: green;"
											class="material-icons"
											onclick={() => handleUpdating(message.id)}>edit</IconButton
										>
										<IconButton
											style="color: red;"
											class="material-icons"
											onclick={() => deleteMessage(message.id)}>delete</IconButton
										>
									</div>
								</div>
							</div>
						{/each}
					</div>
					<div class="message-entry">
						<Textfield
							style="padding-right: 0.2em; width: 100%;"
							variant="outlined"
							bind:value={newMessage}
							onkeydown={(e) => handleSubmit(e)}
						/>
						<Button variant="raised" onclick={() => newMessage !== null && submitMessage()}
							>send</Button
						>
					</div>
				</Content>
			</Card>
		</Cell>
	</LayoutGrid>
</div>

<style>
	.wrapper {
		display: flex;
		position: relative;
		flex-direction: column;
		width: 100%;
		height: 100%;
		background: rgba(255, 255, 255, 0.1);
		z-index: 0;
	}
	.message-scroller {
		display: flex;
		flex-direction: column-reverse;
		overflow: auto;
		max-height: calc(100vh - 206px);
	}
	.message {
		display: flex;
		flex-direction: column;
		padding: 1em;
		margin-top: 1em;
		border: 1px solid black;
		border-radius: 3px;
	}
	.message-entry {
		display: flex;
		flex-direction: row;
		align-items: center;
		margin-top: 1em;
	}
	.message-text {
		display: flex;
		align-items: flex-end;
		width: 100%;
	}
	.message-button {
		display: flex;
		align-items: flex-end;
		flex-direction: row;
	}
	.staff {
		line-height: calc(11px + (14 - 11) * (100vw - 320px) / (1920 - 320));
		font-size: calc(11px + (14 - 11) * (100vw - 320px) / (1920 - 320));
		font-family: monospace;
		font-weight: 200;
	}
	.message-content {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		padding-bottom: 0.2em;
	}
	.time {
		line-height: calc(11px + (14 - 11) * (100vw - 320px) / (1920 - 320));
		font-size: calc(11px + (14 - 11) * (100vw - 320px) / (1920 - 320));
		font-family: monospace;
		font-weight: 200;
	}
</style>
