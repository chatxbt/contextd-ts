// /** @type {import('ts-jest').JestConfigWithTsJest} **/
// module.exports = {
//   testEnvironment: "node",
//   transform: {
//     "^.+.tsx?$": ["ts-jest",{}],
//   },
// };

// module.exports = {
//   preset: 'ts-jest',
//   testEnvironment: 'node',
//   testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
//   moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
// };

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 9000000, // Global timeout of 10 seconds (10000 milliseconds)
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};

