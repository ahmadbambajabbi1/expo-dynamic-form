import { ReactNode } from "react";
import { StyleProp, ViewStyle } from "react-native";
import { UseFormReset, UseFormSetError } from "react-hook-form";
import { z, ZodType } from "zod";
export type FormControllerTypesProps = "text" | "email" | "number" | "password" | "select" | "multi-select" | "searchable-select" | "textarea" | "checkbox" | "group-checkbox" | "date" | "react-node" | "location" | "multi-location" | "current-location" | "date-of-birth" | "phone" | "tags-input" | "sub-form" | "file-upload" | "currency" | "list-creator" | "image-gallery" | "featured-image";
export type SubFormConfig = {
    formtype?: "normal" | "steper";
    controllers?: FormControllerProps[];
    steps?: StepsType<any>[];
    formSchema?: any;
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
    options?: {
        label: string;
        value: string;
    }[] | "from-api";
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
    mode?: "default" | "single" | "multiple" | "range";
    outline?: "default" | "destructive" | "outline" | "secondary" | "ghost";
    id?: string;
    disabled?: ((data: Date) => boolean) | boolean;
    flow?: (data: any) => boolean;
    reactNode?: ReactNode;
    mapControllerType?: "group" | "each";
    mapController?: (values: any) => FormControllerProps[] | Promise<FormControllerProps[]>;
    cant?: {
        both: string[];
    }[];
    subform?: SubFormConfig;
    addMoreVisible?: boolean;
    display?: (item: any) => ReactNode;
    itemTitle?: string | ((item: any) => string);
    emptyMessage?: string;
    acceptedFiles?: string[];
    multiple?: boolean;
    maxFileSize?: number;
    uploadUrl?: string;
    fileUploadOptions?: {
        fieldName?: string;
        headers?: Record<string, string>;
        formData?: Record<string, string>;
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
};
export type PropsPropsType = {
    form?: any;
    controllerBase?: any;
    groupcontrollerBase?: any;
    submitBtn?: any;
};
export type DynamicFormHanldeSubmitParamType<T extends ZodType<any, any, any>> = {
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
