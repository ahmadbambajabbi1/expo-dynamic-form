import React, { ReactNode, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import {
  DynamicFormSubmitBtnType,
  PropsPropsType,
  StepsType,
} from "../../types";
import NormalHandler from "./NormalHandler";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../ui/Toast";
import LoadingComponent from "../ui/LoadingComponent";

type PropsType = {
  steps?: StepsType<any>[];
  props?: PropsPropsType;
  form: UseFormReturn<z.TypeOf<any>, any, undefined>;
  stepPreview?: (value: any) => ReactNode;
  hideStepsIndication?: boolean;
  onSubmit: () => void;
  onFieldChange?: (name: string, value: any) => void;
  submitLoading?: boolean;
  submitBtn?: DynamicFormSubmitBtnType;
};

const StepsHandler = ({
  steps,
  form,
  props,
  stepPreview,
  hideStepsIndication = false,
  onSubmit,
  onFieldChange,
  submitLoading,
  submitBtn,
}: PropsType) => {
  const { theme } = useTheme();
  const { showToast } = useToast();
  const [activeStep, setActiveStep] = useState<number>(0);
  const [activeSchema, setActiveSchema] = useState<any>(null);

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

  let isLastStep = steps && activeStep === steps.length - 1;
  if (stepPreview) {
    steps && activeStep === steps.length;
  }
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
              <Text
                style={[styles.skipButtonText, { color: theme.colors.primary }]}
              >
                Skip
              </Text>
            </TouchableOpacity>
          )}
        <Text style={[styles.currentStepTitle, { color: theme.colors.text }]}>
          {currentStepName}
        </Text>
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
                        ? [
                            styles.activeConnector,
                            { backgroundColor: theme.colors.primary },
                          ]
                        : [
                            styles.inactiveConnector,
                            { backgroundColor: theme.colors.border },
                          ],
                    ]}
                  />
                )}
                <View
                  style={[
                    styles.stepIndicator,
                    index < activeStep
                      ? [
                          styles.completedStep,
                          { backgroundColor: theme.colors.primary },
                        ]
                      : index === activeStep
                      ? [
                          styles.activeStep,
                          { backgroundColor: theme.colors.primary },
                        ]
                      : [
                          styles.inactiveStep,
                          { backgroundColor: theme.colors.border },
                        ],
                  ]}
                >
                  <Text
                    style={[
                      styles.stepNumber,
                      index < activeStep || index === activeStep
                        ? styles.activeStepNumber
                        : [
                            styles.inactiveStepNumber,
                            { color: theme.colors.textSecondary },
                          ],
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
                        ? [
                            styles.activeConnector,
                            { backgroundColor: theme.colors.primary },
                          ]
                        : [
                            styles.inactiveConnector,
                            { backgroundColor: theme.colors.border },
                          ],
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
                  ? [styles.activeStepName, { color: theme.colors.primary }]
                  : [
                      styles.inactiveStepName,
                      { color: theme.colors.textSecondary },
                    ],
                index === 0 ? { marginLeft: 0 } : null,
                index === steps.length - 1 ? { marginRight: 0 } : null,
              ]}
            >
              {step.stepName}
            </Text>
          ))}
      </View>

      <View style={styles.contentArea}>
        {steps?.length && isLastStep ? (
          <View style={styles.previewContainer}>
            {stepPreview && stepPreview(form.getValues())}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.backButtonTouchable,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}
                onPress={handleBack}
                disabled={submitLoading}
              >
                <Text
                  style={[styles.backButtonText, { color: theme.colors.text }]}
                >
                  Back
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.submitButtonTouchable,
                  { backgroundColor: theme.colors.primary },
                ]}
                disabled={submitLoading}
                onPress={onSubmit}
              >
                <Text style={styles.submitButtonText}>
                  {submitLoading ? (
                    <LoadingComponent />
                  ) : submitBtn?.title ? (
                    submitBtn?.title
                  ) : (
                    "Submit"
                  )}
                </Text>
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
                  style={[
                    styles.backButtonTouchable,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  onPress={handleBack}
                  disabled={submitLoading}
                >
                  <Text
                    style={[
                      styles.backButtonText,
                      { color: theme.colors.text },
                    ]}
                  >
                    Back
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[
                  styles.nextButtonTouchable,
                  { backgroundColor: theme.colors.primary },
                  activeStep === 0 ? styles.fullWidthButton : {},
                ]}
                disabled={submitLoading}
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
                        if (result.error.issues.length > 0) {
                          const firstIssue = result.error.issues[0];
                          const errorMessage =
                            firstIssue.message || "Validation error";
                          showToast(errorMessage, "error");
                        }
                      }
                    } catch (error) {
                      console.error("Schema validation error:", error);
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    fontWeight: "bold",
  },
  inactiveStepName: {},
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
  activeStep: {},
  completedStep: {},
  inactiveStep: {},
  stepNumber: {
    fontWeight: "bold",
    fontSize: 14,
  },
  activeStepNumber: {
    color: "white",
  },
  inactiveStepNumber: {},
  connector: {
    height: 2,
    width: 30,
    zIndex: 1,
  },
  activeConnector: {},
  inactiveConnector: {},
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
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    borderWidth: 1,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  nextButtonTouchable: {
    height: 50,
    flex: 1,
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
  },
  submitButtonTouchable: {
    height: 50,
    flex: 1,
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
  },
  nextButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
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
});

export default StepsHandler;
