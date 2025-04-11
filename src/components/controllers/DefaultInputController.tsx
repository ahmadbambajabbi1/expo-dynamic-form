// src/components/controllers/DefaultInputController.tsx
import React, { useState } from "react";
import { StyleSheet, TextInput, View, TouchableOpacity } from "react-native";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { Ionicons } from "@expo/vector-icons";
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

const DefaultInputController = ({ controller, field, form }: PropsType) => {
  const { theme } = useTheme();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const inputStyle =
    controller.type === "checkbox"
      ? [
          styles.input,
          styles.checkboxInput,
          {
            color: theme.colors.text,
            borderColor: theme.colors.border,
          },
          controller.style,
        ]
      : [
          styles.input,
          {
            color: theme.colors.text,
            borderColor: theme.colors.border,
          },
          controller.style,
        ];

  const keyboardType = (() => {
    switch (controller.type) {
      case "email":
        return "email-address";
      case "number":
        return "numeric";
      default:
        return "default";
    }
  })();

  const secureTextEntry = controller.type === "password" && !isPasswordVisible;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputContainer,
          isFocused && [
            styles.inputFocused,
            {
              borderColor: theme.colors.primary,
              backgroundColor: `${theme.colors.primary}10`,
            },
          ],
          {
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
          },
        ]}
      >
        {controller.icon && (
          <Ionicons
            name={controller.icon as any}
            size={20}
            color={theme.colors.textSecondary}
            style={styles.icon}
          />
        )}

        <TextInput
          style={inputStyle}
          placeholder={controller.placeholder}
          placeholderTextColor={theme.colors.textSecondary}
          value={
            typeof field.value === "string"
              ? field.value
              : field.value?.toString()
          }
          onChangeText={(text) => {
            const value = controller.type === "number" ? Number(text) : text;
            field.onChange(value);
            form.setValue(controller?.name || "", value, {
              shouldValidate: true,
              shouldDirty: true,
            });
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            field.onBlur();
          }}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          maxLength={controller.maximun}
          multiline={controller.rows ? true : false}
          numberOfLines={controller.rows || 1}
        />

        {controller.type === "password" && (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={styles.visibilityToggle}
          >
            <Ionicons
              name={isPasswordVisible ? "eye-off" : "eye"}
              size={20}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    height: 50,
  },
  inputFocused: {},
  inputError: {},
  icon: {
    marginLeft: 12,
  },
  input: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: "transparent",
    borderWidth: 0,
  },
  checkboxInput: {
    width: 20,
    height: 20,
  },
  visibilityToggle: {
    padding: 12,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default DefaultInputController;
