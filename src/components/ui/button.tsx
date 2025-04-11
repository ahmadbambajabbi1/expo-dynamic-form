import React, { ReactNode } from "react";
import {
  TouchableOpacity,
  Text,
  StyleProp,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";

type ButtonProps = {
  children: ReactNode;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
  loading?: boolean;
  variant?: "default" | "primary" | "secondary" | "outline" | "destructive";
};

export const Button = ({
  children,
  onPress,
  style,
  textStyle,
  disabled = false,
  loading = false,
  variant = "default",
}: ButtonProps) => {
  const { theme } = useTheme();

  const getButtonStyle = () => {
    const baseStyle = {
      height: 48,
      paddingHorizontal: 16,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row" as const,
    };

    const variantStyles: Record<string, any> = {
      default: { backgroundColor: theme.colors.primary },
      primary: { backgroundColor: theme.colors.primary },
      secondary: { backgroundColor: theme.colors.secondary },
      outline: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: theme.colors.primary,
      },
      destructive: { backgroundColor: theme.colors.error },
    };

    const disabledStyle = {
      backgroundColor:
        disabled && variant !== "outline" ? "#cccccc" : undefined,
      borderColor: disabled && variant === "outline" ? "#cccccc" : undefined,
    };

    return [baseStyle, variantStyles[variant], disabledStyle, style];
  };

  const getTextStyle = () => {
    const baseTextStyle = {
      color: "#ffffff",
      fontSize: 16,
      fontWeight: "600" as const,
      textAlign: "center" as const,
    };

    const variantTextStyles: Record<string, any> = {
      outline: { color: theme.colors.primary },
    };

    const disabledTextStyle = {
      color: disabled ? "#999999" : undefined,
    };

    return [
      baseTextStyle,
      variantTextStyles[variant],
      disabledTextStyle,
      textStyle,
    ];
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#ffffff" />
      ) : typeof children === "string" ? (
        <Text style={getTextStyle()}>{children}</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
};
