import { ReactNode } from "react";
import { StyleProp, ViewStyle, TextStyle } from "react-native";
type ButtonProps = {
    children: ReactNode;
    onPress: () => void;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    disabled?: boolean;
    loading?: boolean;
    variant?: "default" | "primary" | "secondary" | "outline" | "destructive";
};
export declare const Button: ({ children, onPress, style, textStyle, disabled, loading, variant, }: ButtonProps) => JSX.Element;
export {};
