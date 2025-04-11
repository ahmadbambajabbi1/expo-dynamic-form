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
import { useTheme } from "../../context/ThemeContext";

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
  const { theme } = useTheme();
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [year, setYear] = useState("");
  const [error, setError] = useState("");

  const monthRef = useRef<TextInput>(null);
  const dayRef = useRef<TextInput>(null);
  const yearRef = useRef<TextInput>(null);

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

  useEffect(() => {
    if (month || day || year) {
      const fullDate = `${month}/${day}/${year}`;
      field.onChange(fullDate);
    } else {
      field.onChange("");
    }
  }, [month, day, year, field]);

  const handleMonthChange = (text: string) => {
    const digitsOnly = text.replace(/\D/g, "");

    if (digitsOnly.length <= 2) {
      setMonth(digitsOnly);

      if (digitsOnly.length === 2) {
        dayRef.current?.focus();
      }
    }
  };

  const handleDayChange = (text: string) => {
    const digitsOnly = text.replace(/\D/g, "");

    if (digitsOnly.length <= 2) {
      setDay(digitsOnly);

      if (digitsOnly.length === 2) {
        yearRef.current?.focus();
      }
    }
  };

  const handleYearChange = (text: string) => {
    const digitsOnly = text.replace(/\D/g, "");

    if (digitsOnly.length <= 4) {
      setYear(digitsOnly);
    }
  };

  const handleMonthKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>
  ) => {
    if (e.nativeEvent.key === "Backspace" && !month) {
      // If month is empty and backspace is pressed, do nothing
    }
  };

  const handleDayKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>
  ) => {
    if (e.nativeEvent.key === "Backspace" && !day) {
      monthRef.current?.focus();
    }
  };

  const handleYearKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>
  ) => {
    if (e.nativeEvent.key === "Backspace" && !year) {
      dayRef.current?.focus();
    }
  };

  const handleBlur = () => {
    field.onBlur();

    if (
      (month && month.length < 2) ||
      (day && day.length < 2) ||
      (year && year.length < 4)
    ) {
      setError("Please enter complete date");
    } else if (month || day || year) {
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
      <View
        style={[
          styles.inputContainer,
          { borderColor: theme.colors.border },
          controller.style,
        ]}
      >
        {controller.icon && (
          <View style={styles.iconContainer}>
            <Ionicons
              name={controller.icon as any}
              size={20}
              color={theme.colors.textSecondary}
            />
          </View>
        )}

        <View style={styles.placeholderContainer}>
          {!month && !day && !year && (
            <Text
              style={[
                styles.placeholderText,
                { color: theme.colors.textSecondary },
              ]}
            >
              MM / DD / YYYY
            </Text>
          )}
        </View>

        <View style={styles.dateInputsContainer}>
          <TextInput
            ref={monthRef}
            style={[styles.partInput, { color: theme.colors.text }]}
            value={month}
            onChangeText={handleMonthChange}
            keyboardType="numeric"
            maxLength={2}
            placeholder=""
            onBlur={handleBlur}
            onKeyPress={handleMonthKeyPress}
            selectionColor={theme.colors.primary}
          />

          <Text style={[styles.separator, { color: theme.colors.text }]}>
            /
          </Text>

          <TextInput
            ref={dayRef}
            style={[styles.partInput, { color: theme.colors.text }]}
            value={day}
            onChangeText={handleDayChange}
            keyboardType="numeric"
            maxLength={2}
            placeholder=""
            onBlur={handleBlur}
            onKeyPress={handleDayKeyPress}
            selectionColor={theme.colors.primary}
          />

          <Text style={[styles.separator, { color: theme.colors.text }]}>
            /
          </Text>

          <TextInput
            ref={yearRef}
            style={[styles.yearInput, { color: theme.colors.text }]}
            value={year}
            onChangeText={handleYearChange}
            keyboardType="numeric"
            maxLength={4}
            placeholder=""
            onBlur={handleBlur}
            onKeyPress={handleYearKeyPress}
            selectionColor={theme.colors.primary}
          />
        </View>
      </View>

      {error !== "" && (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {error}
        </Text>
      )}
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
    borderRadius: 5,
    paddingHorizontal: 10,
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
    marginHorizontal: 4,
  },
  errorText: {
    fontSize: 12,
    marginTop: 5,
    marginLeft: 4,
  },
});

export default DateOfBirth;
