// src/components/controllers/TextareaController.tsx
import React, { useState } from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { FormControllerProps } from "../../types";
import { useTheme } from "../../context/ThemeContext";

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
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      <TextInput
        style={[
          styles.textarea,
          {
            height: (controller.rows || 4) * 20,
            color: theme.colors.text,
            borderColor: isFocused ? theme.colors.primary : theme.colors.border,
            backgroundColor: isFocused
              ? `${theme.colors.primary}05`
              : theme.colors.background,
          },
          controller.style,
        ]}
        placeholder={controller.placeholder}
        placeholderTextColor={theme.colors.textSecondary}
        value={field.value}
        onChangeText={field.onChange}
        onBlur={() => {
          setIsFocused(false);
          field.onBlur();
        }}
        onFocus={() => setIsFocused(true)}
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
    borderRadius: 5,
    padding: 10,
    width: "100%",
    fontSize: 16,
    textAlignVertical: "top",
    minHeight: 80,
  },
});

export default TextareaController;
