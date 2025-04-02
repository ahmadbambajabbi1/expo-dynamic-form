import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { FormControllerProps } from "../../types";

type DateMode = "date" | "time" | "datetime";

type DateTimeControllerProps = {
  controller: FormControllerProps;
  field?: {
    onChange: (value: any) => void;
    onBlur: () => void;
    value: any;
    name: string;
  };
  form: UseFormReturn<z.TypeOf<any>, any, undefined>;
};

const DateTimeController = ({
  controller,
  field,
  form,
}: DateTimeControllerProps) => {
  const [showPicker, setShowPicker] = useState(false);
  const [mode, setMode] = useState<DateMode>(controller.dateMode || "date");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [tempDate, setTempDate] = useState<Date>(new Date());

  // Format options
  const dateFormatOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  const timeFormatOptions: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };

  const dateTimeFormatOptions: Intl.DateTimeFormatOptions = {
    ...dateFormatOptions,
    ...timeFormatOptions,
  };

  // Initialize date value
  useEffect(() => {
    // Use a safe default date for the picker
    const safeDefaultDate = new Date();
    setTempDate(safeDefaultDate);

    try {
      // If field already has a value, use it
      if (field?.value) {
        if (typeof field.value === "string") {
          try {
            const parsedDate = new Date(field.value);
            // Check if the parsed date is valid
            if (!isNaN(parsedDate.getTime())) {
              setSelectedDate(parsedDate);
              setTempDate(parsedDate);
            }
          } catch (e) {
            console.warn("Failed to parse date string:", e);
          }
        } else if (field.value instanceof Date) {
          if (!isNaN(field.value.getTime())) {
            setSelectedDate(field.value);
            setTempDate(field.value);
          }
        }
      } else if (controller.defaultValue) {
        // If controller has a default value
        let defaultDate;

        if (typeof controller.defaultValue === "string") {
          if (controller.defaultValue === "now") {
            defaultDate = new Date();
          } else {
            try {
              defaultDate = new Date(controller.defaultValue);
            } catch (e) {
              console.warn("Failed to parse default date:", e);
            }
          }
        } else if (controller.defaultValue instanceof Date) {
          defaultDate = controller.defaultValue;
        }

        if (defaultDate && !isNaN(defaultDate.getTime())) {
          setSelectedDate(defaultDate);
          setTempDate(defaultDate);

          if (field?.onChange) {
            field.onChange(defaultDate.toISOString());
          }
        }
      }
    } catch (error) {
      console.error("Error initializing date:", error);
    }
  }, [controller, field]);

  // Format date for display
  const formatDate = (date: Date | null) => {
    if (!date) return controller.placeholder || "Select...";

    try {
      let formatOptions: Intl.DateTimeFormatOptions;

      switch (controller.dateMode) {
        case "date":
          formatOptions = dateFormatOptions;
          break;
        case "time":
          formatOptions = timeFormatOptions;
          break;
        case "datetime":
          formatOptions = dateTimeFormatOptions;
          break;
        default:
          formatOptions = dateFormatOptions;
      }

      return new Intl.DateTimeFormat("en-US", formatOptions).format(date);
    } catch (error) {
      console.error("Error formatting date:", error);
      return controller.placeholder || "Select...";
    }
  };

  // Handle date change
  const onChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    // Make sure the selectedDate is valid
    if (!selectedDate || isNaN(selectedDate.getTime())) {
      console.warn("Invalid date selected");
      return;
    }

    if (Platform.OS === "android") {
      if (controller.dateMode === "datetime" && mode === "date") {
        // For datetime on Android, after selecting date, show the time picker
        setMode("time");
        setTempDate(selectedDate);
        return;
      }
      setShowPicker(false);
    }

    // For datetime mode, preserve the date or time component based on what's being selected
    if (controller.dateMode === "datetime") {
      try {
        const newTempDate = new Date(tempDate);

        if (mode === "date") {
          // Keep the time from tempDate but update the date
          newTempDate.setFullYear(selectedDate.getFullYear());
          newTempDate.setMonth(selectedDate.getMonth());
          newTempDate.setDate(selectedDate.getDate());
          setTempDate(newTempDate);

          if (Platform.OS === "ios") {
            // On iOS, switch to time mode after selecting date
            setMode("time");
            return;
          }
        } else if (mode === "time") {
          // Keep the date from tempDate but update the time
          newTempDate.setHours(selectedDate.getHours());
          newTempDate.setMinutes(selectedDate.getMinutes());
          setTempDate(newTempDate);

          if (Platform.OS === "android") {
            // On Android, after selecting time for datetime, confirm the selection
            confirmSelection(newTempDate);
            return;
          }
        }
      } catch (error) {
        console.error("Error updating date/time:", error);
      }
    } else {
      // For single mode (date or time), simply update the temp date
      setTempDate(selectedDate);
    }

    // For iOS, if we're in datetime mode, don't confirm until "Done" is pressed
    if (Platform.OS === "ios" && controller.dateMode === "datetime") {
      return;
    }

    // For Android with non-datetime mode, or for single mode on iOS, confirm immediately
    if (
      (Platform.OS === "android" && controller.dateMode !== "datetime") ||
      (Platform.OS === "ios" && controller.dateMode !== "datetime")
    ) {
      confirmSelection(selectedDate);
    }
  };

  // Handle showing the picker
  const showDatepicker = () => {
    setShowPicker(true);

    // Always start with date selection for datetime pickers
    if (controller.dateMode === "datetime") {
      setMode("date");
    } else {
      setMode(controller.dateMode || "date");
    }
  };

  // Confirm selection and update form value
  const confirmSelection = (date: Date) => {
    try {
      if (isNaN(date.getTime())) {
        console.warn("Trying to confirm an invalid date");
        return;
      }

      setSelectedDate(date);
      setShowPicker(false);

      if (field?.onChange) {
        field.onChange(date.toISOString());
      }

      form.setValue(controller.name as string, date.toISOString(), {
        shouldValidate: true,
      });
    } catch (error) {
      console.error("Error confirming date selection:", error);
    }
  };

  // Cancel selection
  const cancelSelection = () => {
    setShowPicker(false);
    // Reset temp date to current selected date
    if (selectedDate && !isNaN(selectedDate.getTime())) {
      setTempDate(selectedDate);
    } else {
      setTempDate(new Date());
    }
  };

  // Clear selected date
  const clearSelection = () => {
    setSelectedDate(null);

    if (field?.onChange) {
      field.onChange(null);
    }

    form.setValue(controller.name as string, null, {
      shouldValidate: true,
    });
  };

  // Render Android picker
  const renderAndroidPicker = () => {
    if (!showPicker) return null;

    try {
      return (
        <DateTimePicker
          value={isNaN(tempDate.getTime()) ? new Date() : tempDate}
          mode={mode}
          is24Hour={false}
          display="default"
          onChange={onChange}
        />
      );
    } catch (error) {
      console.error("Error rendering Android picker:", error);
      return null;
    }
  };

  // Render iOS picker
  const renderIOSPicker = () => {
    if (!showPicker) return null;

    try {
      return (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showPicker}
          onRequestClose={() => setShowPicker(false)}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={cancelSelection}>
                  <Text style={styles.modalCancel}>Cancel</Text>
                </TouchableOpacity>

                {controller.dateMode === "datetime" && (
                  <View style={styles.stepIndicator}>
                    <Text style={styles.stepText}>
                      {mode === "date" ? "Select Date" : "Select Time"}
                    </Text>
                    <View style={styles.stepsDotsContainer}>
                      <View
                        style={[
                          styles.stepDot,
                          mode === "date"
                            ? styles.activeStepDot
                            : styles.completedStepDot,
                        ]}
                      />
                      <View
                        style={[
                          styles.stepConnector,
                          mode === "time"
                            ? styles.activeStepConnector
                            : styles.inactiveStepConnector,
                        ]}
                      />
                      <View
                        style={[
                          styles.stepDot,
                          mode === "time"
                            ? styles.activeStepDot
                            : styles.inactiveStepDot,
                        ]}
                      />
                    </View>
                  </View>
                )}

                <TouchableOpacity
                  onPress={() => {
                    if (controller.dateMode === "datetime" && mode === "date") {
                      // If in datetime mode and currently on date selection, move to time selection
                      setMode("time");
                    } else {
                      // Otherwise confirm the selection
                      confirmSelection(tempDate);
                    }
                  }}
                >
                  <Text style={styles.modalDone}>
                    {controller.dateMode === "datetime" && mode === "date"
                      ? "Next"
                      : "Done"}
                  </Text>
                </TouchableOpacity>
              </View>

              <DateTimePicker
                value={isNaN(tempDate.getTime()) ? new Date() : tempDate}
                mode={mode}
                display="spinner"
                onChange={onChange}
                style={styles.iosPicker}
              />
            </View>
          </View>
        </Modal>
      );
    } catch (error) {
      console.error("Error rendering iOS picker:", error);
      return null;
    }
  };

  const getIconName = () => {
    switch (controller.dateMode) {
      case "date":
        return "calendar-outline";
      case "time":
        return "time-outline";
      case "datetime":
        return "calendar-outline";
      default:
        return "calendar-outline";
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.inputContainer, controller.style]}
        onPress={showDatepicker}
      >
        <View style={styles.iconContainer}>
          <Ionicons
            name={(controller.icon as any) || getIconName()}
            size={20}
            color="#666"
          />
        </View>

        <Text
          style={[styles.inputText, !selectedDate && styles.placeholderText]}
        >
          {formatDate(selectedDate)}
        </Text>

        {selectedDate && (
          <TouchableOpacity style={styles.clearButton} onPress={clearSelection}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {Platform.OS === "ios" ? renderIOSPicker() : renderAndroidPicker()}
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
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  iconContainer: {
    marginRight: 10,
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  placeholderText: {
    color: "#999",
  },
  clearButton: {
    padding: 4,
  },
  centeredView: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    backgroundColor: "#f8f8f8",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalCancel: {
    fontSize: 16,
    color: "#777",
  },
  modalDone: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0077CC",
  },
  stepIndicator: {
    alignItems: "center",
  },
  stepText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 6,
  },
  stepsDotsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  activeStepDot: {
    backgroundColor: "#0077CC",
  },
  completedStepDot: {
    backgroundColor: "#0077CC",
  },
  inactiveStepDot: {
    backgroundColor: "#ccc",
  },
  stepConnector: {
    width: 16,
    height: 2,
  },
  activeStepConnector: {
    backgroundColor: "#0077CC",
  },
  inactiveStepConnector: {
    backgroundColor: "#ccc",
  },
  iosPicker: {
    height: 200,
  },
});

export default DateTimeController;
