import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
        // Consult https://svelte.dev/docs/kit/integrations
        // for more information about preprocessors
        preprocess: vitePreprocess(),

        kit: {
                adapter: adapter({
                        // GitHub Pages serves 404.html for SPA routes; 200.html is ignored.
                        fallback: '404.html'
                }),
                // With a custom domain your base is just '/'.
                paths: { base: '', relative: false },

                // Ensure SvelteKit writes actual HTML files (index.html, etc.)
                prerender: {
                        entries: ['*']
                }
        }
};

export default config;
