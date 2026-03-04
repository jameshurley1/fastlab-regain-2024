<script lang="ts">
	import type { LayoutData } from './$types';
	import Overlay from '$lib/components/Overlay.svelte';
	import Footer from './Footer.svelte';
	import 'sanitize.css';
	import './styles.css';
	import Header from './Header.svelte';

	let { children, data }: { children: any, data: LayoutData } = $props();
</script>

<div class="root app-content">
	<Overlay />
	<Header	authenticated={data.authenticated} />
	<div class="page-content">
		{@render children?.()}
	</div>
	<Footer />
</div>

<style>
	.root {
		min-height: 100%;
		height: 100%;
		background: #132a13;
	}
	.page-content {
		flex: 1;
	}
</style>
