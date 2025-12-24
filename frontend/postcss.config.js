export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    'postcss-preset-env': {
      stage: 3,
      features: {
        'nesting-rules': true,
        'color-functional-notation': true,
      },
      autoprefixer: {
        flexbox: 'no-2009',
      },
    },
  },
}