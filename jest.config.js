module.exports = {
  testEnvironment: "node",
  testMatch: [
    "<rootDir>/backend/**/?(*.)(test).{ts,tsx}",
    "<rootDir>/sim/**/?(*.)(test).{ts,tsx}",
  ],
  // SWC instead of ts-jest
  transform: {
    "^.+\\.(t|j)sx?$": ["@swc/jest"],
  },
};
