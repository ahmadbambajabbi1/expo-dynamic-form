import React, { ReactNode, useState } from "react";
import { View, StyleSheet } from "react-native";
import { useForm } from "react-hook-form";
import { z, ZodSchema } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "./ui/button";
import LoadingComponent from "./ui/LoadingComponent";
import StepsHandler from "./handlers/StepsHandler";
import NormalHandler from "./handlers/NormalHandler";
import {
  FormControllerProps,
  PropsPropsType,
  DynamicFormHanldeSubmitParamType,
  StepsType,
  apiOptionsType,
  ModalType,
} from "../types";
import OttpInputHandler from "./controllers/OttpInputHandler";

interface DynamicFormProps {
  controllers?: FormControllerProps[];
  steps?: StepsType<ZodSchema>[];
  submitBtn?: {
    title?: string;
  };
  stepPreview?: (value: any) => ReactNode;
  hideStepsIndication?: boolean;
  formSchema?: ZodSchema;
  handleSubmit?: (
    params: DynamicFormHanldeSubmitParamType<ZodSchema>
  ) => Promise<void>;
  apiOptions?: apiOptionsType;
  tricker?: (props: any) => ReactNode;
  props?: PropsPropsType;
  formtype?: "normal" | "steper";
  modalComponent?: (
    data: ModalType,
    setModal: (modal: ModalType) => void
  ) => ReactNode;
}

// Avoid using React.FC due to incompatibilities with JSX in some TypeScript versions
const DynamicForm = ({
  controllers,
  steps,
  submitBtn,
  stepPreview,
  hideStepsIndication = false,
  formSchema,
  handleSubmit,
  apiOptions = {
    method: "POST",
    api: "",
  },
  tricker,
  props,
  modalComponent,
  formtype = "normal",
}: DynamicFormProps): JSX.Element => {
  const [submitLoading, setSubmitLoading] = useState(false);
  const [verifyingData] = useState<any>(null);
  const [verify] = useState(false);
  const [modal, setModal] = useState<ModalType>({
    open: false,
    data: [],
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  type FormValues = z.infer<any>;

  const initializeDefaultValues = (
    controllers: FormControllerProps[]
  ): FormValues => {
    return controllers.reduce((acc: FormValues, controller) => {
      if ("groupControllers" in controller && controller.groupControllers) {
        controller.groupControllers.forEach((field) => {
          if (field.name) {
            acc[field.name] = field.defaultValue || "";
          }
        });
      } else {
        const field = controller as FormControllerProps;
        if (field.name) {
          acc[field.name] = field.defaultValue || "";
        }
      }
      return acc;
    }, {} as FormValues);
  };

  const initializeDefaultValuesFromSteps = (
    steps: StepsType<any>[]
  ): FormValues => {
    return steps.reduce((acc: FormValues, step) => {
      step.controllers.forEach((controller) => {
        if ("groupControllers" in controller && controller.groupControllers) {
          controller.groupControllers.forEach((field) => {
            if (field.name) {
              acc[field.name] = field.defaultValue || "";
            }
          });
        } else {
          const field = controller as FormControllerProps;
          if (field.name) {
            acc[field.name] = field.defaultValue || "";
          }
        }
      });
      return acc;
    }, {} as FormValues);
  };

  const form = useForm<FormValues>({
    resolver: formSchema ? zodResolver(formSchema) : undefined,
    defaultValues:
      formtype === "steper"
        ? initializeDefaultValuesFromSteps(steps || [])
        : initializeDefaultValues(controllers || []),
  });

  const catchErrorHandler = (
    error: any,
    callback: (data: any, type: string) => void
  ) => {
    if (error?.response) {
      const { data, status } = error.response;

      if (status === 400 && data?.errors) {
        callback(data.errors, "form");
      } else if (status === 422 && data?.errors) {
        callback(data.errors, "form");
      } else if (status === 409) {
        callback(data, "modal");
      } else {
        setToastMessage(data?.message || "An error occurred");
      }
    } else {
      setToastMessage("Network error occurred");
    }
  };

  async function onSubmit(values: any) {
    let data: any = {};
    if (apiOptions?.extraData) {
      data = {
        ...values,
        ...apiOptions?.extraData,
      };
    } else {
      data = {
        ...values,
      };
    }
    const { setError, reset } = form;
    if (handleSubmit) {
      setSubmitLoading(true);
      try {
        await handleSubmit({ values: data, setError, reset });
      } catch (error) {
        console.error("Custom submit handler error:", error);
      } finally {
        setSubmitLoading(false);
      }
    }
    if (!handleSubmit && !verify) {
      setSubmitLoading(true);
      try {
        // In a package, we should let the host app handle API calls
        // This is just a placeholder for the packageized version
        console.log("API call would be made here:", {
          method: apiOptions.method,
          url: apiOptions.api,
          data,
        });

        // Simulate successful response
        const successResponse = {
          status: 200,
          data: {
            message: "Success",
            succesType: null,
          },
        };

        setToastMessage(successResponse?.data?.message || "Success");

        if (apiOptions?.onFinish) {
          apiOptions.onFinish(successResponse?.data);
        }

        reset();
      } catch (error) {
        catchErrorHandler(error, (data, type) => {
          if (type === "form") {
            if (Array.isArray(data)) {
              data.map((dt) => {
                if (dt?.path && dt?.path[0] && dt?.message) {
                  setError(dt.path[0], {
                    type: "manual",
                    message: dt.message,
                  });
                }
              });
            } else if (data?.path && data?.path[0] && data?.message) {
              setError(data.path[0], {
                type: "manual",
                message: data.message,
              });
            }
          }
          if (type === "modal") {
            setModal({
              open: true,
              data: data,
            });
          }
          if (apiOptions?.errorHandler) {
            apiOptions?.errorHandler(data, type);
          }
        });
      } finally {
        setSubmitLoading(false);
      }
    }
  }

  if (verify) {
    return (
      <OttpInputHandler
        apiOptions={apiOptions}
        verifyingDataProps={verifyingData}
      />
    );
  }

  return (
    <View style={styles.container}>
      {formtype === "steper" ? (
        <StepsHandler
          form={form}
          props={props}
          steps={steps}
          stepPreview={stepPreview}
          hideStepsIndication={hideStepsIndication}
          onSubmit={form.handleSubmit(onSubmit)}
        />
      ) : (
        <NormalHandler
          controllers={controllers}
          props={props}
          form={form}
          onSubmit={form.handleSubmit(onSubmit)}
        />
      )}

      {/* Only show the submit button when NOT using step form type and not verifying */}
      {!verify && formtype === "normal" && (
        <View style={styles.buttonContainer}>
          {tricker ? (
            tricker({ submitLoading, isValid: form.formState.isValid })
          ) : (
            <Button
              style={styles.submitButton}
              onPress={form.handleSubmit(onSubmit)}
              disabled={submitLoading}
            >
              {submitLoading ? (
                <LoadingComponent />
              ) : submitBtn?.title ? (
                submitBtn?.title
              ) : (
                "Submit"
              )}
            </Button>
          )}
        </View>
      )}

      {modal.open && modalComponent && modalComponent(modal, setModal)}

      {toastMessage && (
        <View style={styles.toast}>
          {/* You could implement a Toast component here */}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 1,
  },
  buttonContainer: {
    marginTop: 16,
  },
  submitButton: {
    marginTop: 8,
  },
  toast: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 10,
    borderRadius: 5,
  },
});

export default DynamicForm;
