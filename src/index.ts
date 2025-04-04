import DynamicForm from "./components/DynamicForm";
import { initConfig } from "./utils/axiosConfig";

export type {
  FormControllerProps,
  FormControllerTypesProps,
  StepsType,
  DynamicFormHanldeSubmitParamType,
  PropsPropsType,
  apiOptionsType,
  ModalType,
  SubFormConfig,
} from "./types";

export { DynamicForm, initConfig };

export default DynamicForm;
