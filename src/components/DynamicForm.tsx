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
  Theme,
} from "../types";
import { defaultTheme } from "../types/theme";
import { ThemeProvider } from "../context/ThemeContext";
import { ToastProvider, useToast } from "./ui/Toast";
import DynamicAxios from "../utils/axiosConfig";

interface DynamicFormContentProps {
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

const DynamicFormContent = ({
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
}: DynamicFormContentProps): JSX.Element => {
  const [submitLoading, setSubmitLoading] = useState(false);
  const [modal, setModal] = useState<ModalType>({
    open: false,
    data: [],
  });
  const { showToast } = useToast();

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

  async function onSubmit(values: z.infer<any>) {
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
        console.error("Custom submit handler error:");
      } finally {
        setSubmitLoading(false);
      }
    }
    if (!handleSubmit) {
      setSubmitLoading(true);
      try {
        type HttpMethod = "get" | "post" | "put" | "delete";
        const method =
          (apiOptions?.method?.toLowerCase() as HttpMethod) || "post";
        let res;
        console.log({ DynamicAxios });
        if (method === "get") {
          res = await DynamicAxios.get(apiOptions?.api, apiOptions?.options);
        } else {
          res = await DynamicAxios[method](
            apiOptions?.api,
            data,
            apiOptions?.options
          );
        }
        if (res?.status >= 200 && res.status <= 299) {
          const successMessage =
            res?.data?.message || res?.data?.msg || "Success";
          showToast(successMessage, "success");

          if (res?.data?.succesType === "VERIFIED") {
            if (apiOptions?.onVerify) {
              apiOptions?.onVerify(res?.data);
            }
          }
          if (apiOptions?.onFinish && res?.data?.succesType !== "VERIFIED") {
            apiOptions.onFinish(res?.data);
          }
          reset();
        }
      } catch (error) {
        console.log({ error });
        const type = error?.response?.data?.errorType;
        const data =
          error?.response?.data?.error || error?.response?.data?.errors;

        if (type === "FORM_ERROR") {
          if (Array.isArray(data)) {
            data.forEach((dt) => {
              const errorMessage = dt?.message || dt?.msg || "Unknown error";
              setError(dt?.path[0], {
                type: "manual",
                message: errorMessage,
              });

              // Show the first error message as a toast
              if (data.indexOf(dt) === 0) {
                showToast(errorMessage, "error");
              }
            });
          } else if (data) {
            const errorMessage = data?.message || data?.msg || "Unknown error";
            setError(data?.path[0], {
              type: "manual",
              message: errorMessage,
            });
            showToast(errorMessage, "error");
          }
        }
        if (type === "MODAL") {
          setModal({
            open: true,
            data: data,
          });
        }
        const errorMessage =
          error?.response?.data?.message ||
          error?.response?.data?.msg ||
          "Unknown error";
        showToast(errorMessage, "error");
        if (apiOptions?.errorHandler) {
          apiOptions?.errorHandler(data, type);
        }
      } finally {
        setSubmitLoading(false);
      }
    }
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

      {formtype === "normal" && (
        <View style={styles.buttonContainer}>
          {tricker ? (
            tricker({ submitLoading, isValid: form.formState.isValid })
          ) : (
            <Button
              style={styles.submitButton}
              onPress={form.handleSubmit(onSubmit)}
              disabled={submitLoading}
              variant="default"
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
    </View>
  );
};

interface DynamicFormProps extends DynamicFormContentProps {
  theme?: Partial<Theme>;
}

const DynamicForm = (props: DynamicFormProps): JSX.Element => {
  const { theme = defaultTheme, ...otherProps } = props;

  return (
    <ThemeProvider theme={theme}>
      <ToastProvider>
        <DynamicFormContent {...otherProps} />
      </ToastProvider>
    </ThemeProvider>
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
});

export default DynamicForm;
