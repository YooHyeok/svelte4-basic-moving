import { spawn } from 'child_process';
import fs from 'fs';
import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import livereload from 'rollup-plugin-livereload';
import css from 'rollup-plugin-css-only';
import json from '@rollup/plugin-json';

const production = !process.env.ROLLUP_WATCH;
const deploy = process.env.DEPLOY === 'true';
const BASE_URL = deploy ? '/svelte4-basic-moving/' : '/';

// public/index.template.html 을 처리해서 public/index.html 생성
const htmlReplace = () => {
	return {
		name: 'html-replace',
		buildEnd() {
			const template = 'public/index.template.html';
			const outputs = ['public/index.html', 'public/404.html'];
			if (fs.existsSync(template)) {
				const html = fs.readFileSync(template, 'utf8').replace(/__BASE_URL__/g, BASE_URL);
				outputs.forEach((output) => fs.writeFileSync(output, html));
			}
		}
	};
}

function serve() {
	let server;

	function toExit() {
		if (server) server.kill(0);
	}

	return {
		writeBundle() {
			if (server) return;
			server = spawn('npm', ['run', 'start', '--', '--dev'], {
				stdio: ['ignore', 'inherit', 'inherit'],
				shell: true
			});

			process.on('SIGTERM', toExit);
			process.on('exit', toExit);
		}
	};
}

export default {
	input: 'src/main.js',
	output: {
		sourcemap: true,
		format: 'iife',
		name: 'app',
		file: 'public/build/bundle.js'
	},
	plugins: [
		htmlReplace(),
		svelte({
			compilerOptions: {
				// enable run-time checks when not in production
				dev: !production
			}
		}),
		// we'll extract any component CSS out into
		// a separate file - better for performance
		css({ output: 'bundle.css' }),
		json({compact: true}),

		// If you have external dependencies installed from
		// npm, you'll most likely need these plugins. In
		// some cases you'll need additional configuration -
		// consult the documentation for details:
		// https://github.com/rollup/plugins/tree/master/packages/commonjs
		resolve({
			browser: true,
			dedupe: ['svelte'],
			exportConditions: ['svelte']
		}),
		commonjs(),

		// In dev mode, call `npm run start` once
		// the bundle has been generated
		!production && serve(),

		// Watch the `public` directory and refresh the
		// browser on changes when not in production
		!production && livereload('public'),

		// If we're building for production (npm run build
		// instead of npm run dev), minify
		production && terser()
	],
	watch: {
		clearScreen: false
	}
};
