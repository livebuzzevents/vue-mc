import { createRequire } from 'module';
import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

const require = createRequire(import.meta.url);
const pkg = require('./package.json');

const BASE = {
    external: ["lodash", "vue", "axios"],
    plugins: [
        resolve(),
        commonjs(),
        babel({
            exclude: ['node_modules/**/*'],
            babelHelpers: 'bundled',
            babelrc: false,
            presets: [["@babel/preset-env", {modules: false}]],
        }),
    ],
};

const MAIN = {
    ...BASE,
    input: "src/index.js",
    output: [
        { file: pkg.main, format: "cjs" },
        { file: pkg.module, format: "es" },
    ],
};

const VALIDATION = {
    ...BASE,
    input: "src/Validation/index.js",
    output: [{ file: "validation/index.js", format: "es" }],
};

const LOCALES = {
    ...BASE,
    input: "./src/Validation/locale.js",
    output: [{ file: "validation/locale.js", format: "es" }],
};

export default [MAIN, VALIDATION, LOCALES];
