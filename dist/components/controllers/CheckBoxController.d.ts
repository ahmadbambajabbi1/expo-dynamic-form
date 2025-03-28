import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { FormControllerProps } from "../../types";
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
export default CheckBoxController;
