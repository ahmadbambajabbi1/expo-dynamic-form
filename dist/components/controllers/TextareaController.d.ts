import { FormControllerProps } from "../../types";
type PropsType = {
    field: {
        onChange: (value: any) => void;
        onBlur: () => void;
        value: any;
        name: string;
    };
    controller: FormControllerProps;
};
declare const TextareaController: ({ controller, field }: PropsType) => JSX.Element;
export default TextareaController;
