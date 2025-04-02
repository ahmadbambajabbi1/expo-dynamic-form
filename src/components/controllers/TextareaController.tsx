import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
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

const TextareaController = ({ controller, field }: PropsType) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={[
          styles.textarea,
          { height: (controller.rows || 4) * 20 },
          controller.style,
        ]}
        placeholder={controller.placeholder}
        value={field.value}
        onChangeText={field.onChange}
        onBlur={field.onBlur}
        multiline
        textAlignVertical="top"
        numberOfLines={controller.rows || 4}
        maxLength={controller.maximun}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  textarea: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    width: "100%",
    backgroundColor: "#fff",
    fontSize: 16,
    textAlignVertical: "top",
    minHeight: 80,
  },
});

export default TextareaController;
