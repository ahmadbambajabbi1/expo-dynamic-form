// src/components/controllers/MultiSelectController.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { UseFormReturn, useWatch } from "react-hook-form";
import { z } from "zod";
import { FormControllerProps } from "../../types";
import { Ionicons } from "@expo/vector-icons";
import Axios from "../../utils/axiosConfig";
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

type OptionType = { label: string; value: string };

const MultiSelectController = ({ controller, field, form }: PropsType) => {
  // const { theme } = useTheme();

  return controller.options === "from-api" ? (
    <ApiMultiSelectController
      controller={controller}
      field={field}
      form={form}
    />
  ) : (
    <StandardMultiSelectController
      controller={controller}
      field={field}
      form={form}
    />
  );
};

const StandardMultiSelectController = ({
  controller,
  field,
  form,
}: PropsType) => {
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<OptionType[]>([]);

  useEffect(() => {
    if (
      field.value &&
      controller.options &&
      controller.options !== "from-api"
    ) {
      if (typeof field.value === "string" && field.value.includes(",")) {
        const values = field.value.split(",");
        const options = values
          .map((value) => {
            return controller.options !== "from-api"
              ? controller?.options?.find((opt) => opt.value === value)
              : null;
          })
          .filter(Boolean) as OptionType[];

        setSelectedOptions(options);
      } else if (typeof field.value === "string" && field.value) {
        const option =
          (controller.options as any) !== "from-api"
            ? controller.options.find((opt) => opt.value === field.value)
            : null;

        if (option) {
          setSelectedOptions([option]);
        }
      }
    }
  }, [field.value, controller.options]);

  const toggleOption = (option: OptionType) => {
    let updatedOptions: OptionType[];

    // Check if this is an "All" option
    if (option.value.toLowerCase() === "all") {
      updatedOptions = [option];
    } else {
      // Check if option is already selected
      const isSelected = selectedOptions.some(
        (item) => item.value === option.value
      );

      // Remove any "All" option if present
      const filteredOptions = selectedOptions.filter(
        (item) => item.value.toLowerCase() !== "all"
      );

      if (isSelected) {
        // Remove the option
        updatedOptions = filteredOptions.filter(
          (item) => item.value !== option.value
        );
      } else {
        // Add the option
        updatedOptions = [...filteredOptions, option];
      }
    }

    setSelectedOptions(updatedOptions);

    // Update the form value
    const valueString = updatedOptions.map((option) => option.value).join(",");
    field.onChange(valueString);
    form.setValue(controller?.name || "", valueString, {
      shouldValidate: true,
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.selectButton,
          {
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.background,
          },
          controller.style,
        ]}
        onPress={() => setModalVisible(true)}
      >
        <Text
          style={[
            styles.selectButtonText,
            { color: theme.colors.text },
            selectedOptions.length === 0 && {
              color: theme.colors.textSecondary,
            },
          ]}
        >
          {selectedOptions.length > 0
            ? selectedOptions.map((opt) => opt.label).join(", ")
            : controller.placeholder || "Select options"}
        </Text>
        <Ionicons
          name="chevron-down"
          size={20}
          color={theme.colors.textSecondary}
        />
      </TouchableOpacity>

      {selectedOptions.length > 0 && (
        <View style={styles.chipsContainer}>
          {selectedOptions.map((option) => (
            <View
              key={option.value}
              style={[
                styles.chip,
                { backgroundColor: `${theme.colors.primary}15` },
              ]}
            >
              <Text style={[styles.chipText, { color: theme.colors.primary }]}>
                {option.label}
              </Text>
              <TouchableOpacity
                style={styles.chipRemove}
                onPress={() => toggleOption(option)}
              >
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.colors.background },
            ]}
          >
            <View
              style={[
                styles.modalHeader,
                { borderBottomColor: theme.colors.border },
              ]}
            >
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                {controller.label || "Select options"}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={controller.options as OptionType[]}
              keyExtractor={(item) => item.value}
              style={styles.optionsList}
              renderItem={({ item }) => {
                const isSelected = selectedOptions.some(
                  (option) => option.value === item.value
                );

                return (
                  <TouchableOpacity
                    style={[
                      styles.optionItem,
                      { borderBottomColor: theme.colors.border },
                      isSelected && {
                        backgroundColor: `${theme.colors.primary}10`,
                      },
                    ]}
                    onPress={() => toggleOption(item)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        { color: theme.colors.text },
                        isSelected && {
                          color: theme.colors.primary,
                          fontWeight: "bold",
                        },
                      ]}
                    >
                      {item.label}
                    </Text>

                    <View
                      style={[
                        styles.checkbox,
                        isSelected
                          ? {
                              backgroundColor: theme.colors.primary,
                              borderColor: theme.colors.primary,
                            }
                          : {
                              backgroundColor: theme.colors.background,
                              borderColor: theme.colors.border,
                            },
                      ]}
                    >
                      {isSelected && (
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              }}
            />

            <View
              style={[
                styles.modalFooter,
                { borderTopColor: theme.colors.border },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.doneButton,
                  { backgroundColor: theme.colors.primary },
                ]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const ApiMultiSelectController = ({ controller, field, form }: PropsType) => {
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [optionsData, setOptionsData] = useState<OptionType[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<OptionType[]>([]);
  const [loading, setLoading] = useState(false);

  const dependantValue = useWatch({
    control: form.control,
    name: controller.optionsApiOptions?.dependingContrllerName || "",
    defaultValue: null,
  });

  useEffect(() => {
    fetchOptionsData();
  }, [dependantValue]);

  useEffect(() => {
    if (field.value && optionsData.length > 0) {
      if (typeof field.value === "string" && field.value.includes(",")) {
        const values = field.value.split(",");
        const options = values
          .map((value) => {
            return optionsData.find((opt) => opt.value === value);
          })
          .filter(Boolean) as OptionType[];

        setSelectedOptions(options);
      } else if (typeof field.value === "string" && field.value) {
        const option = optionsData.find((opt) => opt.value === field.value);
        if (option) {
          setSelectedOptions([option]);
        }
      }
    }
  }, [field.value, optionsData]);

  async function fetchOptionsData() {
    if (!controller?.optionsApiOptions?.api) return;

    setLoading(true);
    try {
      const paramName =
        controller?.optionsApiOptions?.dependingContrllerName?.replace(
          "Id",
          ""
        );
      const paramToCapitalize = paramName
        ? paramName.charAt(0).toUpperCase() + paramName.slice(1)
        : "";

      const res = await Axios.get(controller?.optionsApiOptions?.api, {
        params: {
          [`filterBy${paramToCapitalize}Id`]: dependantValue,
          ...controller?.optionsApiOptions?.options?.params,
        },
      });

      setOptionsData(res?.data || []);

      // Handle existing selections
      if (field.value) {
        const values =
          typeof field.value === "string" && field.value.includes(",")
            ? field.value.split(",")
            : [field.value];

        const matchingOptions = values
          .map((value) => res?.data?.find((item: any) => item.value === value))
          .filter(Boolean);

        if (matchingOptions.length) {
          setSelectedOptions(matchingOptions);
        } else {
          // No matches found, reset selection
          form.setValue(controller?.name || "", "");
          setSelectedOptions([]);
        }
      }
    } catch (error) {
      console.error("Error fetching multi-select options:", error);
    } finally {
      setLoading(false);
    }
  }

  const toggleOption = (option: OptionType) => {
    let updatedOptions: OptionType[];

    // Check if this is an "All" option
    if (option.value.toLowerCase() === "all") {
      updatedOptions = [option];
    } else {
      // Check if option is already selected
      const isSelected = selectedOptions.some(
        (item) => item.value === option.value
      );

      // Remove any "All" option if present
      const filteredOptions = selectedOptions.filter(
        (item) => item.value.toLowerCase() !== "all"
      );

      if (isSelected) {
        // Remove the option
        updatedOptions = filteredOptions.filter(
          (item) => item.value !== option.value
        );
      } else {
        // Add the option
        updatedOptions = [...filteredOptions, option];
      }
    }

    setSelectedOptions(updatedOptions);

    // Update the form value
    const valueString = updatedOptions.map((option) => option.value).join(",");
    field.onChange(valueString);
    form.setValue(controller?.name || "", valueString, {
      shouldValidate: true,
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.selectButton,
          {
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.background,
          },
          controller.style,
        ]}
        onPress={() => setModalVisible(true)}
        disabled={loading}
      >
        <Text
          style={[
            styles.selectButtonText,
            { color: theme.colors.text },
            selectedOptions.length === 0 && {
              color: theme.colors.textSecondary,
            },
            loading && {
              color: theme.colors.textSecondary,
              fontStyle: "italic",
            },
          ]}
        >
          {loading
            ? "Loading..."
            : selectedOptions.length > 0
            ? selectedOptions.map((opt) => opt.label).join(", ")
            : controller.placeholder || "Select options"}
        </Text>
        <Ionicons
          name="chevron-down"
          size={20}
          color={theme.colors.textSecondary}
        />
      </TouchableOpacity>

      {selectedOptions.length > 0 && (
        <View style={styles.chipsContainer}>
          {selectedOptions.map((option) => (
            <View
              key={option.value}
              style={[
                styles.chip,
                { backgroundColor: `${theme.colors.primary}15` },
              ]}
            >
              <Text style={[styles.chipText, { color: theme.colors.primary }]}>
                {option.label}
              </Text>
              <TouchableOpacity
                style={styles.chipRemove}
                onPress={() => toggleOption(option)}
              >
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.colors.background },
            ]}
          >
            <View
              style={[
                styles.modalHeader,
                { borderBottomColor: theme.colors.border },
              ]}
            >
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                {controller.label || "Select options"}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text
                  style={[
                    styles.loadingText,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Loading options...
                </Text>
              </View>
            ) : (
              <FlatList
                data={optionsData}
                keyExtractor={(item) => item.value}
                style={styles.optionsList}
                renderItem={({ item }) => {
                  const isSelected = selectedOptions.some(
                    (option) => option.value === item.value
                  );

                  return (
                    <TouchableOpacity
                      style={[
                        styles.optionItem,
                        { borderBottomColor: theme.colors.border },
                        isSelected && {
                          backgroundColor: `${theme.colors.primary}10`,
                        },
                      ]}
                      onPress={() => toggleOption(item)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          { color: theme.colors.text },
                          isSelected && {
                            color: theme.colors.primary,
                            fontWeight: "bold",
                          },
                        ]}
                      >
                        {item.label}
                      </Text>

                      <View
                        style={[
                          styles.checkbox,
                          isSelected
                            ? {
                                backgroundColor: theme.colors.primary,
                                borderColor: theme.colors.primary,
                              }
                            : {
                                backgroundColor: theme.colors.background,
                                borderColor: theme.colors.border,
                              },
                        ]}
                      >
                        {isSelected && (
                          <Ionicons name="checkmark" size={16} color="#fff" />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                }}
              />
            )}

            <View
              style={[
                styles.modalFooter,
                { borderTopColor: theme.colors.border },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.doneButton,
                  { backgroundColor: theme.colors.primary },
                ]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    height: 46,
  },
  selectButtonText: {
    fontSize: 16,
    flex: 1,
  },
  placeholderText: {},
  loadingText: {
    fontStyle: "italic",
    marginTop: 10,
    fontSize: 16,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    fontSize: 14,
    marginRight: 4,
  },
  chipRemove: {
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  optionsList: {
    maxHeight: 300,
  },
  optionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
  },
  selectedOption: {},
  optionText: {
    fontSize: 16,
  },
  selectedOptionText: {},
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  checkboxUnchecked: {},
  checkboxChecked: {},
  loadingContainer: {
    padding: 30,
    alignItems: "center",
  },
  modalFooter: {
    padding: 15,
    borderTopWidth: 1,
    alignItems: "center",
  },
  doneButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  doneButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default MultiSelectController;
