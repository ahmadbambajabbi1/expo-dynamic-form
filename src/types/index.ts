import { ReactNode } from "react";
import { StyleProp, ViewStyle } from "react-native";
import { UseFormReset, UseFormSetError } from "react-hook-form";
import { z, ZodType } from "zod";

// Form controller types
export type FormControllerTypesProps =
  | "text"
  | "email"
  | "number"
  | "password"
  | "select"
  | "multi-select"
  | "searchable-select"
  | "textarea"
  | "checkbox"
  | "group-checkbox"
  | "date"
  | "react-node"
  | "location"
  | "multi-location"
  | "current-location"
  | "date-of-birth"
  | "phone"
  | "tags-input"
  | "sub-form"
  | "file-upload"
  | "currency"
  | "list-creator"
  | "image-gallery"
  | "featured-image"
  | "rich-text";

export type SubFormConfig = {
  formtype?: "normal" | "steper";
  controllers?: FormControllerProps[];
  steps?: StepsType<any>[];
  formSchema?: any; // A Zod schema
};

export type FormControllerProps = {
  name?: string;
  label?: string;
  type?: FormControllerTypesProps;
  placeholder?: string;
  groupName?: string;
  defaultValue?: any;
  description?: string;
  icon?: string;
  options?: { label: string; value: string }[] | "from-api";
  visible?: (value: any) => boolean;
  optionsApiOptions?: {
    api: string;
    method: "get" | "post" | "patch" | "put" | "delete";
    dependingContrllerName?: string;
    options?: any;
  };
  willNeedControllersNames?: string[];
  emptyIndicator?: ReactNode;
  groupCheckbox?: FormControllerProps[];
  groupControllers?: FormControllerProps[];
  labelProps?: any;
  style?: StyleProp<ViewStyle>;
  optional?: boolean;
  rows?: number;
  maximun?: number;
  verify?: boolean;
  dateMode?: "date" | "time" | "datetime";
  outline?: "default" | "destructive" | "outline" | "secondary" | "ghost";
  id?: string;
  disabled?: ((data: Date) => boolean) | boolean;
  flow?: (data: any) => boolean;
  reactNode?: ReactNode;
  mapControllerType?: "group" | "each";
  mapController?: (
    values: any
  ) => FormControllerProps[] | Promise<FormControllerProps[]>;
  cant?: { both: string[] }[];
  // Sub-form specific properties
  subform?: SubFormConfig;
  addMoreVisible?: boolean;
  display?: (item: any) => ReactNode;
  itemTitle?: string | ((item: any) => string);
  emptyMessage?: string;
  // File upload specific properties
  acceptedFiles?: string[]; // Array of accepted file types (e.g., ["png", "jpg", "pdf"] or ["image/*", "application/pdf"])
  multiple?: boolean; // Allow multiple file uploads
  maxFileSize?: number; // Maximum file size in bytes
  uploadUrl?: string; // URL to upload files to
  fileUploadOptions?: {
    fieldName?: string; // Field name for the file in multipart/form-data
    headers?: Record<string, string>; // Additional headers for upload
    formData?: Record<string, string>; // Additional form data for upload
  };
  allowsEditing?: boolean;
  aspect?: any;
  allowsMultipleSelection?: boolean;
  returnFullImageObject?: boolean;
};

export type apiOptionsType = {
  api: string;
  method: "POST" | "PATCH" | "PUT" | "DELETE" | "GET";
  options?: any;
  extraData?: any;
  errorHandler?: (data: any, type: string) => void;
  onFinish?: (data: any) => void;
  onVerify?: (data: any) => void;
};

export type PropsPropsType = {
  form?: any;
  controllerBase?: any;
  groupcontrollerBase?: any;
  submitBtn?: any;
};

export type DynamicFormHanldeSubmitParamType<T extends ZodType<any, any, any>> =
  {
    reset: UseFormReset<any>;
    values: z.infer<T>;
    setError: UseFormSetError<z.TypeOf<T>>;
  };

export type StepsType<T> = {
  stepName?: string;
  isOptional?: boolean;
  stepNameByNumber?: number;
  stepSchema?: T;
  skip?: (value: any) => boolean;
  condition?: (value: any) => string;
  controllers: FormControllerProps[];
};

export type ModalType = {
  open: boolean;
  data: any;
};
