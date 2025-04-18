import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { UseFormReturn, useWatch } from "react-hook-form";
import { z } from "zod";
import { FormControllerProps } from "../../types";
import { Ionicons } from "@expo/vector-icons";
import SearchableAxios from "../../utils/axiosConfig";
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

const SearchableSelectController = ({ controller, field, form }: PropsType) => {
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<OptionType[]>([]);
  const [filteredOptions, setFilteredOptions] = useState<OptionType[]>([]);
  const [selectedOption, setSelectedOption] = useState<OptionType | null>(null);
  const [loading, setLoading] = useState(false);

  const watchedValues = useWatch({
    control: form.control,
    name: controller.willNeedControllersNames || [],
  });

  const dependantValues = controller?.willNeedControllersNames?.reduce(
    (acc, name, index) => {
      acc[name] = watchedValues?.[index] ?? null;
      return acc;
    },
    {} as Record<string, any>
  );

  useEffect(() => {
    if (controller?.optionsApiOptions?.api) {
      fetchOptions();
    } else if (controller.options && controller.options !== "from-api") {
      setOptions(controller.options);
      setFilteredOptions(controller.options);
    }
  }, [watchedValues, controller.options]);

  useEffect(() => {
    if (field.value && options.length > 0) {
      const option = options.find((opt) => opt.value === field.value);
      if (option) {
        setSelectedOption(option);
      }
    }
  }, [field.value, options]);

  useEffect(() => {
    if (search && options.length > 0) {
      const filtered = options.filter((option) =>
        option.label.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(options);
    }
  }, [search, options]);

  const fetchOptions = async () => {
    if (!controller?.optionsApiOptions?.api) return;

    setLoading(true);
    try {
      const res = await SearchableAxios.get(controller.optionsApiOptions.api, {
        params: {
          ...dependantValues,
          ...controller?.optionsApiOptions?.options?.params,
        },
      });

      if (res?.data?.data) {
        setOptions(res.data.data);
        setFilteredOptions(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching searchable select options:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (option: OptionType) => {
    setSelectedOption(option);
    field.onChange(option.value);
    form.setValue(controller?.name || "", option.value, {
      shouldValidate: true,
    });
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
        <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
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
                {controller.label || "Search and select"}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.searchContainer,
                {
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surface,
                },
              ]}
            >
              <Ionicons
                name="search"
                size={20}
                color={theme.colors.textSecondary}
                style={styles.searchIcon}
              />
              <TextInput
                style={[styles.searchInput, { color: theme.colors.text }]}
                value={search}
                onChangeText={setSearch}
                placeholder="Search..."
                placeholderTextColor={theme.colors.textSecondary}
                autoCapitalize="none"
                clearButtonMode="while-editing"
              />
              {search !== "" && (
                <TouchableOpacity onPress={() => setSearch("")}>
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              )}
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
            ) : filteredOptions.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text
                  style={[
                    styles.emptyText,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {controller?.emptyIndicator || "No options found"}
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredOptions}
                keyExtractor={(item) => item.value}
                style={styles.optionsList}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.optionItem,
                      { borderBottomColor: theme.colors.border },
                      selectedOption?.value === item.value && {
                        backgroundColor: `${theme.colors.primary}10`,
                      },
                    ]}
                    onPress={() => handleSelect(item)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        { color: theme.colors.text },
                        selectedOption?.value === item.value && {
                          color: theme.colors.primary,
                          fontWeight: "bold",
                        },
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
    flex: 1,
  },
  placeholderText: {},
  loadingText: {
    fontStyle: "italic",
    marginTop: 10,
    fontSize: 16,
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 5,
    margin: 10,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
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
    padding: 30,
    alignItems: "center",
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
});

export default SearchableSelectController;
