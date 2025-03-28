import { ReactNode } from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { PropsPropsType, StepsType } from "../../types";
type PropsType = {
    steps?: StepsType<any>[];
    props?: PropsPropsType;
    form: UseFormReturn<z.TypeOf<any>, any, undefined>;
    stepPreview?: (value: any) => ReactNode;
    hideStepsIndication?: boolean;
    onSubmit: () => void;
};
declare const StepsHandler: ({ steps, form, props, stepPreview, hideStepsIndication, onSubmit, }: PropsType) => JSX.Element;
export default StepsHandler;
