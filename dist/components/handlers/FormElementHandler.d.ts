import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { FormControllerProps, PropsPropsType } from "../../types";
type PropsType = {
    controller: FormControllerProps;
    form: UseFormReturn<z.TypeOf<any>, any, undefined>;
    props?: PropsPropsType;
};
declare const FormElementHandler: ({ controller, form, props }: PropsType) => JSX.Element;
export default FormElementHandler;
