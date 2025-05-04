

import adapter from '@sveltejs/adapter-static';

export default {
	kit: {
		adapter: adapter({
			// default options are shown. On some platforms
			// these options are set automatically — see below
			pages: 'build',
			assets: 'build',
			fallback: undefined,
			precompress: false,
			strict: true
		}),
        paths: {
			base: process.argv.includes('dev') ? '' : process.env.BASE_PATH
		}
	}
};
/*
import adapter from '@sveltejs/adapter-static';
import * as dotenv from 'dotenv';
dotenv.config();

const dev = process.argv.includes('dev');

export default {
	kit: {
		adapter: adapter({
			pages: 'docs',
			assets: 'docs',
			fallback: null,
			precompress: false,
			strict: true
		}),
		paths: {
			base: dev ? '' : process.env.BASE_PATH
		},
		
	}
};
*/
