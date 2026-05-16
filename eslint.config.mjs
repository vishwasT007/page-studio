import nextVitals from 'eslint-config-next/core-web-vitals'

const config = [
  ...nextVitals.map((config) => {
    if (config.name !== 'next/typescript') return config

    return {
      ...config,
      rules: {
        ...config.rules,
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        '@typescript-eslint/no-explicit-any': 'warn',
      },
    }
  }),
  {
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
]

export default config
