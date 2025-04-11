// src/components/controllers/CurrencyController.tsx
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
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { FormControllerProps } from "../../types";
import { Ionicons } from "@expo/vector-icons";
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

type CurrencyType = {
  code: string;
  name: string;
  symbol: string;
  flag?: string;
};

// Create a cache outside the component to store currency data
let currencyCache: CurrencyType[] = [];

// Default currencies to show when no API data is available
const defaultCurrencies: CurrencyType[] = [
  { code: "GMD", name: "Gambian Dalasi", symbol: "D", flag: "🇬🇲" },
  { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧" },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦", flag: "🇳🇬" },
  { code: "GHS", name: "Ghanaian Cedi", symbol: "₵", flag: "🇬🇭" },
  { code: "KES", name: "Kenyan Shilling", symbol: "KSh", flag: "🇰🇪" },
  { code: "ZAR", name: "South African Rand", symbol: "R", flag: "🇿🇦" },
  { code: "XOF", name: "West African CFA franc", symbol: "CFA", flag: "🇸🇳" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", flag: "🇨🇳" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", flag: "🇯🇵" },
  { code: "INR", name: "Indian Rupee", symbol: "₹", flag: "🇮🇳" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ", flag: "🇦🇪" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", flag: "🇸🇬" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", flag: "🇨🇦" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", flag: "🇦🇺" },
];

const CurrencyController = ({ controller, field, form }: PropsType) => {
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [currencies, setCurrencies] = useState<CurrencyType[]>([]);
  const [filteredCurrencies, setFilteredCurrencies] = useState<CurrencyType[]>(
    []
  );
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyType | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  // Fetch currencies or use cache
  useEffect(() => {
    const fetchCurrencies = async () => {
      // If cache is not empty, use it
      if (currencyCache.length > 0) {
        setCurrencies(currencyCache);
        setFilteredCurrencies(currencyCache);
        return;
      }

      setLoading(true);

      try {
        // Use default currencies
        currencyCache = defaultCurrencies;
        setCurrencies(defaultCurrencies);
        setFilteredCurrencies(defaultCurrencies);
      } catch (error) {
        console.error("Error fetching currencies:", error);
        // Fallback to default currencies on error
        currencyCache = defaultCurrencies;
        setCurrencies(defaultCurrencies);
        setFilteredCurrencies(defaultCurrencies);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrencies();
  }, []);

  // Initialize with default value or existing value
  useEffect(() => {
    if (currencies.length > 0) {
      // Set default to GMD if no value exists
      if (!field.value) {
        const defaultCurrency =
          currencies.find((c) => c.code === "GMD") || currencies[0];
        setSelectedCurrency(defaultCurrency);
        field.onChange(defaultCurrency.code);
        form.setValue(controller?.name || "", defaultCurrency.code, {
          shouldValidate: true,
        });
      } else {
        // Initialize with existing value
        const currencyCode =
          typeof field.value === "object" ? field.value.code : field.value;
        const currency = currencies.find((c) => c.code === currencyCode);

        if (currency) {
          setSelectedCurrency(currency);
        } else {
          // If currency not found, default to GMD
          const defaultCurrency =
            currencies.find((c) => c.code === "GMD") || currencies[0];
          setSelectedCurrency(defaultCurrency);
          field.onChange(defaultCurrency.code);
          form.setValue(controller?.name || "", defaultCurrency.code, {
            shouldValidate: true,
          });
        }
      }
    }
  }, [currencies, field.value]);

  // Filter currencies on search
  useEffect(() => {
    if (searchText) {
      const filtered = currencies.filter(
        (currency) =>
          currency.name.toLowerCase().includes(searchText.toLowerCase()) ||
          currency.code.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredCurrencies(filtered);
    } else {
      setFilteredCurrencies(currencies);
    }
  }, [searchText, currencies]);

  const handleSelectCurrency = (currency: CurrencyType) => {
    setSelectedCurrency(currency);
    field.onChange(currency.code);
    form.setValue(controller?.name || "", currency.code, {
      shouldValidate: true,
    });
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.currencyButton,
          {
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.background,
          },
          controller.style,
        ]}
        onPress={() => setModalVisible(true)}
        disabled={loading}
      >
        <View style={styles.selectedCurrencyContainer}>
          {selectedCurrency && (
            <>
              <Text style={styles.currencyFlag}>{selectedCurrency.flag}</Text>
              <Text style={[styles.currencyCode, { color: theme.colors.text }]}>
                {selectedCurrency.code}
              </Text>
              <Text
                style={[
                  styles.currencyName,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {selectedCurrency.name}
              </Text>
            </>
          )}
          {!selectedCurrency && (
            <Text
              style={[
                styles.placeholderText,
                { color: theme.colors.textSecondary },
              ]}
            >
              {loading
                ? "Loading currencies..."
                : controller.placeholder || "Select Currency"}
            </Text>
          )}
        </View>
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
                {controller.label || "Select Currency"}
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
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Search for currency"
                placeholderTextColor={theme.colors.textSecondary}
                clearButtonMode="while-editing"
              />
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
                  Loading currencies...
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredCurrencies}
                keyExtractor={(item) => item.code}
                style={styles.currencyList}
                renderItem={({ item }) => {
                  const isSelected = selectedCurrency?.code === item.code;
                  return (
                    <TouchableOpacity
                      style={[
                        styles.currencyItem,
                        { borderBottomColor: theme.colors.border },
                        isSelected && {
                          backgroundColor: `${theme.colors.primary}10`,
                        },
                      ]}
                      onPress={() => handleSelectCurrency(item)}
                    >
                      <View style={styles.currencyItemContent}>
                        <Text style={styles.currencyItemFlag}>{item.flag}</Text>
                        <View style={styles.currencyItemInfo}>
                          <Text
                            style={[
                              styles.currencyItemCode,
                              { color: theme.colors.text },
                            ]}
                          >
                            {item.code}
                          </Text>
                          <Text
                            style={[
                              styles.currencyItemName,
                              { color: theme.colors.textSecondary },
                            ]}
                          >
                            {item.name}
                          </Text>
                        </View>
                      </View>
                      <Text
                        style={[
                          styles.currencyItemSymbol,
                          { color: theme.colors.primary },
                        ]}
                      >
                        {item.symbol}
                      </Text>
                      {isSelected && (
                        <Ionicons
                          name="checkmark"
                          size={20}
                          color={theme.colors.primary}
                        />
                      )}
                    </TouchableOpacity>
                  );
                }}
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
  currencyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    height: 46,
  },
  selectedCurrencyContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  currencyFlag: {
    fontSize: 18,
    marginRight: 8,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  currencyName: {
    fontSize: 14,
    flex: 1,
  },
  placeholderText: {
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
  loadingContainer: {
    padding: 30,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  currencyList: {
    maxHeight: 400,
  },
  currencyItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    borderBottomWidth: 1,
  },
  currencyItemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  currencyItemFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  currencyItemInfo: {
    flex: 1,
  },
  currencyItemCode: {
    fontSize: 16,
    fontWeight: "600",
  },
  currencyItemName: {
    fontSize: 14,
  },
  currencyItemSymbol: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 10,
  },
});

export default CurrencyController;
