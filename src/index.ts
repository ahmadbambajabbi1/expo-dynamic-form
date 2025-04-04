// // // Main component export
// // import DynamicForm from "./components/DynamicForm";

// // // Types export
// // import type {
// //   FormControllerProps,
// //   FormControllerTypesProps,
// //   StepsType,
// //   DynamicFormHanldeSubmitParamType,
// //   PropsPropsType,
// //   apiOptionsType,
// //   ModalType,
// //   SubFormConfig,
// // } from "./types";

// // // Core handlers
// // import FormElementHandler from "./components/handlers/FormElementHandler";
// // import NormalHandler from "./components/handlers/NormalHandler";
// // import StepsHandler from "./components/handlers/StepsHandler";

// // // UI Components
// // import { Button } from "./components/ui/button";
// // import LoadingComponent from "./components/ui/LoadingComponent";

// // // Export main component
// // export { DynamicForm };

// // // Export types
// // export type {
// //   FormControllerProps,
// //   FormControllerTypesProps,
// //   StepsType,
// //   DynamicFormHanldeSubmitParamType,
// //   PropsPropsType,
// //   apiOptionsType,
// //   ModalType,
// //   SubFormConfig,
// // };

// // // Export handlers
// // export { FormElementHandler, NormalHandler, StepsHandler };

// // // Export UI components
// // export { Button, LoadingComponent };

// // // Export default component for both import syntaxes
// // export default DynamicForm;
// // Main component export
// import DynamicForm from "./components/DynamicForm";

// // Export types
// export type {
//   FormControllerProps,
//   FormControllerTypesProps,
//   StepsType,
//   DynamicFormHanldeSubmitParamType,
//   PropsPropsType,
//   apiOptionsType,
//   ModalType,
//   SubFormConfig,
// } from "./types";

// // Core handlers
// import FormElementHandler from "./components/handlers/FormElementHandler";
// import NormalHandler from "./components/handlers/NormalHandler";
// import StepsHandler from "./components/handlers/StepsHandler";

// // UI Components
// import { Button } from "./components/ui/button";
// import LoadingComponent from "./components/ui/LoadingComponent";

// // Export components individually to avoid circular references and for named imports
// export { DynamicForm };
// export { FormElementHandler };
// export { NormalHandler };
// export { StepsHandler };
// export { Button };
// export { LoadingComponent };

// // Export default component for import * as syntax
// export default DynamicForm;

// Main component export
import DynamicForm from "./components/DynamicForm";
import { initPackage } from "./utils/axiosConfig";

// Export types
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

// Core handlers
// import FormElementHandler from "./components/handlers/FormElementHandler";
// import NormalHandler from "./components/handlers/NormalHandler";
// import StepsHandler from "./components/handlers/StepsHandler";

// Controllers
// import CheckBoxController from "./components/controllers/CheckBoxController";
// import CurrencyController from "./components/controllers/CurrencyController";
// import CurrentLocationController from "./components/controllers/CurrentLocationController";
// import DateOfBirthHandler from "./components/controllers/DateOfBirthHandler";
// import DefaultInputController from "./components/controllers/DefaultInputController";
// import FeaturedImageController from "./components/controllers/FeaturedImageController";
// import FileUploadController from "./components/controllers/FileUploadController";
// import ImageGalleryController from "./components/controllers/ImageGalleryController";
// import ListCreatorController from "./components/controllers/ListCreatorController";
// import LocationController from "./components/controllers/LocationController";
// import MultiSelectController from "./components/controllers/MultiSelectController";
// import NumberInputController from "./components/controllers/NumberInputController";
// import OttpInputHandler from "./components/controllers/OttpInputHandler";
// import PhoneController from "./components/controllers/PhoneController";
// import SearchableSelectController from "./components/controllers/SearchableSelectController";
// import SelectController from "./components/controllers/SelectController";
// import SubFormController from "./components/controllers/SubFormController";
// import TagsInputController from "./components/controllers/TagsInputController";
// import TextareaController from "./components/controllers/TextareaController";
// import ValueCounter from "./components/controllers/ValueCounter";

// UI Components
// import { Button } from "./components/ui/button";
// import LoadingComponent from "./components/ui/LoadingComponent";

// Export main component
export { DynamicForm, initPackage };

// Export handlers
// export { FormElementHandler, NormalHandler, StepsHandler };

// Export controllers
// export {
//   CheckBoxController,
//   CurrencyController,
//   CurrentLocationController,
//   DateOfBirthHandler,
//   DefaultInputController,
//   FeaturedImageController,
//   FileUploadController,
//   ImageGalleryController,
//   ListCreatorController,
//   LocationController,
//   MultiSelectController,
//   NumberInputController,
//   OttpInputHandler,
//   PhoneController,
//   SearchableSelectController,
//   SelectController,
//   SubFormController,
//   TagsInputController,
//   TextareaController,
//   ValueCounter,
// };

// Export UI components
// export { Button, LoadingComponent };
export default DynamicForm;
