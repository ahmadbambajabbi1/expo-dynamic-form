import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
} from "react-native";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { FormControllerProps } from "../../types";
import { Ionicons } from "@expo/vector-icons";

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

type CountryCodeType = {
  name: string;
  dial_code: string;
  code: string;
  flag: string;
};

type PhoneDataType = {
  countryCode: string;
  number: string;
  full: string;
  isValid: boolean;
};

const countryCodes: CountryCodeType[] = [
  { name: "Afghanistan", dial_code: "+93", code: "AF", flag: "🇦🇫" },
  { name: "Albania", dial_code: "+355", code: "AL", flag: "🇦🇱" },
  { name: "Algeria", dial_code: "+213", code: "DZ", flag: "🇩🇿" },
  { name: "United States", dial_code: "+1", code: "US", flag: "🇺🇸" },
  { name: "United Kingdom", dial_code: "+44", code: "GB", flag: "🇬🇧" },
  { name: "Germany", dial_code: "+49", code: "DE", flag: "🇩🇪" },
  { name: "France", dial_code: "+33", code: "FR", flag: "🇫🇷" },
  { name: "Italy", dial_code: "+39", code: "IT", flag: "🇮🇹" },
  { name: "Spain", dial_code: "+34", code: "ES", flag: "🇪🇸" },
  { name: "Japan", dial_code: "+81", code: "JP", flag: "🇯🇵" },
  { name: "China", dial_code: "+86", code: "CN", flag: "🇨🇳" },
  { name: "India", dial_code: "+91", code: "IN", flag: "🇮🇳" },
  { name: "Brazil", dial_code: "+55", code: "BR", flag: "🇧🇷" },
  { name: "Canada", dial_code: "+1", code: "CA", flag: "🇨🇦" },
  { name: "Australia", dial_code: "+61", code: "AU", flag: "🇦🇺" },
  { name: "Gambia", dial_code: "+220", code: "GM", flag: "🇬🇲" },
  { name: "Senegal", dial_code: "+221", code: "SN", flag: "🇸🇳" },
  { name: "Nigeria", dial_code: "+234", code: "NG", flag: "🇳🇬" },
  { name: "South Africa", dial_code: "+27", code: "ZA", flag: "🇿🇦" },
  { name: "Kenya", dial_code: "+254", code: "KE", flag: "🇰🇪" },
  { name: "Ghana", dial_code: "+233", code: "GH", flag: "🇬🇭" },
  { name: "Egypt", dial_code: "+20", code: "EG", flag: "🇪🇬" },
  { name: "Morocco", dial_code: "+212", code: "MA", flag: "🇲🇦" },
  { name: "Tanzania", dial_code: "+255", code: "TZ", flag: "🇹🇿" },
  { name: "Ethiopia", dial_code: "+251", code: "ET", flag: "🇪🇹" },
  { name: "Ivory Coast", dial_code: "+225", code: "CI", flag: "🇨🇮" },
];

