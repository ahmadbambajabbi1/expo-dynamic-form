import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Platform,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from "react-native";
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
};

const DateOfBirth = ({ controller, field }: PropsType) => {
  // Separate state for month, day, and year
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [year, setYear] = useState("");
  const [error, setError] = useState("");

  // References for the text inputs
  const monthRef = useRef<TextInput>(null);
  const dayRef = useRef<TextInput>(null);
  const yearRef = useRef<TextInput>(null);

  // Initialize from field value
  useEffect(() => {
    if (field.value && typeof field.value === "string") {
      const parts = field.value.split("/");
      if (parts.length === 3) {
        setMonth(parts[0] || "");
        setDay(parts[1] || "");
        setYear(parts[2] || "");
      }
    }
  }, [field.value]);

  // Update the form field whenever any part changes
  useEffect(() => {
    // Only update if we have at least one value
    if (month || day || year) {
      const fullDate = `${month}/${day}/${year}`;
      field.onChange(fullDate);
    } else {
      field.onChange("");
    }
  }, [month, day, year, field]);

  // Handle month input
  const handleMonthChange = (text: string) => {
    // Only allow digits
    const digitsOnly = text.replace(/\D/g, "");

    if (digitsOnly.length <= 2) {
      setMonth(digitsOnly);

      // Auto-jump to day field when month is complete
      if (digitsOnly.length === 2) {
        dayRef.current?.focus();
      }
    }
  };

  // Handle day input
  const handleDayChange = (text: string) => {
    // Only allow digits
    const digitsOnly = text.replace(/\D/g, "");

    if (digitsOnly.length <= 2) {
      setDay(digitsOnly);

      // Auto-jump to year field when day is complete
      if (digitsOnly.length === 2) {
        yearRef.current?.focus();
      }
    }
  };

  // Handle year input
  const handleYearChange = (text: string) => {
    // Only allow digits
    const digitsOnly = text.replace(/\D/g, "");

    if (digitsOnly.length <= 4) {
      setYear(digitsOnly);
    }
  };

  // Handle backspace key for month field
  const handleMonthKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>
  ) => {
    if (e.nativeEvent.key === "Backspace" && !month) {
      // If month is empty and backspace is pressed, do nothing
    }
  };

  // Handle backspace key for day field
  const handleDayKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>
  ) => {
    if (e.nativeEvent.key === "Backspace" && !day) {
      // If day is empty and backspace is pressed, focus the month input
      monthRef.current?.focus();
    }
  };

  // Handle backspace key for year field
  const handleYearKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>
  ) => {
    if (e.nativeEvent.key === "Backspace" && !year) {
      // If year is empty and backspace is pressed, focus the day input
      dayRef.current?.focus();
    }
  };

  // Handle blur event
  const handleBlur = () => {
    field.onBlur();

    // Validate when leaving the field
    if (
      (month && month.length < 2) ||
      (day && day.length < 2) ||
      (year && year.length < 4)
    ) {
      setError("Please enter complete date");
    } else if (month || day || year) {
      // Basic validation
      const monthNum = parseInt(month, 10);
      const dayNum = parseInt(day, 10);
      const yearNum = parseInt(year, 10);

      if (monthNum < 1 || monthNum > 12) {
        setError("Invalid month");
      } else if (dayNum < 1 || dayNum > 31) {
        setError("Invalid day");
      } else if (yearNum < 1900 || yearNum > new Date().getFullYear()) {
        setError("Invalid year");
      } else {
        setError("");
      }
    } else {
      setError("");
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.inputContainer, controller.style]}>
        {controller.icon && (
          <View style={styles.iconContainer}>
            <Ionicons name={controller.icon as any} size={20} color="#666" />
          </View>
        )}

        <View style={styles.placeholderContainer}>
          {!month && !day && !year && (
            <Text style={styles.placeholderText}>MM / DD / YYYY</Text>
          )}
        </View>

        <View style={styles.dateInputsContainer}>
          {/* Month input */}
          <TextInput
            ref={monthRef}
            style={styles.partInput}
            value={month}
            onChangeText={handleMonthChange}
            keyboardType="numeric"
            maxLength={2}
            placeholder=""
            onBlur={handleBlur}
            onKeyPress={handleMonthKeyPress}
            selectionColor="#007AFF"
          />

          <Text style={styles.separator}>/</Text>

          {/* Day input */}
          <TextInput
            ref={dayRef}
            style={styles.partInput}
            value={day}
            onChangeText={handleDayChange}
            keyboardType="numeric"
            maxLength={2}
            placeholder=""
            onBlur={handleBlur}
            onKeyPress={handleDayKeyPress}
            selectionColor="#007AFF"
          />

          <Text style={styles.separator}>/</Text>

          {/* Year input */}
          <TextInput
            ref={yearRef}
            style={styles.yearInput}
            value={year}
            onChangeText={handleYearChange}
            keyboardType="numeric"
            maxLength={4}
            placeholder=""
            onBlur={handleBlur}
            onKeyPress={handleYearKeyPress}
            selectionColor="#007AFF"
          />
        </View>
      </View>

      {error !== "" && <Text style={styles.errorText}>{error}</Text>}
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
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    height: 46,
    position: "relative",
  },
  iconContainer: {
    marginRight: 10,
  },
  placeholderContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 0,
    paddingLeft: 10,
  },
  placeholderText: {
    color: "#999",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  dateInputsContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    zIndex: 1,
  },
  partInput: {
    width: 28,
    textAlign: "center",
    fontSize: 16,
    height: "100%",
    color: "#000000",
    padding: 0,
    backgroundColor: "transparent",
    ...Platform.select({
      ios: {
        fontWeight: "400",
      },
      android: {
        fontFamily: "sans-serif",
      },
    }),
  },
  yearInput: {
    width: 50,
    textAlign: "center",
    fontSize: 16,
    height: "100%",
    color: "#000000",
    padding: 0,
    backgroundColor: "transparent",
    ...Platform.select({
      ios: {
        fontWeight: "400",
      },
      android: {
        fontFamily: "sans-serif",
      },
    }),
  },
  separator: {
    fontSize: 16,
    color: "#000000",
    marginHorizontal: 4,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 12,
    marginTop: 5,
    marginLeft: 4,
  },
});

export default DateOfBirth;
