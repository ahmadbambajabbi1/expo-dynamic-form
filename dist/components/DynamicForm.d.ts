import { ReactNode } from "react";
import { ZodSchema } from "zod";
import { FormControllerProps, PropsPropsType, DynamicFormHanldeSubmitParamType, StepsType, apiOptionsType, ModalType } from "../types";
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
export default DynamicForm;
