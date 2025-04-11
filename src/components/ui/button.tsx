import React, { ReactNode } from "react";
import {
  TouchableOpacity,
  Text,
  StyleProp,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "../../context/ThemeContext"; // Update path as needed

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

  const getButtonStyle = (): StyleProp<ViewStyle> => {
    const baseStyle = {
      height: 48,
      paddingHorizontal: 16,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row" as const,
    };

    const variantStyles = {
      default: {
        backgroundColor: theme.colors.primary,
      },
      primary: {
        backgroundColor: theme.colors.primary,
      },
      secondary: {
        backgroundColor: theme.colors.secondary,
      },
      outline: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: theme.colors.primary,
      },
      destructive: {
        backgroundColor: theme.colors.error,
      },
    };

    const disabledStyle = disabled
      ? {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        }
      : {};

    return [baseStyle as any, variantStyles[variant], disabledStyle, style];
  };

  const getTextStyle = (): StyleProp<TextStyle> => {
    const baseStyle = {
      fontSize: 16,
      fontWeight: "600" as const,
      textAlign: "center" as const,
    };

    const variantTextColors = {
      default: theme.colors.background,
      primary: theme.colors.background,
      secondary: theme.colors.background,
      outline: theme.colors.primary,
      destructive: theme.colors.background,
    };

    const disabledTextColor = disabled ? theme.colors.textSecondary : undefined;

    return [
      baseStyle,
      { color: variantTextColors[variant] },
      { color: disabledTextColor },
      textStyle,
    ];
  };

  const getLoaderColor = () => {
    if (disabled) return theme.colors.textSecondary;
    return variant === "outline"
      ? theme.colors.primary
      : theme.colors.background;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getLoaderColor()} />
      ) : typeof children === "string" ? (
        <Text style={getTextStyle()}>{children}</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
};
