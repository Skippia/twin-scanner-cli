// eslint-disable-next-line import/no-named-as-default
import antfu from '@antfu/eslint-config'
import functional from 'eslint-plugin-functional'
import noClosure from 'eslint-plugin-no-closure'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default antfu(
  {
    stylistic: {
      indent: 2,
      quotes: 'single'
    }
  },
  {
    files: ['**/*.ts'],
    plugins: {
      functional,
      noClosure
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.name
      }
    },
    rules: {
      ...functional.configs.externalTypeScriptRecommended.rules,
      'noClosure/no-tagged-closures': 'error',
      // ...functional.configs.recommended.rules,
      // ...functional.configs.lite.rules,
      // ...functional.configs.stylistic.rules,
      // 'functional/no-return-void: ': 'off',
      // 'functional/prefer-immutable-types': [
      //   'off',
      // ],
      // 'functional/no-expression-statements': [
      //   'error',
      //   {
      //     ignoreVoid: true,
      //   },
      // ],
      // 'functional/no-conditional-statements': [
      //   'error',
      //   {
      //     allowReturningBranches: true,
      //   },
      // ],
    }
  },
  // ?----------------------------------------------------
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.name
      },
      globals: {
        ...globals.browser
      }
    },
    rules: {
      // !-------------------Supported Rules-------------------
      // https://typescript-eslint.io/rules/#extension-rules
      'ts/adjacent-overload-signatures': 'error',
      // 'ts/array-type': ['error', { default: 'generic' }],
      'ts/await-thenable': 'error', // TODO: fix ANTFU doesn' support it?
      'ts/ban-ts-comment': ['error', { 'ts-expect-error': false }],
      'ts/ban-tslint-comment': 'error',
      'ts/class-literal-property-style': 'error',
      'ts/consistent-generic-constructors': 'error',
      'ts/consistent-indexed-object-style': [
        'error'
        //   'index-signature',
      ],
      'ts/consistent-type-assertions': 'error',
      'ts/consistent-type-definitions': ['error', 'type'],
      'ts/consistent-type-exports': 'error',
      'ts/consistent-type-imports': 'error',
      'ts/explicit-member-accessibility': 'off',
      'ts/member-ordering': 'error',
      'ts/method-signature-style': ['error', 'property'],
      'ts/naming-convention': 'off', // TODO
      'ts/no-base-to-string': 'error',
      'ts/no-confusing-non-null-assertion': 'error',
      'ts/no-duplicate-enum-values': 'error',
      'ts/no-duplicate-type-constituents': 'error',
      'ts/no-dynamic-delete': 'off',
      'ts/no-empty-interface': 'error',
      'ts/no-extra-non-null-assertion': 'error',
      'ts/no-floating-promises': 'error',
      'ts/no-for-in-array': 'error',
      'ts/no-import-type-side-effects': 'error',
      'ts/no-implied-eval': 'error',
      'ts/no-inferrable-types': ['error', { ignoreParameters: true, ignoreProperties: true }],
      'ts/no-misused-new': 'error',
      'ts/no-misused-promises': 'error',
      'ts/no-mixed-enums': 'error',
      // 'ts/no-namespace': 'error',
      'ts/no-non-null-asserted-nullish-coalescing': 'error',
      'ts/no-non-null-asserted-optional-chain': 'error',
      'ts/no-redundant-type-constituents': 'error',
      // 'ts/no-require-imports': 'error',
      'ts/no-this-alias': 'error',
      'ts/no-unnecessary-boolean-literal-compare': 'error',
      'ts/no-unnecessary-condition': [
        'error',
        {
          allowConstantLoopConditions: true
        }
      ],
      'ts/no-unnecessary-qualifier': 'error',
      'ts/no-unnecessary-type-arguments': 'error',
      'ts/no-unnecessary-type-assertion': 'error',
      'ts/no-unnecessary-type-constraint': 'error',
      'ts/no-unsafe-argument': 'error',
      'ts/no-unsafe-assignment': 'off', // TODO
      'ts/no-unsafe-call': 'error',
      'ts/no-unsafe-declaration-merging': 'error',
      'ts/no-unsafe-enum-comparison': 'error',
      'ts/no-unsafe-member-access': 'off', // TODO
      'ts/no-unsafe-return': 'off',
      'ts/no-useless-empty-export': 'error',
      'ts/no-var-requires': 'error',
      'ts/non-nullable-type-assertion-style': 'off', // TODO
      // 'ts/parameter-properties': 'error',
      'ts/prefer-as-const': 'error',
      'ts/prefer-enum-initializers': 'error',
      'ts/prefer-for-of': 'error',
      'ts/prefer-function-type': 'error',
      'ts/prefer-includes': 'error',
      'ts/prefer-literal-enum-member': 'error',
      'ts/prefer-namespace-keyword': 'error',
      // 'ts/prefer-nullish-coalescing': 'error',
      'ts/prefer-optional-chain': 'error',
      'ts/prefer-readonly': 'off',
      'ts/prefer-readonly-parameter-types': 'off',
      'ts/prefer-reduce-type-parameter': 'off',
      'ts/prefer-regexp-exec': 'off',
      'ts/prefer-return-this-type': 'error',
      'ts/prefer-string-starts-ends-with': 'error',
      'ts/prefer-ts-expect-error': 'error',
      'ts/promise-function-async': 'off',
      'ts/require-array-sort-compare': 'error',
      'ts/restrict-plus-operands': 'error',
      'ts/restrict-template-expressions': 'error',
      'ts/sort-type-union-intersection-members': 'off',
      'ts/switch-exhaustiveness-check': 'error',
      'ts/triple-slash-reference': 'error',
      'ts/typedef': 'off',
      'ts/unbound-method': 'off', // ?
      'ts/unified-signatures': 'error',

      // !-------------------Extension Rules-------------------

      'ts/default-param-last': 'error',
      'ts/dot-notation': 'error',
      'ts/lines-around-comment': 'off',
      'ts/no-array-constructor': 'error',
      'ts/no-dupe-class-members': 'error',
      // 'ts/no-empty-function': 'error',
      'ts/no-invalid-this': 'error',
      'ts/no-loop-func': 'error',
      // 'ts/no-loss-of-precision': 'error',
      'ts/no-redeclare': 'error',
      // 'ts/no-throw-literal': ['error', { allowThrowingAny: false, allowThrowingUnknown: false }],
      // 'ts/no-shadow': [
      //   'error',
      //   {
      //     allow: ['E', 'L', 'R', 'A', 'O', 'M', 'S'],
      //     ignoreTypeValueShadow: true,
      //     ignoreFunctionTypeParameterNameValueShadow: true
      //   }
      // ],
      'ts/no-shadow': 'off', // !!!
      'ts/no-unused-expressions': 'error',
      // 'ts/no-useless-constructor': 'error',
      'ts/require-await': 'error',
      'ts/return-await': ['error', 'always'],

      // Disable for JS and TS
      'ts/init-declarations': 'off',
      'ts/no-magic-numbers': 'off',
      'ts/no-restricted-imports': 'off',
      'ts/no-use-before-define': 'off',
      'ts/no-duplicate-imports': 'off', // Superseded by `import/no-duplicates`,

      'ts/no-unsafe-function-type': 'off',
      'ts/no-empty-object-type': 'off',
      'ts/interface-name-prefix': 'off',
      'ts/explicit-function-return-type': 'off', // !!!
      'ts/explicit-module-boundary-types': 'off',
      'ts/no-empty-function': [
        'error',
        {
          allow: ['arrowFunctions', 'private-constructors']
        }
      ], // !!!
      'ts/no-explicit-any': [
        'error',
        {
          ignoreRestArgs: true
        }
      ],
      'ts/no-non-null-assertion': 'off' // !!!
    }
  },
  // ?----------------------------------------------------
  {
    files: ['**/*.js', '**/*.mjs', '**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.browser
      }
    },

    rules: {
      // Disable conflicting ESLint rules and enable TS-compatible ones

      // 'default-param-last': 'off',
      // 'dot-notation': 'off',
      // 'lines-between-class-members': 'off',
      // 'no-array-constructor': 'off',
      // 'no-dupe-class-members': 'off',
      // 'no-empty-function': 'off',
      // 'no-invalid-this': 'off',
      // 'no-loop-func': 'off',
      // 'no-loss-of-precision': 'off',
      // 'no-redeclare': 'off',
      // 'require-await': 'off',
      // 'no-unused-expressions': 'off',
      'no-throw-literal': 'off',
      'no-shadow': 'off',
      'no-unused-vars': 'off',
      'no-useless-constructor': 'off',

      'style/comma-dangle': [
        'error',
        {
          arrays: 'only-multiline',
          objects: 'only-multiline',
          imports: 'only-multiline',
          exports: 'only-multiline',
          functions: 'never'
        }
      ], // !!!
      'prefer-const': 'error',
      'no-undef': 'off',
      'no-console': 'off',

      'unicorn/no-new-array': 'off',
      'unused-imports/no-unused-vars': 'off',
      'antfu/if-newline': 'off',
      'antfu/top-level-function': 'off',
      'style/max-len': [
        'error',
        {
          code: 100,
          comments: 160,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreRegExpLiterals: true,
          ignoreUrls: true
        }
      ],
      'perfectionist/sort-imports': 'off',
      'import/no-unresolved': 'off', // TODO: blocked by https://github.com/import-js/eslint-plugin-import/issues/2170
      'import/named': 'error',
      'import/default': 'error',
      'import/namespace': 'error',
      'import/no-absolute-path': 'error',
      'import/no-dynamic-require': 'error',
      'import/no-internal-modules': 'off',
      'import/no-webpack-loader-syntax': 'error',
      'import/no-self-import': 'error',
      'import/no-useless-path-segments': 'error',
      'import/no-relative-parent-imports': 'off',
      'import/no-relative-packages': 'off',
      'import/no-cycle': 'error',

      // !-------------------Helpful warnings-------------------
      // https://github.com/benmosher/eslint-plugin-import#helpful-warnings
      'import/export': 'error',
      'import/no-named-as-default': 'error',
      'import/no-named-as-default-member': 'error',
      'import/no-deprecated': 'error',
      'import/no-mutable-exports': 'error',
      'import/no-unused-modules': 'error',
      'import/no-empty-named-blocks': 'error',

      // !-------------------Module systems-------------------
      // https://github.com/benmosher/eslint-plugin-import#module-systems
      'import/unambiguous': 'warn',
      'import/no-commonjs': 'error',
      'import/no-amd': 'error',
      'import/no-import-module-exports': 'off',

      // !-------------------Style guide-------------------
      // https://github.com/benmosher/eslint-plugin-import#style-guide
      'import/exports-last': 'off',
      'import/no-duplicates': 'error',
      // 'import/no-namespace': 'error',
      'import/first': 'error',
      'import/order': [
        'error',
        {
          'groups': [
            ['builtin'], // built-in modules (f.e node:module)
            ['external'], // npm modules (f.e lodash)
            ['internal'], // custom path alias (f.e @shared)
            ['parent'],
            ['sibling'],
            ['index']
          ],
          'pathGroups': [
            //
            {
              pattern: '@shared/**',
              group: 'internal',
              position: 'before'
            }
          ],
          'pathGroupsExcludedImportTypes': ['internal'],
          'newlines-between': 'always',
          // 'newlines-between': 'always-and-inside-groups',
          'distinctGroup': true,
          'alphabetize': {
            order: 'asc',
            caseInsensitive: true
          }
        }
      ],
      'import/newline-after-import': 'error',
      'import/prefer-default-export': 'off',
      'import/max-dependencies': 'off',
      'import/no-unassigned-import': 'error',
      'import/no-named-default': 'error',
      // 'import/no-default-export': 'error',
      'import/no-named-export': 'off',
      // 'import/no-anonymous-default-export': 'error',
      'import/group-exports': 'off',
      'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],

      // ! -------------------Possible Errors-------------------
      // https://eslint.org/docs/latest/rules/#possible-problems
      'array-callback-return': 'error',
      'constructor-super': 'error',
      'for-direction': 'error',
      'getter-return': 'error',
      'no-async-promise-executor': 'error',
      'no-class-assign': 'error',
      'no-compare-neg-zero': 'error',
      'no-cond-assign': 'error',
      'no-const-assign': 'error',
      'no-constant-binary-expression': 'error',
      'no-constant-condition': 'error',
      'no-constructor-return': 'error',
      'no-control-regex': 'error',
      'no-debugger': 'warn',
      'no-dupe-args': 'error',
      'no-dupe-class-members': 'error',
      'no-dupe-else-if': 'error',
      'no-dupe-keys': 'error',
      'no-duplicate-case': 'error',
      'no-duplicate-imports': 'off', // Superseded by `import/no-duplicates`
      'no-empty-character-class': 'error',
      'no-empty-pattern': 'error',
      'no-ex-assign': 'error',
      'no-fallthrough': 'error',
      'no-func-assign': 'error',
      'no-import-assign': 'error',
      'no-inner-declarations': ['error', 'both'],
      'no-invalid-regexp': 'error',
      'no-irregular-whitespace': 'error',
      'no-loss-of-precision': 'error',
      'no-misleading-character-class': 'error',
      'no-new-native-nonconstructor': 'error',
      'no-new-symbol': 'error',
      'no-obj-calls': 'error',
      'no-promise-executor-return': 'error',
      'no-prototype-builtins': 'error',
      'no-self-assign': 'error',
      'no-self-compare': 'error',
      'no-setter-return': 'error',
      'no-sparse-arrays': 'error',
      'no-template-curly-in-string': 'error',
      'no-this-before-super': 'error',
      'no-unexpected-multiline': 'error',
      'no-unmodified-loop-condition': 'error',
      'no-unreachable': 'error',
      'no-unreachable-loop': 'error',
      'no-unsafe-finally': 'error',
      'no-unsafe-negation': 'error',
      'no-unsafe-optional-chaining': ['error', { disallowArithmeticOperators: true }],
      'no-unused-private-class-members': 'warn',
      'no-use-before-define': 'off',
      'no-useless-backreference': 'error',
      'require-atomic-updates': 'error',
      'use-isnan': 'error',
      'no-empty-function': 'off',
      'valid-typeof': 'error',

      // ! -------------------Suggestions-------------------
      // https://eslint.org/docs/latest/rules/#suggestions
      'accessor-pairs': 'error',
      'arrow-body-style': 'error',
      'block-scoped-var': 'error',
      // camelcase: 'error',
      'class-methods-use-this': 'off',
      'complexity': 'off',
      'consistent-return': 'off',
      'consistent-this': 'error',
      // 'curly': 'error',
      'default-case': 'off',
      'default-case-last': 'error',
      'default-param-last': 'error',
      'dot-notation': 'error',
      'eqeqeq': ['error', 'smart'],
      'func-name-matching': 'off',
      'func-names': ['error', 'as-needed'], // improve debug experience
      'func-style': 'off',
      'grouped-accessor-pairs': 'error',
      'guard-for-in': 'error',
      'id-denylist': 'off',
      'id-length': 'off',
      'id-match': ['error', '^(?:_?[a-zA-Z0-9]*)|[_A-Z0-9]+$'],
      'init-declarations': 'off',
      'logical-assignment-operators': 'error',
      'max-classes-per-file': 'off',
      'max-depth': 'off',
      'max-lines': 'off',
      'max-lines-per-function': 'off',
      'max-nested-callbacks': 'off',
      'max-statements': 'off',
      'multiline-comment-style': 'off',
      // 'new-cap': 'error',
      'no-alert': 'error',
      'no-array-constructor': 'error',
      'no-bitwise': 'off',
      'no-caller': 'error',
      'no-case-declarations': 'error',
      'no-confusing-arrow': 'off',
      'no-continue': 'off',
      'no-delete-var': 'error',
      'no-div-regex': 'error',
      'no-else-return': 'error',
      'no-empty': 'error',
      'no-empty-static-block': 'error',
      'no-eq-null': 'off',
      'no-eval': 'error',
      'no-extend-native': 'error',
      'no-extra-bind': 'error',
      'no-extra-boolean-cast': 'error',
      'no-extra-label': 'error',
      'no-extra-semi': 'off',
      'no-floating-decimal': 'off',
      'no-global-assign': 'error',
      'no-implicit-coercion': 'error',
      'no-implicit-globals': 'off',
      'no-implied-eval': 'error',
      'no-inline-comments': 'off',
      'no-invalid-this': 'error',
      'no-iterator': 'error',
      'no-label-var': 'error',
      'no-labels': 'error',
      'no-lone-blocks': 'error',
      'no-lonely-if': 'error',
      'no-loop-func': 'error',
      'no-magic-numbers': 'off',
      'no-mixed-operators': 'off',
      'no-multi-assign': 'off',
      'no-multi-str': 'error',
      'no-negated-condition': 'off',
      'no-nested-ternary': 'off',
      'no-new': 'error',
      'no-new-func': 'error',
      'no-new-object': 'error',
      'no-new-wrappers': 'error',
      'no-nonoctal-decimal-escape': 'error',
      'no-octal': 'error',
      'no-octal-escape': 'error',
      'no-param-reassign': 'error',
      'no-plusplus': 'off',
      'no-proto': 'error',
      'no-redeclare': 'error',
      'no-regex-spaces': 'error',
      'no-restricted-globals': 'off',
      'no-restricted-imports': 'off',
      'no-restricted-properties': 'off',
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TemplateElement[value.raw=/ \\n/]',
          message:
            'String literals should not contain trailing spaces. If needed for tests please disable locally using eslint comment'
        }
      ],
      'no-return-assign': 'error',
      'no-return-await': 'off',
      'no-script-url': 'error',
      'no-sequences': 'error',
      'no-shadow-restricted-names': 'error',
      'no-ternary': 'off',
      // 'no-throw-literal': 'error',
      'no-undef-init': 'error',
      'no-undefined': 'off',
      'no-underscore-dangle': 'off',
      'no-unneeded-ternary': 'error',
      'no-unused-expressions': 'error',
      'no-unused-labels': 'error',
      'no-useless-call': 'error',
      'no-useless-catch': 'error',
      'no-useless-computed-key': 'error',
      'no-useless-concat': 'error',
      // 'no-useless-constructor': 'error',
      'no-useless-escape': 'error',
      'no-useless-rename': 'error',
      'no-useless-return': 'error',
      'no-var': 'error',
      'no-void': ['error', { allowAsStatement: true }],
      'no-warning-comments': 'off',
      'no-with': 'error',
      'object-shorthand': 'error',
      'one-var': ['error', 'never'],
      'one-var-declaration-per-line': 'off',
      'operator-assignment': 'error',
      'prefer-arrow-callback': 'error',
      'prefer-destructuring': 'off',
      'prefer-exponentiation-operator': 'error',
      'prefer-numeric-literals': 'error',
      'prefer-object-has-own': 'error',
      'prefer-object-spread': 'error',
      'prefer-promise-reject-errors': 'error',
      'prefer-regex-literals': 'error',
      'prefer-rest-params': 'error',
      'prefer-spread': 'error',
      'prefer-template': 'off',
      'radix': 'error',
      'require-await': 'error',
      'require-unicode-regexp': 'off',
      'require-yield': 'error',
      'sort-imports': 'off',
      'sort-keys': 'off',
      'sort-vars': 'off',
      'spaced-comment': 'error',
      'strict': 'error',
      'symbol-description': 'off',
      'vars-on-top': 'error',
      'yoda': ['error', 'never', { exceptRange: true }],

      // !-------------------Layout & Formatting-------------------
      // https://eslint.org/docs/latest/rules/#layout--formatting
      'line-comment-position': 'off',
      'lines-around-comment': 'off',
      'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
      'max-statements-per-line': 'off',
      'padding-line-between-statements': 'off',
      'quotes': ['error', 'single', { avoidEscape: true }]
    }
  },
  {
    ignores: ['node_modules/*', 'tsconfig.json', 'benchmarks-data/*']
  }
)

// functional.configs.recommended,
// functional.configs.stylistic,
