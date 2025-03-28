import React, { ReactNode } from 'react';
import { ZodType, z, ZodSchema } from 'zod';
import { StyleProp, ViewStyle, TextStyle } from 'react-native';
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

interface DynamicFormProps {
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
}
declare const DynamicForm: ({ controllers, steps, submitBtn, stepPreview, hideStepsIndication, formSchema, handleSubmit, apiOptions, tricker, props, modalComponent, formtype, }: DynamicFormProps) => JSX.Element;

type PropsType$m = {
    controller: FormControllerProps;
    form: UseFormReturn<z.TypeOf<any>, any, undefined>;
    props?: PropsPropsType;
};
declare const FormElementHandler: ({ controller, form, props }: PropsType$m) => JSX.Element;

type PropsType$l = {
    props?: PropsPropsType;
    controllers?: FormControllerProps[];
    form: UseFormReturn<z.TypeOf<any>, any, undefined>;
    onSubmit: () => void;
    isStepMode?: boolean;
};
declare const NormalHandler: ({ props, controllers, form, onSubmit, isStepMode, }: PropsType$l) => JSX.Element;

type PropsType$k = {
    steps?: StepsType<any>[];
    props?: PropsPropsType;
    form: UseFormReturn<z.TypeOf<any>, any, undefined>;
    stepPreview?: (value: any) => ReactNode;
    hideStepsIndication?: boolean;
    onSubmit: () => void;
};
declare const StepsHandler: ({ steps, form, props, stepPreview, hideStepsIndication, onSubmit, }: PropsType$k) => JSX.Element;

