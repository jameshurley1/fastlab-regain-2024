<script lang="ts">
	import Chart, { type ChartItem } from 'chart.js/auto';
	import { onMount } from 'svelte';

	let polarCanvas: ChartItem;

	onMount(() => {
		Chart.defaults.font.size = 16;
		Chart.defaults.font.family = 'Raleway';
		Chart.defaults.font.weight = 'bold';

		new Chart(polarCanvas, {
			type: 'polarArea',
			data: {
				labels: ['Head', 'Shoulders', 'Arms', 'Chest', 'Core/Abdomen', 'Legs'],
				datasets: [
					{
						data: [100, 100, 82, 100, 100, 100],
						backgroundColor: [
							'rgba(186, 59, 54, 1)',
							'rgba(140, 58, 47, 1)',
							'rgba(249, 179, 114, 1)',
							'rgba(216, 121, 77, 1)',
							'rgba(209, 86, 47, 1)',
							'rgba(68, 119, 165, 1)'
						]
					}
				]
			}
		});
	});
</script>

<container>
	<canvas bind:this={polarCanvas} id="polarCanvas"></canvas>
</container>

<style>
	container {
		display: flex;
		position: relative;
		height: 25vw;
		width: 25vw;
	}
</style>
