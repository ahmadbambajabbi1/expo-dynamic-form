// Add any global Jest setup here
import { NativeModules as RNNativeModules } from "react-native";

// Mock the ReactNative native modules
RNNativeModules.UIManager = RNNativeModules.UIManager || {};
RNNativeModules.UIManager.RCTView = RNNativeModules.UIManager.RCTView || {};
RNNativeModules.RNGestureHandlerModule =
  RNNativeModules.RNGestureHandlerModule || {
    State: { BEGAN: "BEGAN", FAILED: "FAILED", ACTIVE: "ACTIVE", END: "END" },
    attachGestureHandler: jest.fn(),
    createGestureHandler: jest.fn(),
    dropGestureHandler: jest.fn(),
    updateGestureHandler: jest.fn(),
  };

// Mock Expo modules
jest.mock("expo-location", () => ({
  getCurrentPositionAsync: jest.fn(() =>
    Promise.resolve({
      coords: {
        latitude: 0,
        longitude: 0,
        altitude: 0,
        accuracy: 0,
        altitudeAccuracy: 0,
        heading: 0,
        speed: 0,
      },
      timestamp: 0,
    })
  ),
  requestForegroundPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: "granted" })
  ),
  getForegroundPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: "granted" })
  ),
  reverseGeocodeAsync: jest.fn(() =>
    Promise.resolve([
      {
        city: "Test City",
        country: "Test Country",
        street: "Test Street",
        region: "Test Region",
        postalCode: "12345",
      },
    ])
  ),
  Accuracy: {
    High: 5,
  },
}));

jest.mock("expo-document-picker", () => ({
  getDocumentAsync: jest.fn(),
}));

jest.mock("expo-image-picker", () => ({
  launchImageLibraryAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: "granted" })
  ),
  MediaTypeOptions: {
    Images: "images",
  },
}));

jest.mock("expo-file-system", () => ({
  getInfoAsync: jest.fn(() => Promise.resolve({ exists: true, size: 1000 })),
  readAsStringAsync: jest.fn(() => Promise.resolve("file-content")),
  documentDirectory: "file:///document-directory/",
}));

// Mock react-native community modules
jest.mock("@react-native-community/datetimepicker", () => "DateTimePicker");
jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Mock other modules
jest.mock("react-native-reanimated", () => {
  const Reanimated = require("react-native-reanimated/mock");
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Add this to your Jest setup file
global.window = {
  fs: {
    readFile: jest.fn(() => Promise.resolve(new Uint8Array([]))),
  },
};