type PropsItemsType = {
    value: string;
    label: string;
};
type PropsType$j = {
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
declare const CheckBoxController: ({ items, form, baseStyle, checkBoxController, field, }: PropsType$j) => JSX.Element;

type PropsType$i = {
    field: {
        onChange: (value: any) => void;
        onBlur: () => void;
        value: any;
        name: string;
    };
    controller: FormControllerProps;
    form: UseFormReturn<z.TypeOf<any>, any, undefined>;
};
declare const CurrencyController: ({ controller, field, form }: PropsType$i) => JSX.Element;

type PropsType$h = {
    field: {
        onChange: (value: any) => void;
        onBlur: () => void;
        value: any;
        name: string;
    };
    controller: FormControllerProps;
    form: UseFormReturn<z.TypeOf<any>, any, undefined>;
};
declare const CurrentLocationController: ({ controller, field, form }: PropsType$h) => JSX.Element;

type PropsType$g = {
    field: {
        onChange: (value: any) => void;
        onBlur: () => void;
        value: any;
        name: string;
    };
    controller: FormControllerProps;
};
declare const DateHandler: ({ controller, field }: PropsType$g) => JSX.Element;

type PropsType$f = {
    field: {
        onChange: (value: any) => void;
        onBlur: () => void;
        value: any;
        name: string;
    };
    controller: FormControllerProps;
};
declare const DateOfBirth: ({ controller, field }: PropsType$f) => JSX.Element;

type PropsType$e = {
    field: {
        onChange: (value: any) => void;
        onBlur: () => void;
        value: any;
        name: string;
    };
    controller: FormControllerProps;
    form: UseFormReturn<z.TypeOf<any>, any, undefined>;
};
declare const DefaultInputController: ({ controller, field, form }: PropsType$e) => JSX.Element;

type PropsType$d = {
    field: {
        onChange: (value: any) => void;
        onBlur: () => void;
        value: any;
        name: string;
    };
    controller: FormControllerProps;
    form: UseFormReturn<z.TypeOf<any>, any, undefined>;
};
declare const FeaturedImageController: ({ controller, field, form }: PropsType$d) => JSX.Element;

type PropsType$c = {
    field: {
        onChange: (value: any) => void;
        onBlur: () => void;
        value: any;
        name: string;
    };
    controller: FormControllerProps;
    form: UseFormReturn<z.TypeOf<any>, any, undefined>;
};
declare const FileUploadController: ({ controller, field, form }: PropsType$c) => JSX.Element;

type PropsType$b = {
    field: {
        onChange: (value: any) => void;
        onBlur: () => void;
        value: any;
        name: string;
    };
    controller: FormControllerProps;
    form: UseFormReturn<z.TypeOf<any>, any, undefined>;
};
declare const ImageGalleryController: ({ controller, field, form }: PropsType$b) => JSX.Element;

type PropsType$a = {
    field: {
        onChange: (value: any) => void;
        onBlur: () => void;
        value: any;
        name: string;
    };
    controller: FormControllerProps;
    form: UseFormReturn<z.TypeOf<any>, any, undefined>;
};
declare const ListCreatorController: ({ controller, field, form }: PropsType$a) => JSX.Element;

type PropsType$9 = {
    field: {
        onChange: (value: any) => void;
        onBlur: () => void;
        value: any;
        name: string;
    };
    controller: FormControllerProps;
    form: UseFormReturn<z.TypeOf<any>, any, undefined>;
};
declare const LocationController: ({ controller, field, form }: PropsType$9) => JSX.Element;

type PropsType$8 = {
    field: {
        onChange: (value: any) => void;
        onBlur: () => void;
        value: any;
        name: string;
    };
    controller: FormControllerProps;
    form: UseFormReturn<z.TypeOf<any>, any, undefined>;
};
declare const MultiSelectController: ({ controller, field, form }: PropsType$8) => JSX.Element;

type PropsType$7 = {
    field: {
        onChange: (value: any) => void;
        onBlur: () => void;
        value: any;
        name: string;
    };
    controller: FormControllerProps;
    form: UseFormReturn<z.TypeOf<any>, any, undefined>;
};
declare const NumberInputController: React.MemoExoticComponent<({ controller, field, form, }: PropsType$7) => JSX.Element>;

type PropsType$6 = {
    verifyingDataProps: any;
    apiOptions: apiOptionsType;
};
declare const OttpInputHandler: ({ verifyingDataProps, apiOptions }: PropsType$6) => JSX.Element;

type PropsType$5 = {
    field: {
        onChange: (value: any) => void;
        onBlur: () => void;
        value: any;
        name: string;
    };
    controller: FormControllerProps;
    form: UseFormReturn<z.TypeOf<any>, any, undefined>;
};
declare const PhoneController: ({ controller, field, form }: PropsType$5) => JSX.Element;

type PropsType$4 = {
    field: {
        onChange: (value: any) => void;
        onBlur: () => void;
        value: any;
        name: string;
    };
    controller: FormControllerProps;
    form: UseFormReturn<z.TypeOf<any>, any, undefined>;
};
declare const SearchableSelectController: ({ controller, field, form }: PropsType$4) => JSX.Element;

type PropsType$3 = {
    field: {
        onChange: (value: any) => void;
        onBlur: () => void;
        value: any;
        name: string;
    };
    controller: FormControllerProps;
    form: UseFormReturn<z.TypeOf<any>, any, undefined>;
};
declare const SelectController: ({ controller, field, form }: PropsType$3) => JSX.Element;

type SubFormControllerProps = {
    field: {
        onChange: (value: any) => void;
        onBlur: () => void;
        value: any;
        name: string;
    };
    controller: FormControllerProps & {
        subform?: {
            formtype?: "normal" | "steper";
            controllers?: FormControllerProps[];
            steps?: StepsType<any>[];
            formSchema?: z.ZodType<any, any>;
        };
        addMoreVisible?: boolean;
        itemTitle?: string | ((item: any) => string);
        display?: (item: any) => React.ReactNode;
        emptyMessage?: string;
    };
    form: UseFormReturn<z.TypeOf<any>, any, undefined>;
};
/**
 * SubFormController - Integrated with parent form
 * This component handles nested form data that is stored within the parent form structure
 */
declare const SubFormController: ({ controller, field, form, }: SubFormControllerProps) => JSX.Element;

type PropsType$2 = {
    field: {
        onChange: (value: any) => void;
        onBlur: () => void;
        value: any;
        name: string;
    };
    controller: FormControllerProps;
    form: UseFormReturn<z.TypeOf<any>, any, undefined>;
};
declare const TagsInputController: ({ controller, field, form }: PropsType$2) => JSX.Element;

type PropsType$1 = {
    field: {
        onChange: (value: any) => void;
        onBlur: () => void;
        value: any;
        name: string;
    };
    controller: FormControllerProps;
};
declare const TextareaController: ({ controller, field }: PropsType$1) => JSX.Element;

type PropsType = {
    value: string;
    maximun: number;
};
declare const ValueCounter: ({ value, maximun }: PropsType) => JSX.Element;

type ButtonProps = {
    children: ReactNode;
    onPress: () => void;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    disabled?: boolean;
    loading?: boolean;
    variant?: "default" | "primary" | "secondary" | "outline" | "destructive";
};
declare const Button: ({ children, onPress, style, textStyle, disabled, loading, variant, }: ButtonProps) => JSX.Element;

type LoadingComponentProps = {
    size?: "small" | "large";
    color?: string;
    style?: StyleProp<ViewStyle>;
};
declare const LoadingComponent: ({ size, color, style, }: LoadingComponentProps) => JSX.Element;

export { Button, CheckBoxController, CurrencyController, CurrentLocationController, DateHandler, DateOfBirth as DateOfBirthHandler, DefaultInputController, DynamicForm, DynamicFormHanldeSubmitParamType, FeaturedImageController, FileUploadController, FormControllerProps, FormControllerTypesProps, FormElementHandler, ImageGalleryController, ListCreatorController, LoadingComponent, LocationController, ModalType, MultiSelectController, NormalHandler, NumberInputController, OttpInputHandler, PhoneController, PropsPropsType, SearchableSelectController, SelectController, StepsHandler, StepsType, SubFormConfig, SubFormController, TagsInputController, TextareaController, ValueCounter, apiOptionsType, DynamicForm as default };
