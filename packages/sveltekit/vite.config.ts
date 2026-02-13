import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from 'path';

const isLocal = process.env.LOCAL_DEV === 'true';

export default defineConfig({
	server: {
		host: '0.0.0.0',
		port: 3000,
		fs: {
			allow: [
				path.resolve(__dirname, '../..'),
				path.resolve(__dirname, '../../..')
			]
		}
	},
	plugins: [sveltekit()],
	resolve: {
		alias: isLocal
			? { 'sst/node/api': path.resolve(__dirname, 'src/lib/mock-sst-api.ts') }
			: {}
	}
});
