export default {
	resolve: {
		alias: {
		  three: 'node_modules/three/build/three.module.js',
		},
	  },
	root: 'src/',
	publicDir: '../public/',
	base: './',
	build:
	{
		outDir: '../dist',
		emptyOutDir: true,
		sourcemap: true
	}
}
