import * as FileSystem from "expo-file-system";

/**
 * Simple configuration type for the form
 */
export interface FormConfig {
  api?: {
    baseURL?: string;
    headers?: Record<string, string>;
    timeout?: number;
  };
}

/**
 * Default configuration to use if no config file is found
 */
const defaultConfig: FormConfig = {
  api: {
    baseURL: "",
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 30000, // 30 seconds
  },
};

/**
 * Read the form.config.json file from the project root
 * @returns The parsed configuration or default config if file not found
 */
export async function readConfig(): Promise<FormConfig> {
  try {
    // In a real React Native/Expo environment, we need to use FileSystem
    // to read files from the app's directory
    const fileInfo = await FileSystem.getInfoAsync("form.config.json");

    if (fileInfo.exists) {
      const configContent = await FileSystem.readAsStringAsync(
        "form.config.json"
      );
      const config = JSON.parse(configContent);

      // Merge with default config
      return {
        ...defaultConfig,
        ...config,
        api: {
          ...defaultConfig.api,
          ...config.api,
        },
      };
    }

    // If file doesn't exist, return default config
    return defaultConfig;
  } catch (error) {
    console.warn(
      "Failed to read form.config.json, using default configuration"
    );
    return defaultConfig;
  }
}

// Cache for the config to avoid reading the file multiple times
let configCache: FormConfig | null = null;

/**
 * Get the form configuration, reading from file if needed
 */
export async function getFormConfig(): Promise<FormConfig> {
  if (!configCache) {
    configCache = await readConfig();
  }
  return configCache;
}
