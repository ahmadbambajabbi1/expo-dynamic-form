import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { FormControllerProps } from "../../types";
import { Ionicons } from "@expo/vector-icons";

type PropsType = {
  items?: Array<{ value: string; label: string }>;
  form: UseFormReturn<z.TypeOf<any>, any, undefined>;
  baseStyle?: any;
  checkBoxController: FormControllerProps;
  field?: {
    onChange: (value: any) => void;
    onBlur: () => void;
    value: any;
    name: string;
  };
};

// This component now only handles single checkboxes (not group-checkbox)
const CheckBoxController = ({ form, checkBoxController, field }: PropsType) => {
  // Initialize state for checkbox
  const [isChecked, setIsChecked] = useState(field?.value === true);

  useEffect(() => {
    // Initialize with boolean false if no value or empty string
    if (field?.value === "" || field?.value === undefined) {
      const defaultValue = checkBoxController.defaultValue === true;
      form.setValue(checkBoxController?.name as string, defaultValue);
      setIsChecked(defaultValue);
    } else {
      setIsChecked(field?.value === true);
    }
  }, [checkBoxController, field, form]);

  const handleToggle = () => {
    const newValue = !isChecked;
    setIsChecked(newValue);

    if (field?.onChange) {
      field.onChange(newValue);
    }

    form.setValue(checkBoxController?.name as string, newValue, {
      shouldValidate: true,
    });
  };

  return (
    <TouchableOpacity
      style={[styles.checkboxContainer, checkBoxController.style]}
      onPress={handleToggle}
    >
      <View
        style={[
          styles.checkbox,
          isChecked ? styles.checkboxChecked : styles.checkboxUnchecked,
        ]}
      >
        {isChecked && <Ionicons name="checkmark" size={16} color="#fff" />}
      </View>
      <Text style={styles.checkboxLabel}>
        {checkBoxController?.label || ""}
      </Text>
    </TouchableOpacity>
  );
};

export default CheckBoxController;

const styles = StyleSheet.create({
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  checkboxUnchecked: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  checkboxChecked: {
    backgroundColor: "#0077CC",
    borderWidth: 1,
    borderColor: "#0077CC",
  },
  checkboxLabel: {
    fontSize: 16,
  },
});
