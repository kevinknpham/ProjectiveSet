module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    node: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'no-param-reassign': 'off',
    'no-return-assign': 'off',
    'no-restricted-syntax': 'off',
    'no-use-before-define': ['error', {
      functions: false,
      classes: true,
      variables: true,
    }],
    'no-console': 'off',
  },
};
