/** @type {import('@commitlint/types').UserConfig} */
const ALLOWED_TYPES = [
  'feat',
  'fix',
  'hotfix',
  'docs',
  'style',
  'refactor',
  'perf',
  'test',
  'chore',
  'ci',
  'revert',
];

const HEADER_PATTERN = new RegExp(
  `^\\[(${ALLOWED_TYPES.join('|')})\\]\\s+(PW-\\d+)\\s+(.+)$`,
);

const config = {
  plugins: [
    {
      rules: {
        'palmonas-header-format': ({ header }) => {
          const match = HEADER_PATTERN.exec(header ?? '');

          if (!match) {
            return [
              false,
              'header must match: [type] PW-123 description — e.g. [feat] PW-11 add product gallery',
            ];
          }

          const [, , , subject] = match;

          if (subject.endsWith('.')) {
            return [false, 'subject must not end with a period'];
          }

          if (subject.length < 3) {
            return [false, 'subject must be at least 3 characters'];
          }

          return [true, ''];
        },
      },
    },
  ],
  rules: {
    'palmonas-header-format': [2, 'always'],
    'header-max-length': [2, 'always', 100],
    'body-max-line-length': [2, 'always', 100],
  },
  helpUrl:
    'Format: [type] PW-123 description — e.g. [feat] PW-11 add product gallery',
};

export default config;
