import nx from '@nx/eslint-plugin';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: [
      '**/dist',
      '**/vite.config.*.timestamp*',
      '**/vitest.config.*.timestamp*',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            // --- scope constraints ---
            {
              sourceTag: 'scope:utils',
              onlyDependOnLibsWithTags: [],
            },
            {
              sourceTag: 'scope:config',
              onlyDependOnLibsWithTags: [],
            },
            {
              sourceTag: 'scope:schema-types',
              onlyDependOnLibsWithTags: ['scope:utils'],
            },
            {
              sourceTag: 'scope:design-system-contract',
              onlyDependOnLibsWithTags: ['scope:utils'],
            },
            {
              sourceTag: 'scope:framework-core',
              onlyDependOnLibsWithTags: ['scope:schema-types', 'scope:utils'],
            },
            {
              sourceTag: 'scope:design-system',
              onlyDependOnLibsWithTags: [
                'scope:design-system-contract',
                'scope:schema-types',
                'scope:utils',
              ],
            },
            {
              sourceTag: 'scope:elements',
              onlyDependOnLibsWithTags: [
                'scope:design-system-contract',
                'scope:utils',
              ],
            },
            {
              sourceTag: 'scope:testing-utils',
              onlyDependOnLibsWithTags: ['scope:schema-types', 'scope:utils'],
            },
            {
              sourceTag: 'scope:generators',
              onlyDependOnLibsWithTags: [
                'scope:utils',
                'scope:config',
                'scope:schema-types',
              ],
            },
            {
              sourceTag: 'scope:feature',
              onlyDependOnLibsWithTags: [
                'scope:framework-core',
                'scope:design-system',
                'scope:design-system-contract',
                'scope:schema-types',
                'scope:utils',
              ],
            },
            {
              sourceTag: 'scope:app',
              onlyDependOnLibsWithTags: [
                'scope:framework-core',
                'scope:design-system',
                'scope:design-system-contract',
                'scope:schema-types',
                'scope:utils',
                'scope:elements',
                'scope:config',
              ],
            },
            // --- layer constraints ---
            {
              sourceTag: 'layer:types',
              onlyDependOnLibsWithTags: [],
            },
            {
              sourceTag: 'layer:services',
              onlyDependOnLibsWithTags: ['layer:types'],
            },
            {
              sourceTag: 'layer:ui',
              onlyDependOnLibsWithTags: [
                'layer:services',
                'layer:types',
                'scope:design-system',
                'scope:design-system-contract',
              ],
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    // Override or add rules here
    rules: {},
  },
];
