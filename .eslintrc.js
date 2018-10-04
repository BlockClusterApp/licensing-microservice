module.exports = {
  extends: 'airbnb-base',
  plugins: ['promise'],
  env: {
    node: true,
    es6: true,
  },
  rules: {
    'no-underscore-dangle': 0,
    'no-param-reassign': 0,
    'max-len': 0,
    'arrow-parens': 0,
    'comma-dangle': 0,
  },
};
