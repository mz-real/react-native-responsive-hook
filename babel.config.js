// Targets the running Node version so `const`/`let` are left intact.
// This matters: transpiling them to `var` would mask temporal-dead-zone
// bugs that Hermes (React Native's default engine) surfaces at runtime.
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-typescript',
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
};
