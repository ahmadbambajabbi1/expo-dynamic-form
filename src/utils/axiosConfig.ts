import axios from "axios";

let userConfig: any = {
  api: {
    baseURL: "",
    headers: {},
    timeout: 30000,
  },
};

// Default fallback session getter
let getSession: () => Promise<{ accessToken?: string }> = async () => ({
  accessToken: undefined,
});

// Expose initConfig
export const initConfig = (
  config: any,
  sessionFn?: () => Promise<{ accessToken?: string }>
) => {
  userConfig = config;

  if (sessionFn) {
    getSession = sessionFn;
  }

  // Update Axios instance with new config
  Axios.defaults.baseURL = userConfig.api?.baseURL || "";
  Axios.defaults.headers = {
    ...(userConfig.api?.headers?.["Content-Type"]
      ? {}
      : { "Content-Type": "application/json" }),
    ...(userConfig.api?.headers || {}),
  };
  Axios.defaults.timeout = userConfig.api?.timeout || 30000;
};

// Create Axios instance
const Axios = axios.create();

// Attach session token interceptor
Axios.interceptors.request.use(
  async (config) => {
    try {
      const session = await getSession();
      if (session?.accessToken) {
        config.headers.Authorization = `Bearer ${session.accessToken}`;
      }
    } catch (error) {
      console.warn("Error fetching session token:", error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default Axios;
