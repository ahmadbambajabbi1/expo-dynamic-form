import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  View,
  StyleProp,
  ViewStyle,
} from "react-native";

type LoadingComponentProps = {
  size?: "small" | "large";
  color?: string;
  style?: StyleProp<ViewStyle>;
};

const LoadingComponent = ({
  size = "small",
  color = "#ffffff",
  style,
}: LoadingComponentProps) => {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={color} />
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
