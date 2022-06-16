module.exports = {
  settings: {
    "import/resolver": {
      node: {
        extensions: [".ts", ".tsx"],
      },
    },
  },
  extends: ["eslint:recommended", "prettier"],
  rules: {
    "consistent-return": ["error"],
  },
  overrides: [
    {
      files: ["src/**/*.test.ts", "src/**/*.test.tsx"],
      rules: {},
    },
  ],
};
