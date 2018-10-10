module.exports = {
  'env': {
    'browser': true
  },
  'extends': 'eslint:recommended',
  'globals': {
    'AFRAME': false,
    'THREE': false,
  },
  'parserOptions': {
    'ecmaVersion': 6
  },
  'rules': {
    'indent': [ 'warn', 2 ],
    'linebreak-style': [ 'warn', 'unix' ],
    'no-console': ['warn'],
    'no-empty': ['warn'],
    'no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
    'quotes': [ 'warn', 'single' ],
    'semi': [ 'warn', 'always' ]
  }
};
