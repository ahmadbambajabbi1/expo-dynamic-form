// src/components/ui/LoadingComponent.tsx
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  View,
  StyleProp,
  ViewStyle,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";

type LoadingComponentProps = {
  size?: "small" | "large";
  color?: string;
  style?: StyleProp<ViewStyle>;
};

const LoadingComponent = ({
  size = "small",
  color,
  style,
}: LoadingComponentProps) => {
  const { theme } = useTheme();

  // Use provided color or default to white
  const indicatorColor = color || theme.colors.secondary || "#ffffff";

  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={indicatorColor} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default LoadingComponent;
