import axios from "axios";

// @ts-ignore
import { getSession } from "../../../../services/expo-dynamic-service";
// @ts-ignore
let userConfig;
try {
  // @ts-ignore
  userConfig = require("../../../../form.config.json");
} catch (error) {
  userConfig = {
    api: {
      baseURL: "",
      headers: {},
      timeout: 30000,
    },
  };
}

const Axios = axios.create({
  baseURL: userConfig?.api?.baseURL || "",
  headers: {
    ...(userConfig?.api?.headers?.["Content-Type"]
      ? {}
      : { "Content-Type": "application/json" }),
    ...(userConfig?.api?.headers || {}),
  },
  timeout: userConfig?.api?.timeout || 30000,
});
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
// import axios from "axios";

// import * as FileSystem from "expo-file-system";

// const configPath = `${FileSystem.documentDirectory}form.config.json`;
// let userConfig: any = {};
// try {
//   if (await FileSystem.getInfoAsync(configPath).then((info) => info.exists)) {
//     const configContent = await FileSystem.readAsStringAsync(configPath);
//     userConfig = JSON.parse(configContent);
//   }
// } catch (error) {
//   console.warn("Error reading form.config.json:", error);
// }
// const Axios = axios?.create({
//   baseURL: userConfig.api?.baseURL || "",
//   headers: {
//     ...(userConfig.api?.headers?.["Content-Type"]
//       ? {}
//       : { "Content-Type": "application/json" }),
//     ...(userConfig.api?.headers || {}),
//   },
//   timeout: userConfig.api?.timeout || 30000,
// });
// export default Axios;
