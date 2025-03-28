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
declare const DateOfBirth: ({ controller, field }: PropsType) => JSX.Element;
export default DateOfBirth;
