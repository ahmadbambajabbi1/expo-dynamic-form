// src/components/controllers/NumberInputController.tsx
import React, { useState, useCallback, memo } from "react";
import { View, TextInput, StyleSheet, Platform } from "react-native";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
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
  form: UseFormReturn<z.TypeOf<any>, any, undefined>;
};

const NumberInputControllerComponent = ({
  controller,
  field,
  form,
}: PropsType) => {
  const { theme } = useTheme();

  // Initialize with current value or empty string
  const [localValue, setLocalValue] = useState<string>(
    field.value !== undefined && field.value !== null ? String(field.value) : ""
  );

  // Change handler - directly updates the form now without debounce
  const handleChangeText = useCallback(
    (text: string) => {
      // Only allow digits and at most one decimal point
      const filtered = text.replace(/[^0-9.]/g, "");

      // Handle multiple decimal points
      const parts = filtered.split(".");
      const formatted =
        parts.length > 1 ? `${parts[0]}.${parts.slice(1).join("")}` : filtered;

      // Update local state
      setLocalValue(formatted);

      // Update form value immediately
      if (formatted === "") {
        field.onChange(null);
        form.setValue(controller?.name || "", null, {
          shouldValidate: true,
          shouldDirty: true,
        });
      } else {
        const numValue = Number(formatted);
        field.onChange(numValue);
        form.setValue(controller?.name || "", numValue, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    },
    [field, form, controller?.name]
  );

  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      <TextInput
        style={[
          styles.input,
          {
            borderColor: isFocused ? theme.colors.primary : theme.colors.border,
            backgroundColor: isFocused
              ? `${theme.colors.primary}05`
              : theme.colors.background,
            color: theme.colors.text,
          },
          isFocused && styles.inputFocused,
          controller.style,
        ]}
        value={localValue}
        onChangeText={handleChangeText}
        keyboardType="numeric"
        placeholder={controller.placeholder || "Enter a number"}
        placeholderTextColor={theme.colors.textSecondary}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          field.onBlur();
        }}
        maxLength={controller.maximun}
        // Performance optimizations
        renderToHardwareTextureAndroid={true}
        contextMenuHidden={Platform.OS === "ios"}
        autoCapitalize="none"
        spellCheck={false}
        autoCorrect={false}
        returnKeyType="done"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  inputFocused: {},
});

// Use memo to prevent unnecessary re-renders
const NumberInputController = memo(NumberInputControllerComponent);

export default NumberInputController;
