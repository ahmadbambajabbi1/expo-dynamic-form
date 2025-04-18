// src/components/controllers/SelectController.tsx
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
import SelectAxios from "../../utils/axiosConfig";
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

const SelectController = ({ controller, field, form }: PropsType) => {
  return controller?.options === "from-api" ? (
    <ApiOptionController controller={controller} field={field} form={form} />
  ) : (
    <StandardSelectController controller={controller} field={field} />
  );
};

export default SelectController;

const StandardSelectController = ({
  controller,
  field,
}: Omit<PropsType, "form">) => {
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState<{
    label: string;
    value: string;
  } | null>(null);

  useEffect(() => {
    if (
      field.value &&
      controller.options &&
      controller.options !== "from-api"
    ) {
      const option = controller.options.find(
        (opt) => opt.value === field.value
      );
      if (option) {
        setSelectedOption(option);
      }
    }
  }, [field.value, controller.options]);

  const handleSelect = (option: { label: string; value: string }) => {
    field.onChange(option.value);
    setSelectedOption(option);
    setModalVisible(false);
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
            !selectedOption && { color: theme.colors.textSecondary },
          ]}
        >
          {selectedOption
            ? selectedOption.label
            : controller.placeholder || "Select an option"}
        </Text>
        <Ionicons
          name="chevron-down"
          size={20}
          color={theme.colors.textSecondary}
        />
      </TouchableOpacity>

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
                {controller.label || "Select an option"}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={controller.options as { label: string; value: string }[]}
              keyExtractor={(item) => item.value}
              style={styles.optionsList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    { borderBottomColor: theme.colors.border },
                    selectedOption?.value === item.value && [
                      styles.selectedOption,
                      { backgroundColor: `${theme.colors.primary}10` },
                    ],
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      { color: theme.colors.text },
                      selectedOption?.value === item.value && [
                        styles.selectedOptionText,
                        { color: theme.colors.primary, fontWeight: "bold" },
                      ],
                    ]}
                  >
                    {item.label}
                  </Text>
                  {selectedOption?.value === item.value && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={theme.colors.primary}
                    />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const ApiOptionController = ({ controller, field, form }: PropsType) => {
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [optionsData, setOptionsData] = useState<any[]>([]);
  const [selectedOption, setSelectedOption] = useState<{
    label: string;
    value: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const dependantValue = useWatch({
    control: form?.control,
    name: controller?.optionsApiOptions?.dependingContrllerName || "",
    defaultValue: null,
  });

  useEffect(() => {
    fetchOptionsData();
  }, [dependantValue]);

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

      const res = await SelectAxios.get(
        controller?.optionsApiOptions?.api as any,
        {
          params: {
            [`filterBy${paramToCapitalize}Id`]: dependantValue,
            ...controller?.optionsApiOptions?.options?.params,
          },
        }
      );

      setOptionsData(res?.data?.data || []);

      const findSelected = res?.data?.data?.find(
        (item: any) =>
          item?.value === field?.value ||
          item?.value === controller?.defaultValue
      );

      if (!findSelected) {
        form.setValue(controller?.name || "", null);
        setSelectedOption(null);
      } else {
        form.setValue(controller?.name || "", controller?.defaultValue);
        setSelectedOption(findSelected);
      }
    } catch (error) {
      console.error("Error fetching select options:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleSelect = (option: { label: string; value: string }) => {
    field.onChange(option.value);
    setSelectedOption(option);
    setModalVisible(false);
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
            !selectedOption && { color: theme.colors.textSecondary },
            loading && {
              color: theme.colors.textSecondary,
              fontStyle: "italic",
            },
          ]}
        >
          {loading
            ? "Loading..."
            : selectedOption
            ? selectedOption.label
            : controller.placeholder || "Select an option"}
        </Text>
        <Ionicons
          name="chevron-down"
          size={20}
          color={theme.colors.textSecondary}
        />
      </TouchableOpacity>

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
                {controller.label || "Select an option"}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={{ color: theme.colors.textSecondary }}>
                  Loading options...
                </Text>
              </View>
            ) : (
              <FlatList
                data={optionsData}
                keyExtractor={(item) => item.value}
                style={styles.optionsList}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.optionItem,
                      { borderBottomColor: theme.colors.border },
                      selectedOption?.value === item.value && [
                        styles.selectedOption,
                        { backgroundColor: `${theme.colors.primary}10` },
                      ],
                    ]}
                    onPress={() => handleSelect(item)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        { color: theme.colors.text },
                        selectedOption?.value === item.value && [
                          styles.selectedOptionText,
                          { color: theme.colors.primary, fontWeight: "bold" },
                        ],
                      ]}
                    >
                      {item.label}
                    </Text>
                    {selectedOption?.value === item.value && (
                      <Ionicons
                        name="checkmark"
                        size={20}
                        color={theme.colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                )}
              />
            )}
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
  },
  placeholderText: {},
  loadingText: {
    fontStyle: "italic",
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
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
});
