import axios from "axios";

// @ts-ignore
import userConfig from "../../../../form.config.json";
const Axios = axios.create({
  baseURL: userConfig.api?.baseURL || "",
  headers: {
    ...(userConfig.api?.headers?.["Content-Type"]
      ? {}
      : { "Content-Type": "application/json" }),
    ...(userConfig.api?.headers || {}),
  },
  timeout: userConfig.api?.timeout || 30000,
});
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
