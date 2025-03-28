import { StyleProp, ViewStyle } from "react-native";
type LoadingComponentProps = {
    size?: "small" | "large";
    color?: string;
    style?: StyleProp<ViewStyle>;
};
declare const LoadingComponent: ({ size, color, style, }: LoadingComponentProps) => JSX.Element;
export default LoadingComponent;
