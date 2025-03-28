import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  TextInput,
} from "react-native";
import { FormControllerProps } from "../../types";
import { Ionicons } from "@expo/vector-icons";
import { format, parse, isValid, isAfter, isBefore, subYears } from "date-fns";
import DateTimePicker from "@react-native-community/datetimepicker";

type PropsType = {
  field: {
    onChange: (value: any) => void;
    onBlur: () => void;
    value: any;
    name: string;
  };
  controller: FormControllerProps;
};

const DateOfBirth = ({ controller, field }: PropsType) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [tempDate, setTempDate] = useState<Date | null>(null);
  const [dateString, setDateString] = useState("");
  const [showAndroidPicker, setShowAndroidPicker] = useState(false);
  const [error, setError] = useState("");

  // Set maximum date to today
  const maxDate = new Date();
  // Set minimum date to 120 years ago
  const minDate = subYears(new Date(), 120);

  // Initialize with the field value if it exists
  useEffect(() => {
    if (field.value) {
      try {
        if (typeof field.value === "string") {
          // If it's already a string (like "11/11/2003"), use it directly
          setDateString(field.value);

          // Only try to create a Date object if the string is a complete date
          if (
            field.value.length === 10 &&
            field.value.split("/").length === 3
          ) {
            const parsedDate = parse(field.value, "MM/dd/yyyy", new Date());
            if (isValid(parsedDate)) {
              setTempDate(parsedDate);
            }
          }
        } else if (field.value instanceof Date) {
          // If it's a Date object, format it to a string
          setTempDate(field.value);
          setDateString(format(field.value, "MM/dd/yyyy"));
        }
      } catch (error) {
        console.error("Error initializing date value:", error);
      }
    }
  }, [field.value]);

  const validateAndUpdateDate = (dateStr: string) => {
    setError("");

    // Handle partial input or empty string
    if (dateStr.length < 10) {
      return;
    }

    try {
      // Parse the date string
      const parsedDate = parse(dateStr, "MM/dd/yyyy", new Date());

      // Check if the date is valid
      if (!isValid(parsedDate)) {
        setError("Please enter a valid date");
        return;
      }

      // Check if the date is in the future
      if (isAfter(parsedDate, maxDate)) {
        setError("Date cannot be in the future");
        return;
      }

      // Check if the date is too far in the past
      if (isBefore(parsedDate, minDate)) {
        setError("Date seems too far in the past");
        return;
      }

      // If all checks pass, update the temporary date
      setTempDate(parsedDate);

      // Update the form field value with the formatted string
      field.onChange(dateStr);
    } catch (err) {
      setError("Please enter date as MM/DD/YYYY");
    }
  };

  const handleConfirm = () => {
    if (tempDate) {
      // Convert to formatted string
      const formattedDate = format(tempDate, "MM/dd/yyyy");
      // Return the formatted string
      field.onChange(formattedDate);
      setDateString(formattedDate);
    }
    setModalVisible(false);
  };

  const handleCancel = () => {
    if (field.value) {
      try {
        if (typeof field.value === "string") {
          setDateString(field.value);

          // Only parse to Date if it's a complete date string
          if (
            field.value.length === 10 &&
            field.value.split("/").length === 3
          ) {
            const parsedDate = parse(field.value, "MM/dd/yyyy", new Date());
            if (isValid(parsedDate)) {
              setTempDate(parsedDate);
            } else {
              setTempDate(null);
            }
          } else {
            setTempDate(null);
          }
        } else if (field.value instanceof Date) {
          setTempDate(field.value);
          setDateString(format(field.value, "MM/dd/yyyy"));
        } else {
          setTempDate(null);
          setDateString("");
        }
      } catch (error) {
        console.error("Error resetting date:", error);
        setTempDate(null);
        setDateString("");
      }
    } else {
      setTempDate(null);
      setDateString("");
    }
    setModalVisible(false);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    // Prevent the modal from closing when a date is selected on Android
    if (Platform.OS === "android") {
      setShowAndroidPicker(false);
    }

    if (selectedDate) {
      setTempDate(selectedDate);
      const formattedDate = format(selectedDate, "MM/dd/yyyy");
      setDateString(formattedDate);
      setError("");
    }
  };

  const formatDisplayDate = (date: Date | null) => {
    if (!date) return "";
    try {
      return format(date, "MMMM d, yyyy");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  const showDatePicker = () => {
    if (Platform.OS === "android") {
      setShowAndroidPicker(true);
    }
  };

  // Handle direct input for the date string with improved auto-formatting
  const handleDateStringChange = (text: string) => {
    // Remove any non-digit characters from the input
    const digits = text.replace(/\D/g, "");

    // Start with empty formatted string
    let formatted = "";

    // Add digits and automatically add slashes
    if (digits.length > 0) {
      // Add first part (MM)
      formatted = digits.substring(0, Math.min(2, digits.length));

      // Add slash after MM if we have at least 2 digits
      if (digits.length >= 2) {
        formatted += "/";
      }

      // Add second part (DD)
      if (digits.length > 2) {
        formatted += digits.substring(2, Math.min(4, digits.length));

        // Add slash after DD if we have at least 4 digits
        if (digits.length >= 4) {
          formatted += "/";
        }
      }

      // Add third part (YYYY)
      if (digits.length > 4) {
        formatted += digits.substring(4, 8);
      }
    }

    // Update the displayed date string
    setDateString(formatted);

    // Return the formatted string to the form even if it's partial
    field.onChange(formatted);

    // If we have a complete date (8 digits), validate it
    if (digits.length === 8) {
      try {
        const month = parseInt(digits.substring(0, 2));
        const day = parseInt(digits.substring(2, 4));
        const year = parseInt(digits.substring(4, 8));

        // Do basic validation
        if (month > 0 && month <= 12 && day > 0 && day <= 31 && year >= 1900) {
          const dateObj = new Date(year, month - 1, day);

          // Make sure the date is valid (handles edge cases like Feb 30)
          if (dateObj.getMonth() === month - 1 && dateObj.getDate() === day) {
            setTempDate(dateObj);

            // Check if date is in allowed range
            if (isAfter(dateObj, maxDate)) {
              setError("Date cannot be in the future");
            } else if (isBefore(dateObj, minDate)) {
              setError("Date seems too far in the past");
            } else {
              setError("");
            }
            return;
          }
        }

        setError("Invalid date");
      } catch (err) {
        setError("Invalid date format");
      }
    } else {
      // Clear errors while typing partial dates
      setError("");
      // Don't set tempDate for partial inputs to avoid date parsing errors
      setTempDate(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={[styles.dateButton, controller.style]}
          onPress={() => setModalVisible(true)}
        >
          <TextInput
            style={styles.dateInput}
            value={dateString}
            onChangeText={handleDateStringChange}
            placeholder="MM/DD/YYYY"
            keyboardType="numeric"
            maxLength={10}
            editable={true}
            onFocus={() => {
              // Allow direct editing without opening modal
            }}
          />
          <Ionicons name="calendar" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {error !== "" && <Text style={styles.errorText}>{error}</Text>}

      {/* For Android, we need to show the date picker outside of the modal */}
      {Platform.OS === "android" && showAndroidPicker && (
        <DateTimePicker
          value={tempDate || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={maxDate}
          minimumDate={minDate}
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {controller.label || "Date of Birth"}
              </Text>
              <TouchableOpacity onPress={handleCancel}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <View style={styles.selectedDateContainer}>
              <Text style={styles.selectedDateLabel}>
                Enter your date of birth:
              </Text>

              <TextInput
                style={styles.dateInputModal}
                value={dateString}
                onChangeText={handleDateStringChange}
                placeholder="MM/DD/YYYY"
                keyboardType="numeric"
                maxLength={10}
              />

              {error !== "" && (
                <Text style={styles.errorTextModal}>{error}</Text>
              )}

              {tempDate && (
                <Text style={styles.selectedDateText}>
                  {formatDisplayDate(tempDate)}
                </Text>
              )}

              {Platform.OS === "android" ? (
                <TouchableOpacity
                  style={styles.changeDateButton}
                  onPress={showDatePicker}
                >
                  <Text style={styles.changeDateButtonText}>
                    Use Date Picker
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.datePickerContainer}>
                  <DateTimePicker
                    value={tempDate || new Date(2000, 0, 1)} // Default to Jan 1, 2000 if no date
                    mode="date"
                    display="spinner"
                    onChange={handleDateChange}
                    maximumDate={maxDate}
                    minimumDate={minDate}
                  />
                </View>
              )}
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  (!tempDate || error !== "") && styles.confirmButtonDisabled,
                ]}
                onPress={handleConfirm}
                disabled={!tempDate || error !== ""}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
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
  inputContainer: {
    width: "100%",
  },
  dateButton: {
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
  dateInput: {
    flex: 1,
    fontSize: 16,
    color: "#000",
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
    paddingBottom: 20,
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
  selectedDateContainer: {
    padding: 20,
    alignItems: "center",
  },
  selectedDateLabel: {
    fontSize: 16,
    marginBottom: 15,
    alignSelf: "flex-start",
  },
  dateInputModal: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 15,
    fontSize: 18,
    textAlign: "center",
    marginBottom: 10,
  },
  selectedDateText: {
    fontSize: 18,
    fontWeight: "500",
    marginVertical: 15,
    color: "#0077CC",
  },
  errorTextModal: {
    color: "#FF3B30",
    fontSize: 14,
    marginVertical: 5,
    alignSelf: "flex-start",
  },
  changeDateButton: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 15,
  },
  changeDateButtonText: {
    fontSize: 16,
    color: "#0077CC",
  },
  datePickerContainer: {
    width: "100%",
    marginTop: 15,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    marginTop: 15,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    marginRight: 10,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#333",
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "#0077CC",
    borderRadius: 5,
    marginLeft: 10,
    alignItems: "center",
  },
  confirmButtonDisabled: {
    backgroundColor: "#99CCE5",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default DateOfBirth;
