import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { FormControllerProps, PropsPropsType } from "../../types";
type PropsType = {
    props?: PropsPropsType;
    controllers?: FormControllerProps[];
    form: UseFormReturn<z.TypeOf<any>, any, undefined>;
    onSubmit: () => void;
    isStepMode?: boolean;
};
declare const NormalHandler: ({ props, controllers, form, onSubmit, isStepMode, }: PropsType) => JSX.Element;
export default NormalHandler;
