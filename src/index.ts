// src/index.ts
import DynamicForm from "./components/DynamicForm";
import { initConfig } from "./utils/axiosConfig";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { ToastProvider, useToast, Toast } from "./components/ui/Toast";
import { defaultTheme } from "./types/theme";

export type {
  FormControllerProps,
  FormControllerTypesProps,
  StepsType,
  DynamicFormHanldeSubmitParamType,
  PropsPropsType,
  apiOptionsType,
  ModalType,
  SubFormConfig,
  Theme,
  ThemeColors,
} from "./types";

export {
  DynamicForm,
  initConfig,
  ThemeProvider,
  useTheme,
  ToastProvider,
  useToast,
  Toast,
  defaultTheme,
};

export default DynamicForm;
