import React, { ReactNode } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from "react-native";

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
  // Determine button styles based on variant
  const getButtonStyle = () => {
    switch (variant) {
      case "primary":
        return [
          styles.button,
          styles.primaryButton,
          disabled && styles.disabledButton,
          style,
        ];
      case "secondary":
        return [
          styles.button,
          styles.secondaryButton,
          disabled && styles.disabledButton,
          style,
        ];
      case "outline":
        return [
          styles.button,
          styles.outlineButton,
          disabled && styles.disabledOutlineButton,
          style,
        ];
      case "destructive":
        return [
          styles.button,
          styles.destructiveButton,
          disabled && styles.disabledButton,
          style,
        ];
      default:
        return [
          styles.button,
          styles.defaultButton,
          disabled && styles.disabledButton,
          style,
        ];
    }
  };

  // Determine text styles based on variant
  const getTextStyle = () => {
    switch (variant) {
      case "outline":
        return [
          styles.buttonText,
          styles.outlineButtonText,
          disabled && styles.disabledButtonText,
          textStyle,
        ];
      default:
        return [
          styles.buttonText,
          disabled && styles.disabledButtonText,
          textStyle,
        ];
    }
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

const styles = StyleSheet.create({
  button: {
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  defaultButton: {
    backgroundColor: "#0077CC",
  },
  primaryButton: {
    backgroundColor: "#0077CC",
  },
  secondaryButton: {
    backgroundColor: "#6c757d",
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#0077CC",
  },
  destructiveButton: {
    backgroundColor: "#dc3545",
  },
  disabledButton: {
    backgroundColor: "#cccccc",
  },
  disabledOutlineButton: {
    borderColor: "#cccccc",
    backgroundColor: "transparent",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  outlineButtonText: {
    color: "#0077CC",
  },
  disabledButtonText: {
    color: "#999999",
  },
});
