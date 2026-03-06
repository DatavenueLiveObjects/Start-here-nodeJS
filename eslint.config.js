/**
 * ESLint configuration for the project
 * Modern flat config format (ESLint 9+)
 */

module.exports = [
    {
        languageOptions: {
            ecmaVersion: 2020,
            sourceType: 'commonjs',
            globals: {
                console: 'readonly',
                process: 'readonly',
                require: 'readonly',
                module: 'readonly',
                exports: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
                Buffer: 'readonly',
                setTimeout: 'readonly',
                setInterval: 'readonly',
                clearTimeout: 'readonly',
                clearInterval: 'readonly',
            }
        },
        rules: {
            'no-unused-vars': ['warn', { 
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_'
            }],
            'no-console': 'off',
            'no-undef': 'error',
            'semi': ['warn', 'always'],
            'quotes': ['warn', 'single', { avoidEscape: true }],
        }
    },
    {
        files: ['samples/**/*.js'],
        rules: {
            'no-unused-vars': 'warn',
        }
    }
];
