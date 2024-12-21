export default {
    resolve: {
        alias: {
            three: 'node_modules/three/build/three.module.js',
            'three/addons': 'node_modules/three/examples/jsm', // 추가 모듈 경로
        },
    },
    root: 'src/',
    publicDir: '../public/',
    base: '/MyWebsite/', // GitHub Pages에 맞는 경로 설정
    build: {
        outDir: '../docs', // docs 폴더에 빌드 결과 저장
        emptyOutDir: true,
        sourcemap: true,
    },
    optimizeDeps: {
        include: [
            'three',
            'three/examples/jsm/controls/OrbitControls.js',
        ],
    },
};
