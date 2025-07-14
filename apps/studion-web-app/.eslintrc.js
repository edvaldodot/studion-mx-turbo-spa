require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  extends: [
    'plugin:vue/essential',
    'plugin:vue/recommended',
    'eslint:recommended',
    '@vue/eslint-config-prettier',
  ],
  env: {
    browser: true,
    node: true,
    es6: true,
    jest: true,
  },
  rules: {
    'vue/no-mutating-props': 'warn',
  },
}