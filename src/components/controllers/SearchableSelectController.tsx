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
import Axios from "../../utils/axiosConfig";

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

  // Fetch options from API if needed
  useEffect(() => {
    if (controller?.optionsApiOptions?.api) {
      fetchOptions();
    } else if (controller.options && controller.options !== "from-api") {
      setOptions(controller.options);
      setFilteredOptions(controller.options);
    }
  }, [watchedValues, controller.options]);

  // Set selected option based on field value
  useEffect(() => {
    if (field.value && options.length > 0) {
      const option = options.find((opt) => opt.value === field.value);
      if (option) {
        setSelectedOption(option);
      }
    }
  }, [field.value, options]);

  // Filter options based on search
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
      const res = await Axios.get(controller.optionsApiOptions.api, {
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
        style={[styles.selectButton, controller.style]}
        onPress={() => setModalVisible(true)}
        disabled={loading}
      >
        <Text
          style={[
            styles.selectButtonText,
            !selectedOption && styles.placeholderText,
            loading && styles.loadingText,
          ]}
        >
          {loading
            ? "Loading..."
            : selectedOption
            ? selectedOption.label
            : controller.placeholder || "Select an option"}
        </Text>
        <Ionicons name="search" size={20} color="#666" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {controller.label || "Search and select"}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Ionicons
                name="search"
                size={20}
                color="#666"
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                value={search}
                onChangeText={setSearch}
                placeholder="Search..."
                autoCapitalize="none"
                clearButtonMode="while-editing"
              />
              {search !== "" && (
                <TouchableOpacity onPress={() => setSearch("")}>
                  <Ionicons name="close-circle" size={20} color="#666" />
                </TouchableOpacity>
              )}
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0077CC" />
                <Text style={styles.loadingText}>Loading options...</Text>
              </View>
            ) : filteredOptions.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
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
                      selectedOption?.value === item.value &&
                        styles.selectedOption,
                    ]}
                    onPress={() => handleSelect(item)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selectedOption?.value === item.value &&
                          styles.selectedOptionText,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {selectedOption?.value === item.value && (
                      <Ionicons name="checkmark" size={20} color="#0077CC" />
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
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    backgroundColor: "#fff",
    height: 46,
  },
  selectButtonText: {
    fontSize: 16,
    color: "#000",
    flex: 1,
  },
  placeholderText: {
    color: "#999",
  },
  loadingText: {
    color: "#666",
    fontStyle: "italic",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
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
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    margin: 10,
    paddingHorizontal: 10,
    backgroundColor: "#f9f9f9",
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
    borderBottomColor: "#f0f0f0",
  },
  selectedOption: {
    backgroundColor: "#f0f7ff",
  },
  optionText: {
    fontSize: 16,
  },
  selectedOptionText: {
    fontWeight: "bold",
    color: "#0077CC",
  },
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
    color: "#666",
    textAlign: "center",
  },
});

export default SearchableSelectController;