const PhoneController = ({ controller, field, form }: PropsType) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<CountryCodeType>(
    // Default to United States
    countryCodes.find((country) => country.code === "US") || countryCodes[0]
  );
  const [phoneNumber, setPhoneNumber] = useState("");
  const [filteredCountries, setFilteredCountries] = useState(countryCodes);
  const [isFocused, setIsFocused] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize with pre-selected value if exists
    if (field.value) {
      try {
        if (typeof field.value === "object") {
          // It's already an object
          const phoneData = field.value as PhoneDataType;
          setSelectedCountry(
            countryCodes.find(
              (country) => country.dial_code === phoneData.countryCode
            ) || selectedCountry
          );
          setPhoneNumber(phoneData.number || "");
        } else if (typeof field.value === "string") {
          // Try to parse it in case it's still a JSON string (for backward compatibility)
          const phoneData = JSON.parse(field.value);
          setSelectedCountry(
            countryCodes.find(
              (country) => country.dial_code === phoneData.countryCode
            ) || selectedCountry
          );
          setPhoneNumber(phoneData.number || "");

          // Update form with object instead of string
          const updatedPhoneData = {
            countryCode: phoneData.countryCode,
            number: phoneData.number,
            full: phoneData.full,
            isValid: phoneData.isValid,
          };
          field.onChange(updatedPhoneData);
          form.setValue(controller?.name || "", updatedPhoneData, {
            shouldValidate: true,
          });
        }
      } catch (error) {
        // If it's not a JSON string, assume it's just a phone number
        setPhoneNumber(field.value);
      }
    } else {
      // Initialize with default values
      const defaultPhoneData = {
        countryCode: selectedCountry.dial_code,
        number: "",
        full: selectedCountry.dial_code,
        isValid: false,
      };
      field.onChange(defaultPhoneData);
      form.setValue(controller?.name || "", defaultPhoneData, {
        shouldValidate: true,
      });
    }
  }, []);

  // Update filter when search text changes
  useEffect(() => {
    if (searchText) {
      const filtered = countryCodes.filter(
        (country) =>
          country.name.toLowerCase().includes(searchText.toLowerCase()) ||
          country.dial_code.includes(searchText) ||
          country.code.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredCountries(filtered);
    } else {
      setFilteredCountries(countryCodes);
    }
  }, [searchText]);

  const validatePhoneNumber = (
    number: string,
    countryCode: string
  ): boolean => {
    if (!number) {
      setValidationError("Phone number is required");
      return false;
    }

    // Simple validation for demonstration purposes
    // US/Canada phone numbers should be 10 digits
    if (countryCode === "+1" && number.length !== 10) {
      setValidationError("US/Canada phone numbers must be 10 digits");
      return false;
    }

    // For other countries, just check that there are at least 5 digits
    if (number.length < 5) {
      setValidationError("Phone number is too short");
      return false;
    }

    setValidationError(null);
    return true;
  };

  const updateFormValue = (countryCode: string, number: string) => {
    const isValid = validatePhoneNumber(number, countryCode);

    const phoneData = {
      countryCode,
      number,
      full: countryCode + number,
      isValid,
    };

    // Return the object directly instead of a JSON string
    field.onChange(phoneData);
    form.setValue(controller?.name || "", phoneData, {
      shouldValidate: true,
    });
  };

  const selectCountry = (country: CountryCodeType) => {
    setSelectedCountry(country);
    setModalVisible(false);
    updateFormValue(country.dial_code, phoneNumber);
  };

  const handlePhoneChange = (text: string) => {
    // Format phone number to remove any non-digit character except for leading plus
    const formattedNumber = text.replace(/[^0-9]/g, "");

    // Store the clean number
    setPhoneNumber(formattedNumber);

    // Update the form value
    updateFormValue(selectedCountry.dial_code, formattedNumber);
  };

  const formatDisplayNumber = (number: string) => {
    // Format based on likely US or international format for display only
    if (selectedCountry.code === "US" || selectedCountry.code === "CA") {
      // Format for North America: (XXX) XXX-XXXX
      if (number.length > 6) {
        return `(${number.substring(0, 3)}) ${number.substring(
          3,
          6
        )}-${number.substring(6)}`;
      } else if (number.length > 3) {
        return `(${number.substring(0, 3)}) ${number.substring(3)}`;
      } else if (number.length > 0) {
        return `(${number}`;
      }
    } else {
      // Simple grouping for international numbers
      if (number.length > 6) {
        // Group into threes or fours depending on length
        const parts: string[] = [];
        let remaining = number;

        while (remaining.length > 0) {
          // Use substring which returns a string (not never)
          parts.push(remaining.substring(0, 3));
          remaining = remaining.substring(3);
        }

        return parts.join(" ");
      }
    }

    return number;
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          validationError ? styles.inputContainerError : null,
          controller.style,
        ]}
      >
        <TouchableOpacity
          style={styles.countryCodeButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.countryFlag}>{selectedCountry.flag}</Text>
          <Text style={styles.countryCode}>{selectedCountry.dial_code}</Text>
          <Ionicons name="chevron-down" size={16} color="#666" />
        </TouchableOpacity>

        <TextInput
          style={styles.phoneInput}
          value={formatDisplayNumber(phoneNumber)}
          onChangeText={handlePhoneChange}
          keyboardType="phone-pad"
          placeholder={controller.placeholder || "Phone number"}
          placeholderTextColor="#999"
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            field.onBlur();
          }}
        />
      </View>

      {validationError && (
        <Text style={styles.errorText}>{validationError}</Text>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country</Text>
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
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Search by country name or code"
                placeholderTextColor="#999"
                clearButtonMode="while-editing"
              />
            </View>

            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => item.code}
              style={styles.countriesList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.countryItem,
                    selectedCountry.code === item.code &&
                      styles.selectedCountryItem,
                  ]}
                  onPress={() => selectCountry(item)}
                >
                  <Text style={styles.countryFlag}>{item.flag}</Text>
                  <View style={styles.countryInfo}>
                    <Text style={styles.countryName}>{item.name}</Text>
                    <Text style={styles.countryDialCode}>{item.dial_code}</Text>
                  </View>
                  {selectedCountry.code === item.code && (
                    <Ionicons name="checkmark" size={20} color="#0077CC" />
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

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "#fff",
    height: 46,
  },
  inputContainerFocused: {
    borderColor: "#0077CC",
  },
  inputContainerError: {
    borderColor: "#FF3B30",
  },
  countryCodeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    height: "100%",
    borderRightWidth: 1,
    borderRightColor: "#eee",
  },
  countryFlag: {
    fontSize: 20,
    marginRight: 6,
  },
  countryCode: {
    fontSize: 14,
    color: "#333",
    marginRight: 4,
  },
  phoneInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 12,
    fontSize: 16,
    color: "#333",
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 12,
    marginTop: 5,
    marginLeft: 4,
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
  countriesList: {
    maxHeight: 400,
  },
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  selectedCountryItem: {
    backgroundColor: "#f0f7ff",
  },
  countryInfo: {
    flex: 1,
    marginLeft: 10,
  },
  countryName: {
    fontSize: 16,
    color: "#333",
  },
  countryDialCode: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
});

export default PhoneController;
