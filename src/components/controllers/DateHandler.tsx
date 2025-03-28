import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
} from "react-native";
import { FormControllerProps } from "../../types";
import { Ionicons } from "@expo/vector-icons";
import { format, addDays } from "date-fns";
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

const DateHandler = ({ controller, field }: PropsType) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [tempDate, setTempDate] = useState<Date | null>(
    field.value ? new Date(field.value) : new Date()
  );
  // Android requires a separate state to show/hide the date picker
  const [showAndroidPicker, setShowAndroidPicker] = useState(false);

  const handleConfirm = () => {
    if (tempDate) {
      field.onChange(tempDate);
    }
    setModalVisible(false);
  };

  const handleCancel = () => {
    setTempDate(field.value ? new Date(field.value) : new Date());
    setModalVisible(false);
  };

  const handleQuickSelect = (days: number) => {
    const newDate = addDays(new Date(), days);
    setTempDate(newDate);
    field.onChange(newDate);
    setModalVisible(false);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    // Prevent the modal from closing when a date is selected
    if (Platform.OS === "android") {
      setShowAndroidPicker(false);
    }

    if (selectedDate) {
      setTempDate(selectedDate);
    }
  };

  const formatDisplayDate = (date: Date | null) => {
    if (!date) return "Select a date";

    try {
      return format(date, "PPP");
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

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.dateButton, controller.style]}
        onPress={() => setModalVisible(true)}
      >
        <Text
          style={[
            styles.dateButtonText,
            !field.value && styles.placeholderText,
          ]}
        >
          {field.value
            ? formatDisplayDate(new Date(field.value))
            : controller.placeholder || "Select a date"}
        </Text>
        <Ionicons name="calendar" size={20} color="#666" />
      </TouchableOpacity>

      {/* For Android, we need to show the date picker outside of the modal */}
      {Platform.OS === "android" && showAndroidPicker && (
        <DateTimePicker
          value={tempDate || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={
            typeof controller.disabled === "function"
              ? undefined
              : controller.disabled
              ? new Date()
              : undefined
          }
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
                {controller.label || "Select Date"}
              </Text>
              <TouchableOpacity onPress={handleCancel}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <View style={styles.quickOptionsContainer}>
              <TouchableOpacity
                style={styles.quickOption}
                onPress={() => handleQuickSelect(0)}
              >
                <Text style={styles.quickOptionText}>Today</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickOption}
                onPress={() => handleQuickSelect(1)}
              >
                <Text style={styles.quickOptionText}>Tomorrow</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickOption}
                onPress={() => handleQuickSelect(7)}
              >
                <Text style={styles.quickOptionText}>Next Week</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickOption}
                onPress={() => handleQuickSelect(30)}
              >
                <Text style={styles.quickOptionText}>Next Month</Text>
              </TouchableOpacity>
            </View>

            {/* Show the currently selected date */}
            <View style={styles.selectedDateContainer}>
              <Text style={styles.selectedDateText}>
                {formatDisplayDate(tempDate)}
              </Text>
              {Platform.OS === "android" ? (
                <TouchableOpacity
                  style={styles.changeDateButton}
                  onPress={showDatePicker}
                >
                  <Text style={styles.changeDateButtonText}>Change Date</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.datePickerContainer}>
                  <DateTimePicker
                    value={tempDate || new Date()}
                    mode="date"
                    display="spinner"
                    onChange={handleDateChange}
                    minimumDate={
                      typeof controller.disabled === "function"
                        ? undefined
                        : controller.disabled
                        ? new Date()
                        : undefined
                    }
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
                style={styles.confirmButton}
                onPress={handleConfirm}
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
  dateButtonText: {
    fontSize: 16,
    color: "#000",
  },
  placeholderText: {
    color: "#999",
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
  quickOptionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  quickOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    marginBottom: 10,
  },
  quickOptionText: {
    fontSize: 14,
  },
  datePickerContainer: {
    paddingVertical: 10,
  },
  selectedDateContainer: {
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  selectedDateText: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 10,
  },
  changeDateButton: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  changeDateButtonText: {
    fontSize: 16,
    color: "#0077CC",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    marginTop: 10,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
  },
  cancelButtonText: {
    fontSize: 16,
  },
  confirmButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#0077CC",
    borderRadius: 5,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default DateHandler;
