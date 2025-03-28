import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { FormControllerProps } from "../../types";
import { Ionicons } from "@expo/vector-icons";

type PropsItemsType = {
  value: string;
  label: string;
};

type PropsType = {
  items?: PropsItemsType[];
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

const CheckBoxController = ({
  items,
  form,
  baseStyle,
  checkBoxController,
  field,
}: PropsType) => {
  useEffect(() => {
    // Initialize default values for checkboxes if necessary
    if (checkBoxController.defaultValue) {
      form.setValue(
        checkBoxController?.name as string,
        checkBoxController.defaultValue
      );
    }
  }, [form, checkBoxController]);

  return checkBoxController.type === "checkbox" ? (
    <SingleCheckBoxHandler
      checkBoxController={checkBoxController}
      form={form}
      field={field}
    />
  ) : (
    <View style={[styles.container, baseStyle]}>
      {items &&
        items.map((item) => (
          <GroupCheckBoxItem
            key={item.value}
            item={item}
            form={form}
            checkBoxController={checkBoxController}
          />
        ))}
    </View>
  );
};

export default CheckBoxController;

const SingleCheckBoxHandler = ({
  checkBoxController,
  form,
  field,
}: PropsType) => {
  const handleToggle = () => {
    const newValue = !field?.value;
    field?.onChange(newValue);
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
          field?.value ? styles.checkboxChecked : styles.checkboxUnchecked,
        ]}
      >
        {field?.value && <Ionicons name="checkmark" size={16} color="#fff" />}
      </View>
      <Text style={styles.checkboxLabel}>
        {checkBoxController?.label || ""}
      </Text>
    </TouchableOpacity>
  );
};

const GroupCheckBoxItem = ({
  item,
  form,
  checkBoxController,
}: {
  item: PropsItemsType;
  form: UseFormReturn<z.TypeOf<any>, any, undefined>;
  checkBoxController: FormControllerProps;
}) => {
  const values = form.getValues(checkBoxController?.name as string) || [];
  const isChecked = Array.isArray(values) ? values.includes(item.value) : false;

  const handleToggle = () => {
    const currentValues =
      form.getValues(checkBoxController?.name as string) || [];
    const updatedValues = isChecked
      ? currentValues.filter((value: string) => value !== item.value)
      : [...currentValues, item.value];

    form.setValue(checkBoxController?.name as string, updatedValues, {
      shouldValidate: true,
    });
  };

  return (
    <TouchableOpacity style={styles.checkboxContainer} onPress={handleToggle}>
      <View
        style={[
          styles.checkbox,
          isChecked ? styles.checkboxChecked : styles.checkboxUnchecked,
        ]}
      >
        {isChecked && <Ionicons name="checkmark" size={16} color="#fff" />}
      </View>
      <Text style={styles.checkboxLabel}>{item.label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
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
