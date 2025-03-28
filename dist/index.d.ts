import { ReactNode } from 'react';
import { ZodType, z, ZodSchema } from 'zod';
import { StyleProp, ViewStyle } from 'react-native';
import { UseFormReset, UseFormSetError, UseFormReturn } from 'react-hook-form';

type FormControllerTypesProps = "text" | "email" | "number" | "password" | "select" | "multi-select" | "searchable-select" | "textarea" | "checkbox" | "group-checkbox" | "date" | "react-node" | "location" | "multi-location" | "current-location" | "date-of-birth" | "phone" | "tags-input" | "sub-form" | "file-upload" | "currency" | "list-creator" | "image-gallery" | "featured-image";
type SubFormConfig = {
    formtype?: "normal" | "steper";
    controllers?: FormControllerProps[];
    steps?: StepsType<any>[];
    formSchema?: any;
};
type FormControllerProps = {
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
type apiOptionsType = {
    api: string;
    method: "POST" | "PATCH" | "PUT" | "DELETE" | "GET";
    options?: any;
    extraData?: any;
    errorHandler?: (data: any, type: string) => void;
    onFinish?: (data: any) => void;
};
type PropsPropsType = {
    form?: any;
    controllerBase?: any;
    groupcontrollerBase?: any;
    submitBtn?: any;
};
type DynamicFormHanldeSubmitParamType<T extends ZodType<any, any, any>> = {
    reset: UseFormReset<any>;
    values: z.infer<T>;
    setError: UseFormSetError<z.TypeOf<T>>;
};
type StepsType<T> = {
    stepName?: string;
    isOptional?: boolean;
    stepNameByNumber?: number;
    stepSchema?: T;
    skip?: (value: any) => boolean;
    condition?: (value: any) => string;
    controllers: FormControllerProps[];
};
type ModalType = {
    open: boolean;
    data: any;
};

declare function DynamicForm({ controllers, formSchema, handleSubmit, apiOptions, tricker, props, modalComponent, steps, formtype, stepPreview, hideStepsIndication, submitBtn, }: {
    controllers?: FormControllerProps[];
    steps?: StepsType<ZodSchema>[];
    submitBtn?: {
        title?: string;
    };
    stepPreview?: (value: any) => ReactNode;
    hideStepsIndication?: boolean;
    formSchema?: ZodSchema;
    handleSubmit?: (params: DynamicFormHanldeSubmitParamType<ZodSchema>) => Promise<void>;
    apiOptions?: apiOptionsType;
    tricker?: (props: any) => ReactNode;
    props?: PropsPropsType;
    formtype?: "normal" | "steper";
    modalComponent?: (data: ModalType, setModal: (modal: ModalType) => void) => ReactNode;
}): JSX.Element;

type PropsType$3 = {
    controller: FormControllerProps;
    form: UseFormReturn<z.TypeOf<any>, any, undefined>;
    props?: PropsPropsType;
};
declare const FormElementHandler: ({ controller, form, props }: PropsType$3) => JSX.Element;

type PropsType$2 = {
    props?: PropsPropsType;
    controllers?: FormControllerProps[];
    form: UseFormReturn<z.TypeOf<any>, any, undefined>;
    onSubmit: () => void;
    isStepMode?: boolean;
};
declare const NormalHandler: ({ props, controllers, form, onSubmit, isStepMode, }: PropsType$2) => JSX.Element;

type PropsType$1 = {
    steps?: StepsType<any>[];
    props?: PropsPropsType;
    form: UseFormReturn<z.TypeOf<any>, any, undefined>;
    stepPreview?: (value: any) => ReactNode;
    hideStepsIndication?: boolean;
    onSubmit: () => void;
};
declare const StepsHandler: ({ steps, form, props, stepPreview, hideStepsIndication, onSubmit, }: PropsType$1) => JSX.Element;

type PropsItemsType = {
    value: string;
    label: string;
};
type PropsType = {
    items?: PropsItemsType[];
    form: UseFormReturn<z.TypeOf<any>, any, undefined>;
    baseStyle?: any;
    checkBoxController: FormControllerProps;
    field?: {
        onChange: (value: any) => void;
        onBlur: () => void;
        value: any;
        name: string;
    };
};
declare const CheckBoxController: ({ items, form, baseStyle, checkBoxController, field, }: PropsType) => JSX.Element;

export { CheckBoxController, DynamicForm, FormElementHandler, NormalHandler, StepsHandler };
