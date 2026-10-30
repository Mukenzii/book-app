/* global jest */
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Jest has no native worklet runtime; use the libraries' official mocks. The compiled
// Reanimated mock is used because `react-native-reanimated/mock` loads the real entry
// point under Reanimated 4.7 (package.json maps that path for expo-router's own mock).
// The carousel indicator math lives in src/features/home/carouselMath.ts and is unit-tested.
jest.mock('react-native-worklets', () => require('react-native-worklets/lib/module/mock'));
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
