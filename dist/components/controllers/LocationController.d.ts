import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { FormControllerProps } from "../../types";
type PropsType = {
    field: {
        onChange: (value: any) => void;
        onBlur: () => void;
        value: any;
        name: string;
    };
    controller: FormControllerProps;
    form: UseFormReturn<z.TypeOf<any>, any, undefined>;
};
declare const LocationController: ({ controller, field, form }: PropsType) => JSX.Element;
export default LocationController;
