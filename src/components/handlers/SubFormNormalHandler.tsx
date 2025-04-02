import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Text } from "react-native";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import FormElementHandler from "./FormElementHandler";
import { FormControllerProps, PropsPropsType } from "../../types";

type PropsType = {
  props?: PropsPropsType;
  controllers?: FormControllerProps[];
  form: UseFormReturn<z.TypeOf<any>, any, undefined>;
  onSubmit: () => void;
  isStepMode?: boolean; // Added prop to determine if we're in step mode
};

const NormalHandler = ({ props, controllers, form }: PropsType) => {
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
                style={[styles.groupContainer, controller?.style]}
              >
                {controller?.groupName && (
                  <View style={styles.groupHeader}>
                    <View style={styles.groupHeaderTextContainer}>
                      <Text style={styles.groupHeaderText}>
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
            />
          );
        })}
      </View>

      {/* Only show submit button if not in step mode */}
      {/* {!isStepMode && (
        <TouchableOpacity
          style={styles.submitButton}
          onPress={onSubmit}
          disabled={!form.formState.isValid}
        >
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
      )} */}
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
    borderColor: "#e0e0e0",
  },
  groupHeader: {
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
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
    backgroundColor: "#0077CC",
    height: 50,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default NormalHandler;
