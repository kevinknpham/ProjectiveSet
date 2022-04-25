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
    'no-use-before-define': 'off',
    'no-param-reassign': 'off',
    'no-return-assign': 'off',
    'no-restricted-syntax': 'off',
  },
};
