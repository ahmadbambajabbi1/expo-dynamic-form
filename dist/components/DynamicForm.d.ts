import { ReactNode } from "react";
import { ZodSchema } from "zod";
import { FormControllerProps, PropsPropsType, DynamicFormHanldeSubmitParamType, StepsType, apiOptionsType, ModalType } from "../types";
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
export default DynamicForm;
