// src/components/handlers/NormalHandler.tsx
import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Text } from "react-native";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import FormElementHandler from "./FormElementHandler";
import { FormControllerProps, PropsPropsType } from "../../types";
import { useTheme } from "../../context/ThemeContext";

type PropsType = {
  props?: PropsPropsType;
  controllers?: FormControllerProps[];
  form: UseFormReturn<z.TypeOf<any>, any, undefined>;
  onSubmit: () => void;
  isStepMode?: boolean;
  onFieldChange?: (name: string, value: any) => void;
};

const NormalHandler = ({
  props,
  controllers,
  form,
  onFieldChange,
}: PropsType) => {
  const { theme } = useTheme();
  const [controllersState, setControllersState] = useState<
    FormControllerProps[]
  >([]);

  useEffect(() => {
    const filterControllers = (
      controllers: FormControllerProps[]
    ): FormControllerProps[] => {
      return controllers.filter((controller) => {
        const isVisible = (ctrl: FormControllerProps) => {
          if (ctrl.visible !== undefined) {
            if (typeof ctrl.visible === "function") {
              return ctrl.visible(form.getValues());
            }
            return ctrl.visible !== false;
          }
          return true;
        };

        if (!isVisible(controller)) {
          return false;
        }

        if (controller.groupControllers) {
          controller.groupControllers = filterControllers(
            controller.groupControllers
          );
        }

        return true;
      });
    };

    const filteredControllers = filterControllers(controllers || []);
    setControllersState(filteredControllers);
  }, [controllers, form]);

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={props?.controllerBase?.style || styles.controllerBase}>
        {controllersState.map((controller, index) => {
          if (controller.groupControllers) {
            return (
              <View
                key={`${index}-${controller?.groupName || controller?.type}`}
                style={[
                  styles.groupContainer,
                  {
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.surface,
                  },
                  controller?.style,
                ]}
              >
                {controller?.groupName && (
                  <View
                    style={[
                      styles.groupHeader,
                      {
                        backgroundColor: theme.colors.surface,
                        borderBottomColor: theme.colors.border,
                      },
                    ]}
                  >
                    <View style={styles.groupHeaderTextContainer}>
                      <Text
                        style={[
                          styles.groupHeaderText,
                          { color: theme.colors.text },
                        ]}
                      >
                        {controller?.groupName}
                      </Text>
                    </View>
                  </View>
                )}
                <View
                  style={
                    props?.groupcontrollerBase?.style ||
                    styles.groupControllerBase
                  }
                >
                  {controller?.groupControllers?.map((groupController) => (
                    <FormElementHandler
                      key={`${index}-${groupController?.name}`}
                      controller={groupController}
                      form={form}
                      props={props}
                      onFieldChange={onFieldChange}
                    />
                  ))}
                </View>
              </View>
            );
          }
          return (
            <FormElementHandler
              key={`${index}-${controller?.name}`}
              controller={controller}
              form={form}
              props={props}
              onFieldChange={onFieldChange}
            />
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  controllerBase: {
    width: "100%",
  },
  groupContainer: {
    marginVertical: 10,
    width: "100%",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
  },
  groupHeader: {
    padding: 10,
    borderBottomWidth: 1,
  },
  groupHeaderTextContainer: {
    marginLeft: 8,
  },
  groupHeaderText: {
    fontWeight: "bold",
    textTransform: "uppercase",
    fontSize: 14,
  },
  groupControllerBase: {
    padding: 10,
  },
  submitButton: {
    marginTop: 16,
    marginHorizontal: 10,
    height: 50,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default NormalHandler;
