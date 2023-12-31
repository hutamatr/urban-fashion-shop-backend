module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  plugins: ['@typescript-eslint', 'simple-import-sort', 'unused-imports'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  rules: {
    'no-unused-vars': [1, { args: 'after-used', argsIgnorePattern: '^_' }],
    'no-console': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'off',

    //#region  //*=========== Unused Import ===========
    '@typescript-eslint/no-unused-vars': 'on',
    'unused-imports/no-unused-imports': 'warn',
    'unused-imports/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
      },
    ],

    //#region  //*=========== Sort Import ===========
    'simple-import-sort/exports': 'warn',
    'simple-import-sort/imports': [
      'warn',
      {
        groups: [
          // Side effect imports.
          ['^\\u0000'],

          // Packages.
          // Things that start with a letter (or digit or underscore), or `@` followed by a letter.
          ['^@?\\w'],

          // controllers
          ['^@controllers'],

          // models
          ['^@models'],

          // routes
          ['^@routes', '^@api'],

          // utils
          ['^@utils', '^@db'],

          // Other imports
          ['^@public'],

          // relative paths up until 3 level
          [
            '^\\./?$',
            '^\\.(?!/?$)',
            '^\\.\\./?$',
            '^\\.\\.(?!/?$)',
            '^\\.\\./\\.\\./?$',
            '^\\.\\./\\.\\.(?!/?$)',
            '^\\.\\./\\.\\./\\.\\./?$',
            '^\\.\\./\\.\\./\\.\\.(?!/?$)',
          ],

          ['^types'],
          ['^'],
        ],
      },
    ],
  },
  overrides: [
    {
      env: {
        node: true,
      },
      files: ['.eslintrc.{js,cjs}'],
      parserOptions: {
        sourceType: 'script',
      },
    },
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
};
