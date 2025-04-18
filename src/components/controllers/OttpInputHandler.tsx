import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button } from "../ui/button";
import { apiOptionsType } from "../../types";
import OttpAxios from "../../utils/axiosConfig";
import { useTheme } from "../../context/ThemeContext";

const VERIFICATION_DATA_LOCASTORAGE_NAME = "dhdhd";
const VERIFICATION_VERIFY_NAME = "dkkdd";

type PropsType = {
  verifyingDataProps: any;
  apiOptions: apiOptionsType;
};

const OttpInputHandler = ({ verifyingDataProps, apiOptions }: PropsType) => {
  const { theme } = useTheme();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [verifyingData, setVerifyingData] = useState<any>(verifyingDataProps);
  const [verify, setVerify] = useState(true);
  const [resend, setResend] = useState(false);
  const [minutes, setMinutes] = useState(50);
  const [otpValues, setOtpValues] = useState(Array(6).fill(""));
  const inputRefs = useRef<Array<TextInput | null>>(Array(6).fill(null));

  const formSchema = z.object({
    inputValue: z.string().min(6, "is not valid").max(6, "is not valid"),
  });

  useEffect(() => {
    const getStoredData = async () => {
      try {
        const getVerificationFromStorage = await AsyncStorage.getItem(
          VERIFICATION_VERIFY_NAME
        );
        const getVerificationDataFromStorage = await AsyncStorage.getItem(
          VERIFICATION_DATA_LOCASTORAGE_NAME
        );

        if (getVerificationFromStorage) {
          setVerify(JSON.parse(getVerificationFromStorage));
        }

        if (getVerificationDataFromStorage) {
          setVerifyingData(JSON.parse(getVerificationDataFromStorage));
        }
      } catch (error) {
        console.log("Error retrieving verification data from storage", error);
      }
    };

    getStoredData();
  }, []);

  useEffect(() => {
    if (!verify) {
      return undefined;
    }

    const interval = setInterval(() => {
      setMinutes((prevMinutes) => {
        if (prevMinutes <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prevMinutes - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [verify, resend]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      inputValue: "",
    },
  });

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[0];
    }
    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);
    const combinedOtp = newOtpValues.join("");
    form.setValue("inputValue", combinedOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleBackspace = (index: number, value: string) => {
    if (value === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (minutes > 0) return;
    try {
      const res = await OttpAxios.post("/auth/verification-resend", {
        ...verifyingData,
      });
      if (res?.status >= 200 && res.status <= 299) {
        await AsyncStorage.setItem("", res?.data);
      }
    } catch (error) {}
    setResend(true);
    setMinutes(50);
  };

  const onSubmit = async (values: { inputValue: string }) => {
    setSubmitLoading(true);
    try {
      const res = await OttpAxios.post("/users/account/verification", {
        ...values,
        ...verifyingData,
      });

      if (res.status === 200) {
        await AsyncStorage.removeItem(VERIFICATION_VERIFY_NAME);
        await AsyncStorage.removeItem(VERIFICATION_DATA_LOCASTORAGE_NAME);

        if (res?.data?.action === "VERIFIED") {
          await AsyncStorage.setItem(
            VERIFICATION_DATA_LOCASTORAGE_NAME,
            JSON.stringify(res?.data?.data)
          );
          await AsyncStorage.setItem(
            VERIFICATION_VERIFY_NAME,
            JSON.stringify(true)
          );

          setVerifyingData(res?.data?.data);
          setVerify(true);
        }
        if (apiOptions?.onFinish && res?.data?.action !== "VERIFIED") {
          apiOptions?.onFinish(res?.data);
        }

        form.reset();
      }
    } catch (error: any) {
      if (error.response?.data?.errors) {
        const errors = error.response.data.error || error.response.data.errors;
        if (Array.isArray(errors)) {
          errors.forEach((err) => {
            form.setError(err?.path[0], {
              type: "manual",
              message: err?.message,
            });
          });
        } else {
          form.setError(errors?.path[0], {
            type: "manual",
            message: errors?.message,
          });
        }
      }
      if (apiOptions?.errorHandler) {
        apiOptions?.errorHandler(error, "form");
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.contentContainer}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          {`Verify the code sent to ${verifyingData?.value || ""}`}
        </Text>

        <View style={styles.otpContainer}>
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <View
                key={index}
                style={[
                  styles.otpInputContainer,
                  {
                    borderColor: form.formState.errors.inputValue
                      ? theme.colors.error
                      : theme.colors.border,
                    backgroundColor: theme.colors.surface,
                  },
                  index === 2 || index === 3 ? styles.otpSeparator : null,
                ]}
              >
                <TextInput
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  style={[styles.otpInput, { color: theme.colors.text }]}
                  value={otpValues[index]}
                  onChangeText={(value) => handleOtpChange(index, value)}
                  keyboardType="number-pad"
                  maxLength={1}
                  onKeyPress={({ nativeEvent }) => {
                    if (nativeEvent.key === "Backspace") {
                      handleBackspace(index, otpValues[index]);
                    }
                  }}
                />
              </View>
            ))}
        </View>

        {form.formState.errors.inputValue && (
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {form.formState.errors.inputValue.message}
          </Text>
        )}

        <View style={styles.resendContainer}>
          <Text
            style={[styles.resendText, { color: theme.colors.textSecondary }]}
          >
            Resend verification code after {minutes} seconds
          </Text>
          <TouchableOpacity
            onPress={handleResend}
            disabled={minutes > 0}
            style={styles.resendButton}
          >
            <Text
              style={[
                styles.resendButtonText,
                {
                  color:
                    minutes > 0
                      ? theme.colors.textSecondary
                      : theme.colors.primary,
                },
              ]}
            >
              Resend
            </Text>
          </TouchableOpacity>
        </View>

        <Button
          style={[
            styles.verifyButton,
            { backgroundColor: theme.colors.primary },
          ]}
          onPress={form.handleSubmit(onSubmit)}
          disabled={submitLoading}
        >
          {submitLoading ? (
            <ActivityIndicator color={theme.colors.contrast || "#fff"} />
          ) : (
            <Text
              style={{
                color: theme.colors.contrast || "#fff",
                fontWeight: "bold",
              }}
            >
              Verify
            </Text>
          )}
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  otpInputContainer: {
    width: 45,
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    marginHorizontal: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  otpSeparator: {
    marginLeft: 15,
  },
  otpInput: {
    width: "100%",
    height: "100%",
    fontSize: 20,
    textAlign: "center",
  },
  errorText: {
    marginBottom: 10,
    fontSize: 14,
  },
  resendContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  resendText: {
    fontSize: 14,
  },
  resendButton: {
    marginLeft: 8,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  resendButtonText: {
    fontWeight: "bold",
  },
  verifyButton: {
    paddingHorizontal: 50,
    height: 50,
  },
});

export default OttpInputHandler;
