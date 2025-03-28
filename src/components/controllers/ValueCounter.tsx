import React from "react";
import { Text, StyleSheet } from "react-native";

type PropsType = {
  value: string;
  maximun: number;
};

const ValueCounter = ({ value, maximun }: PropsType) => {
  const count = maximun - (value ? value.length : 0);

  return (
    <Text style={[styles.counter, count < 0 && styles.negative]}>{count}</Text>
  );
};

const styles = StyleSheet.create({
  counter: {
    fontSize: 12,
    color: "#666",
  },
  negative: {
    color: "red",
  },
});

export default ValueCounter;
