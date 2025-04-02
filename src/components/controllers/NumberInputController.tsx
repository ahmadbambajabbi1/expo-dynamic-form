import React, { useState, useCallback, useEffect, memo } from "react";
import { View, TextInput, StyleSheet, Platform } from "react-native";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { FormControllerProps } from "../../types";

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

// Debounce function to limit how often the value updates
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const NumberInputControllerComponent = ({
  controller,
  field,
  form,
}: PropsType) => {
  // Initialize with current value or empty string
  const [localValue, setLocalValue] = useState<string>(
    field.value !== undefined && field.value !== null ? String(field.value) : ""
  );

  // Debounce the local value to reduce form updates
  const debouncedValue = useDebounce(localValue, 300);

  // Update form value when debounced value changes
  useEffect(() => {
    if (debouncedValue === "") {
      field.onChange(null);
      form.setValue(controller?.name || "", null, {
        shouldValidate: true,
        shouldDirty: true,
      });
    } else {
      const numValue = Number(debouncedValue);
      field.onChange(numValue);
      form.setValue(controller?.name || "", numValue, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [debouncedValue, field, form, controller?.name]);

  // Memoized change handler
  const handleChangeText = useCallback((text: string) => {
    // Only allow digits and at most one decimal point
    const filtered = text.replace(/[^0-9.]/g, "");

    // Handle multiple decimal points
    const parts = filtered.split(".");
    const formatted =
      parts.length > 1 ? `${parts[0]}.${parts.slice(1).join("")}` : filtered;

    setLocalValue(formatted);
  }, []);

  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      <TextInput
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          controller.style,
        ]}
        value={localValue}
        onChangeText={handleChangeText}
        keyboardType="numeric"
        placeholder={controller.placeholder || "Enter a number"}
        placeholderTextColor="#999"
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
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  inputFocused: {
    borderColor: "#0077CC",
    backgroundColor: "#f0f7ff",
  },
});

// Use memo to prevent unnecessary re-renders
const NumberInputController = memo(NumberInputControllerComponent);

export default NumberInputController;
