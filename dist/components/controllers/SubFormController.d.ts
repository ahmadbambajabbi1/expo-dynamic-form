import React from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { FormControllerProps, StepsType } from "../../types";
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
export default SubFormController;
