module.exports = {
  testEnvironment: "node",
  testMatch: [
    "<rootDir>/backend/**/__tests__/**/*.{ts,tsx}",
    "<rootDir>/backend/**/?(*.)(test).{ts,tsx}",
  ],
  // SWC instead of ts-jest
  transform: {
    "^.+\\.(t|j)sx?$": ["@swc/jest"],
  },
};
