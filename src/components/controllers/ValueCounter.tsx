// src/components/controllers/ValueCounter.tsx
import React from "react";
import { Text, StyleSheet } from "react-native";
import { useTheme } from "../../context/ThemeContext";

type PropsType = {
  value: string;
  maximun: number;
};

const ValueCounter = ({ value, maximun }: PropsType) => {
  const { theme } = useTheme();
  const count = maximun - (value ? value.length : 0);
  const isNegative = count < 0;

  return (
    <Text
      style={[
        styles.counter,
        { color: theme.colors.textSecondary },
        isNegative && { color: theme.colors.error },
      ]}
    >
      {count}
    </Text>
  );
};

const styles = StyleSheet.create({
  counter: {
    fontSize: 12,
  },
});

export default ValueCounter;
