import React, { ReactNode, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { PropsPropsType, StepsType } from "../../types";
import NormalHandler from "./SubFormNormalHandler";
import { useTheme } from "../../context/ThemeContext";

type PropsType = {
  steps?: StepsType<any>[];
  props?: PropsPropsType;
  form: UseFormReturn<z.TypeOf<any>, any, undefined>;
  stepPreview?: (value: any) => ReactNode;
  hideStepsIndication?: boolean;
  onSubmit: () => void;
  onFieldChange?: (name: string, value: any) => void;
};

const SubFormStepsHandler = ({
  steps,
  form,
  props,
  stepPreview,
  hideStepsIndication = false,
  onSubmit,
  onFieldChange,
}: PropsType) => {
  const { theme } = useTheme();
  const [activeStep, setActiveStep] = useState<number>(0);
  const [activeSchema, setActiveSchema] = useState<any>(null);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: theme.colors.background,
        },
        contentContainer: {
          paddingBottom: 20,
        },
        headerContainer: {
          flexDirection: "column",
          alignItems: "center",
          marginTop: 10,
          marginBottom: 8,
          position: "relative",
          paddingHorizontal: 16,
          width: "100%",
        },
        currentStepTitle: {
          fontSize: 20,
          fontWeight: "700",
          textAlign: "center",
          color: theme.colors.text,
          marginTop: 50,
        },
        skipButton: {
          position: "absolute",
          right: 16,
          top: 0,
          padding: 8,
          zIndex: 5,
        },
        skipButtonText: {
          color: theme.colors.primary,
          fontWeight: "600",
          fontSize: 16,
        },
        stepperContainer: {
          flexDirection: "row",
          paddingHorizontal: 16,
          paddingTop: 10,
          paddingBottom: 5,
          justifyContent: "center",
          alignItems: "center",
        },
        stepNamesContainer: {
          flexDirection: "row",
          paddingHorizontal: 16,
          marginBottom: 25,
          justifyContent: "space-between",
        },
        stepName: {
          fontSize: 14,
          textAlign: "center",
          flex: 1,
          display: "none",
        },
        activeStepName: {
          color: theme.colors.primary,
          fontWeight: "bold",
        },
        inactiveStepName: {
          color: theme.colors.textSecondary,
        },
        stepItem: {
          alignItems: "center",
          flexDirection: "row",
          zIndex: 1,
        },
        stepIndicator: {
          width: 30,
          height: 30,
          borderRadius: 15,
          justifyContent: "center",
          alignItems: "center",
          zIndex: 2,
        },
        activeStep: {
          backgroundColor: theme.colors.primary,
        },
        completedStep: {
          backgroundColor: theme.colors.primary,
        },
        inactiveStep: {
          backgroundColor: theme.colors.border,
        },
        stepNumber: {
          fontWeight: "bold",
          fontSize: 14,
        },
        activeStepNumber: {
          color: "white",
        },
        inactiveStepNumber: {
          color: theme.colors.textSecondary,
        },
        connector: {
          height: 2,
          width: 30,
          zIndex: 1,
        },
        activeConnector: {
          backgroundColor: theme.colors.primary,
        },
        inactiveConnector: {
          backgroundColor: theme.colors.border,
        },
        contentArea: {
          flex: 1,
          padding: 16,
        },
        stepContent: {
          flex: 1,
        },
        previewContainer: {
          flex: 1,
        },
        buttonContainer: {
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 20,
          paddingHorizontal: 8,
        },
        backButtonTouchable: {
          height: 50,
          flex: 1,
          marginRight: 8,
          backgroundColor: theme.colors.surface,
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 5,
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
        backButtonText: {
          color: theme.colors.text,
          fontSize: 16,
          fontWeight: "500",
        },
        nextButtonTouchable: {
          height: 50,
          flex: 1,
          marginLeft: 8,
          backgroundColor: theme.colors.primary,
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 5,
        },
        nextButtonText: {
          color: "white",
          fontSize: 16,
          fontWeight: "500",
        },
        submitButtonTouchable: {
          height: 50,
          flex: 1,
          marginLeft: 8,
          backgroundColor: theme.colors.primary,
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 5,
        },
        submitButtonText: {
          color: "white",
          fontSize: 16,
          fontWeight: "500",
        },
        fullWidthButton: {
          marginLeft: 0,
          flex: 1,
        },
      }),
    [theme]
  );

  const handleNext = () => {
    setActiveSchema(null);
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveSchema(null);
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSkip = () => {
    setActiveSchema(null);
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  React.useEffect(() => {
    const currentStep = steps && steps[activeStep];
    if (currentStep?.stepSchema) {
      setActiveSchema(currentStep?.stepSchema);
    }
  }, [activeStep, steps]);

  const isLastStep = steps && activeStep === steps.length - 1;
  const isPreviewStep = steps && activeStep === steps.length;
  const currentStepName =
    steps && steps[activeStep] ? steps[activeStep].stepName : "";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.headerContainer}>
        {steps &&
          steps[activeStep] &&
          steps[activeStep].isOptional === true &&
          !isPreviewStep && (
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
          )}
        <Text style={styles.currentStepTitle}>{currentStepName}</Text>
      </View>

      {!hideStepsIndication && (
        <View style={styles.stepperContainer}>
          {steps &&
            steps.map((step, index) => (
              <View key={step.stepName || index} style={styles.stepItem}>
                {index > 0 && (
                  <View
                    style={[
                      styles.connector,
                      index <= activeStep
                        ? styles.activeConnector
                        : styles.inactiveConnector,
                    ]}
                  />
                )}
                <View
                  style={[
                    styles.stepIndicator,
                    index < activeStep
                      ? styles.completedStep
                      : index === activeStep
                      ? styles.activeStep
                      : styles.inactiveStep,
                  ]}
                >
                  <Text
                    style={[
                      styles.stepNumber,
                      index < activeStep || index === activeStep
                        ? styles.activeStepNumber
                        : styles.inactiveStepNumber,
                    ]}
                  >
                    {index + 1}
                  </Text>
                </View>
                {index < steps.length - 1 && (
                  <View
                    style={[
                      styles.connector,
                      index < activeStep
                        ? styles.activeConnector
                        : styles.inactiveConnector,
                    ]}
                  />
                )}
              </View>
            ))}
        </View>
      )}

      <View style={styles.stepNamesContainer}>
        {steps &&
          steps.map((step, index) => (
            <Text
              key={`name-${index}`}
              style={[
                styles.stepName,
                index === activeStep
                  ? styles.activeStepName
                  : styles.inactiveStepName,
                index === 0 ? { marginLeft: 0 } : null,
                index === steps.length - 1 ? { marginRight: 0 } : null,
              ]}
            >
              {step.stepName}
            </Text>
          ))}
      </View>

      <View style={styles.contentArea}>
        {steps?.length && isPreviewStep ? (
          <View style={styles.previewContainer}>
            {stepPreview && stepPreview(form.getValues())}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.backButtonTouchable}
                onPress={handleBack}
              >
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitButtonTouchable}
                onPress={onSubmit}
              >
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.stepContent}>
            <NormalHandler
              controllers={steps && steps[activeStep]?.controllers}
              props={props}
              form={form}
              onSubmit={() => {}}
              isStepMode={true}
              onFieldChange={onFieldChange}
            />

            <View style={styles.buttonContainer}>
              {activeStep > 0 && (
                <TouchableOpacity
                  style={styles.backButtonTouchable}
                  onPress={handleBack}
                >
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.nextButtonTouchable,
                  activeStep === 0 ? styles.fullWidthButton : {},
                ]}
                onPress={() => {
                  if (activeSchema) {
                    try {
                      const formValues = form.getValues();
                      const result = activeSchema.safeParse(formValues);
                      if (result.success) {
                        handleNext();
                      } else {
                        result.error.issues.forEach((issue: z.ZodIssue) => {
                          form.setError(issue.path[0] as string, {
                            type: "required",
                            message: issue.message,
                          });
                        });
                      }
                    } catch (error) {
                      handleNext();
                    }
                  } else {
                    handleNext();
                  }
                }}
              >
                <Text style={styles.nextButtonText}>
                  {isLastStep ? "Submit" : "Next"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default SubFormStepsHandler;
