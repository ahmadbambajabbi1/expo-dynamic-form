import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  memo,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from "react-native";
import { UseFormReturn, useForm } from "react-hook-form";
import { z } from "zod";
import { FormControllerProps, StepsType } from "../../types";
import { Ionicons } from "@expo/vector-icons";
import NormalHandler from "../handlers/SubFormNormalHandler";
import StepsHandler from "../handlers/SubFormStepsHandler";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTheme } from "../../context/ThemeContext";

type SubFormControllerProps = {
  field: {
    onChange: (value: any) => void;
    onBlur: () => void;
    value: any;
    name: string;
  };
  controller: FormControllerProps & {
    subform?: {
      formtype?: "normal" | "steper";
      controllers?: FormControllerProps[];
      steps?: StepsType<any>[];
      formSchema?: z.ZodType<any, any>;
    };
    addMoreVisible?: boolean;
    itemTitle?: string | ((item: any) => string);
    display?: (item: any) => React.ReactNode;
    emptyMessage?: string;
  };
  form: UseFormReturn<z.TypeOf<any>, any, undefined>;
};

const SubFormController = ({
  controller,
  field,
  form: parentForm,
}: SubFormControllerProps) => {
  const { theme } = useTheme();
  const isInitializedRef = useRef(false);
  const prevItemsRef = useRef<any[]>([]);

  const subformMethods = useForm({
    resolver: controller.subform?.formSchema
      ? zodResolver(controller.subform.formSchema)
      : undefined,
    mode: "onBlur",
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [validationErrors, setValidationErrors] = useState<any[]>([]);

  const allowMultipleItems = controller.addMoreVisible === true;

  const flattenStructure = useCallback(
    (item: any) => {
      if (!item || typeof item !== "object") return item;
      const controllerBase = controller.name || "";

      for (const key in item) {
        if (
          (key === controllerBase ||
            key.toLowerCase() === controllerBase.toLowerCase()) &&
          typeof item[key] === "object" &&
          item[key] !== null
        ) {
          const result = { ...item[key] };
          Object.keys(item).forEach((prop) => {
            if (prop !== key) {
              result[prop] = item[prop];
            }
          });
          return result;
        }
      }
      return item;
    },
    [controller.name]
  );

  // Initialize once from existing value
  useEffect(() => {
    if (isInitializedRef.current) return;

    if (field.value) {
      try {
        if (Array.isArray(field.value)) {
          const fixedItems = field.value.map((item) => flattenStructure(item));
          setItems(fixedItems);
          prevItemsRef.current = fixedItems;
        } else if (
          typeof field.value === "object" &&
          field.value !== null &&
          !Array.isArray(field.value)
        ) {
          const fixedItem = flattenStructure(field.value);
          if (!allowMultipleItems) {
            setItems([fixedItem]);
            prevItemsRef.current = [fixedItem];
          } else {
            setItems([fixedItem]);
            prevItemsRef.current = [fixedItem];
            field.onChange([fixedItem]);
            parentForm.setValue(controller?.name || "", [fixedItem], {
              shouldValidate: true,
            });
          }
        } else if (typeof field.value === "string") {
          try {
            const parsedItems = JSON.parse(field.value);
            if (Array.isArray(parsedItems)) {
              const fixedItems = parsedItems.map((item) =>
                flattenStructure(item)
              );
              setItems(fixedItems);
              prevItemsRef.current = fixedItems;

              if (!allowMultipleItems && fixedItems.length === 1) {
                field.onChange(fixedItems[0]);
                parentForm.setValue(controller?.name || "", fixedItems[0], {
                  shouldValidate: true,
                });
              } else {
                field.onChange(fixedItems);
                parentForm.setValue(controller?.name || "", fixedItems, {
                  shouldValidate: true,
                });
              }
            } else if (
              typeof parsedItems === "object" &&
              parsedItems !== null
            ) {
              const fixedItem = flattenStructure(parsedItems);
              setItems([fixedItem]);
              prevItemsRef.current = [fixedItem];

              if (!allowMultipleItems) {
                field.onChange(fixedItem);
                parentForm.setValue(controller?.name || "", fixedItem, {
                  shouldValidate: true,
                });
              } else {
                field.onChange([fixedItem]);
                parentForm.setValue(controller?.name || "", [fixedItem], {
                  shouldValidate: true,
                });
              }
            }
          } catch (error) {
            setItems([]);
            prevItemsRef.current = [];
          }
        }
      } catch (error) {
        setItems([]);
        prevItemsRef.current = [];
      }
    }

    isInitializedRef.current = true;
  }, []);

  // Update form only when items change significantly
  useEffect(() => {
    if (!isInitializedRef.current) return;

    // Check if items have actually changed to prevent infinite loops
    if (JSON.stringify(items) === JSON.stringify(prevItemsRef.current)) {
      return;
    }

    prevItemsRef.current = [...items];

    if (items.length > 0) {
      const fixedItems = items.map((item) => flattenStructure(item));

      if (!allowMultipleItems) {
        field.onChange(fixedItems[0]);
        parentForm.setValue(controller?.name || "", fixedItems[0], {
          shouldValidate: true,
        });
      } else {
        field.onChange(fixedItems);
        parentForm.setValue(controller?.name || "", fixedItems, {
          shouldValidate: true,
        });
      }
    } else {
      if (!allowMultipleItems) {
        field.onChange({});
        parentForm.setValue(
          controller?.name || "",
          {},
          {
            shouldValidate: true,
          }
        );
      } else {
        field.onChange([]);
        parentForm.setValue(controller?.name || "", [], {
          shouldValidate: true,
        });
      }
    }
  }, [
    items,
    allowMultipleItems,
    controller.name,
    field,
    parentForm,
    flattenStructure,
  ]);

  const handleAddItem = useCallback(() => {
    setEditingIndex(null);
    setValidationErrors([]);
    subformMethods.reset({});

    if (
      controller.subform?.formtype === "normal" &&
      controller.subform.controllers
    ) {
      controller.subform.controllers.forEach((ctrl) => {
        if (ctrl.name) {
          subformMethods.setValue(ctrl.name, ctrl.defaultValue || "", {
            shouldValidate: false,
          });
        }
      });
    } else if (
      controller.subform?.formtype === "steper" &&
      controller.subform.steps
    ) {
      controller.subform.steps.forEach((step) => {
        step.controllers.forEach((ctrl) => {
          if (ctrl.name) {
            subformMethods.setValue(ctrl.name, ctrl.defaultValue || "", {
              shouldValidate: false,
            });
          }
        });
      });
    }

    setModalVisible(true);
  }, [controller.subform]);

  const handleEditItem = useCallback(
    (index: number) => {
      setEditingIndex(index);
      const itemToEdit = items[index];
      setValidationErrors([]);

      subformMethods.reset({});

      const setValue = (ctrl: FormControllerProps, itemToEdit: any) => {
        if (ctrl.name && itemToEdit) {
          const nameParts = ctrl.name.split(".");
          let value = itemToEdit;

          for (const part of nameParts) {
            if (value && typeof value === "object") {
              value = value[part];
            } else {
              value = undefined;
              break;
            }
          }

          if (value !== undefined) {
            subformMethods.setValue(ctrl.name, value, {
              shouldValidate: false,
            });
          } else {
            subformMethods.setValue(ctrl.name, ctrl.defaultValue || "", {
              shouldValidate: false,
            });
          }
        }
      };

      if (
        controller.subform?.formtype === "normal" &&
        controller.subform.controllers
      ) {
        controller.subform.controllers.forEach((ctrl) => {
          setValue(ctrl, itemToEdit);
        });
      } else if (
        controller.subform?.formtype === "steper" &&
        controller.subform.steps
      ) {
        controller.subform.steps.forEach((step) => {
          step.controllers.forEach((ctrl) => {
            setValue(ctrl, itemToEdit);
          });
        });
      }

      setModalVisible(true);
    },
    [items, controller.subform]
  );

  const handleDeleteItem = useCallback(
    (index: number) => {
      Alert.alert("Delete Item", "Are you sure you want to delete this item?", [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => {
            const newItems = [...items];
            newItems.splice(index, 1);
            setItems(newItems);
          },
          style: "destructive",
        },
      ]);
    },
    [items]
  );

  const validateSubForm = useCallback(
    (values: any): boolean => {
      setValidationErrors([]);

      if (!controller.subform?.formSchema) {
        return true;
      }

      try {
        const result = controller.subform.formSchema.safeParse(values);

        if (result.success) {
          return true;
        } else {
          setValidationErrors(result.error.issues);

          result.error.issues.forEach((issue: any) => {
            const path = Array.isArray(issue.path) ? issue.path[0] : issue.path;
            subformMethods.setError(path as string, {
              type: "manual",
              message: issue.message,
            });
          });

          return false;
        }
      } catch (error) {
        console.error("Validation error:", error);
        return false;
      }
    },
    [controller.subform?.formSchema]
  );

  const collectFormValues = useCallback(() => {
    if (controller.name) {
      const formValues: { [key: string]: any } = {};
      const controllerPrefix = `${controller.name.toLowerCase()}.`;

      const controllerNames =
        controller.subform?.controllers?.map((ctrl) => ctrl.name) || [];

      const prefixedFields = controllerNames.filter(
        (name) => name && name.toLowerCase().startsWith(controllerPrefix)
      );

      if (
        prefixedFields.length > 0 &&
        prefixedFields.length === controllerNames.length
      ) {
        controller.subform?.controllers?.forEach((ctrl) => {
          if (
            ctrl.name &&
            ctrl.name.toLowerCase().startsWith(controllerPrefix)
          ) {
            const prefixLength = controllerPrefix.length;
            const fieldName = ctrl.name.substring(prefixLength);
            formValues[fieldName] = subformMethods.getValues(ctrl.name);
          }
        });
        return formValues;
      }
    }

    const formValues: { [key: string]: any } = {};

    const processController = (ctrl: FormControllerProps) => {
      if (!ctrl.name) return;

      const nameParts = ctrl.name.split(".");

      if (nameParts.length === 1) {
        formValues[ctrl.name] = subformMethods.getValues(ctrl.name);
      } else {
        let currentObj = formValues;

        for (let i = 0; i < nameParts.length - 1; i++) {
          const part = nameParts[i];
          if (!currentObj[part]) {
            currentObj[part] = {};
          }
          currentObj = currentObj[part];
        }

        currentObj[nameParts[nameParts.length - 1]] = subformMethods.getValues(
          ctrl.name
        );
      }
    };

    if (controller.subform?.formtype === "steper" && controller.subform.steps) {
      controller.subform.steps.forEach((step) => {
        step.controllers?.forEach(processController);
      });
    } else if (controller.subform?.controllers) {
      controller.subform.controllers.forEach(processController);
    }

    return formValues;
  }, [controller.name, controller.subform]);

  const handleSubmitSubForm = useCallback(() => {
    const values = collectFormValues();

    if (!validateSubForm(values)) {
      return;
    }

    const processedValues = flattenStructure(values);

    if (editingIndex !== null) {
      const newItems = [...items];
      newItems[editingIndex] = processedValues;
      setItems(newItems);
    } else {
      if (!allowMultipleItems) {
        setItems([processedValues]);
      } else {
        setItems([...items, processedValues]);
      }
    }

    setModalVisible(false);
  }, [
    collectFormValues,
    validateSubForm,
    flattenStructure,
    editingIndex,
    items,
    allowMultipleItems,
  ]);

  const getItemTitle = useCallback(
    (item: any, index: number): string => {
      if (typeof controller.itemTitle === "function") {
        const title = controller.itemTitle(item);
        return title || `Item ${index + 1}`;
      } else if (
        typeof controller.itemTitle === "string" &&
        item[controller.itemTitle]
      ) {
        return item[controller.itemTitle];
      } else if (item.name) {
        return item.name;
      } else if (item.title) {
        return item.title;
      } else {
        return `Item ${index + 1}`;
      }
    },
    [controller.itemTitle]
  );

  const handleCancelModal = useCallback(() => {
    setModalVisible(false);
    setValidationErrors([]);
  }, []);

  const renderSubForm = useMemo(() => {
    if (!controller.subform) {
      return (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          Subform configuration missing
        </Text>
      );
    }

    const subform = controller.subform;

    if (subform.formtype === "steper" && subform.steps) {
      return (
        <StepsHandler
          steps={subform.steps}
          form={subformMethods}
          onSubmit={() => {}}
          hideStepsIndication={false}
        />
      );
    } else {
      return (
        <NormalHandler
          controllers={subform.controllers}
          form={subformMethods}
          onSubmit={() => {}}
          isStepMode={true}
        />
      );
    }
  }, [controller.subform, theme.colors.error]);

  const renderItemDetail = useCallback(
    (key: string, value: any, prefix = "") => {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (value === null || value === undefined) {
        return null;
      }

      if (typeof value === "object" && !Array.isArray(value)) {
        return Object.entries(value).map(([nestedKey, nestedValue]) =>
          renderItemDetail(nestedKey, nestedValue, fullKey)
        );
      }

      if (Array.isArray(value)) {
        const displayValue = value.length > 0 ? value.join(", ") : "none";
        return (
          <Text
            key={fullKey}
            style={[styles.itemDetail, { color: theme.colors.text }]}
          >
            <Text
              style={[
                styles.itemDetailLabel,
                { color: theme.colors.textSecondary },
              ]}
            >
              {key}:
            </Text>{" "}
            {displayValue}
          </Text>
        );
      }

      if (key === "id") return null;

      return (
        <Text
          key={fullKey}
          style={[styles.itemDetail, { color: theme.colors.text }]}
        >
          <Text
            style={[
              styles.itemDetailLabel,
              { color: theme.colors.textSecondary },
            ]}
          >
            {key}:
          </Text>{" "}
          {String(value)}
        </Text>
      );
    },
    [theme]
  );

  return (
    <View style={styles.container}>
      {items.length > 0 ? (
        <View style={styles.itemsContainer}>
          {items.map((item, index) => (
            <View
              key={index}
              style={[
                styles.itemCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <View style={styles.itemContent}>
                <Text
                  style={[styles.itemTitle, { color: theme.colors.primary }]}
                >
                  {getItemTitle(item, index)}
                </Text>
                {controller.display ? (
                  <View style={styles.customDisplayContainer}>
                    {controller.display(item)}
                  </View>
                ) : (
                  <View style={styles.itemDetails}>
                    {Object.entries(item).map(([key, value]) =>
                      renderItemDetail(key, value)
                    )}
                  </View>
                )}
              </View>
              <View style={styles.itemActions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEditItem(index)}
                >
                  <Ionicons
                    name="pencil"
                    size={18}
                    color={theme.colors.primary}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteItem(index)}
                >
                  <Ionicons name="trash" size={18} color={theme.colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {allowMultipleItems && (
            <TouchableOpacity
              style={styles.addMoreButton}
              onPress={handleAddItem}
            >
              <Ionicons
                name="add-circle"
                size={20}
                color={theme.colors.primary}
              />
              <Text
                style={[
                  styles.addMoreButtonText,
                  { color: theme.colors.primary },
                ]}
              >
                Add More
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View
          style={[
            styles.emptyContainer,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text
            style={[styles.emptyText, { color: theme.colors.textSecondary }]}
          >
            {controller.emptyMessage || "No items added yet"}
          </Text>
        </View>
      )}

      {(items.length === 0 || (allowMultipleItems && items.length > 0)) && (
        <TouchableOpacity
          style={[
            styles.addButton,
            { backgroundColor: theme.colors.primary },
            items.length > 0 && allowMultipleItems && styles.addButtonSmall,
          ]}
          onPress={handleAddItem}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>
            {items.length === 0
              ? `Add ${controller.label || "Item"}`
              : "Add Another"}
          </Text>
        </TouchableOpacity>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCancelModal}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.colors.background },
            ]}
          >
            <View
              style={[
                styles.modalHeader,
                { borderBottomColor: theme.colors.border },
              ]}
            >
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                {editingIndex !== null
                  ? `Edit ${controller.label || "Item"}`
                  : `Add ${controller.label || "Item"}`}
              </Text>
              <TouchableOpacity onPress={handleCancelModal}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>{renderSubForm}</ScrollView>

            {validationErrors.length > 0 && (
              <View
                style={[
                  styles.validationErrorsContainer,
                  {
                    backgroundColor: `${theme.colors.error}10`,
                    borderColor: theme.colors.error,
                  },
                ]}
              >
                {validationErrors.map((error, index) => (
                  <Text
                    key={index}
                    style={[
                      styles.validationErrorText,
                      { color: theme.colors.error },
                    ]}
                  >
                    {`${error.path.join(".")} - ${error.message}`}
                  </Text>
                ))}
              </View>
            )}

            <View
              style={[
                styles.modalFooter,
                { borderTopColor: theme.colors.border },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.cancelButton,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}
                onPress={handleCancelModal}
              >
                <Text
                  style={[
                    styles.cancelButtonText,
                    { color: theme.colors.text },
                  ]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.saveButton,
                  { backgroundColor: theme.colors.primary },
                ]}
                onPress={handleSubmitSubForm}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  itemsContainer: {
    marginBottom: 15,
  },
  itemCard: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
  },
  customDisplayContainer: {
    width: "100%",
  },
  itemDetails: {},
  itemDetail: {
    fontSize: 14,
    marginBottom: 3,
  },
  itemDetailLabel: {
    fontWeight: "500",
  },
  itemActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  editButton: {
    padding: 5,
    marginRight: 10,
  },
  deleteButton: {
    padding: 5,
  },
  addMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    padding: 8,
    marginTop: 5,
  },
  addMoreButtonText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 5,
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  emptyText: {
    fontSize: 14,
  },
  errorText: {
    fontSize: 14,
    textAlign: "center",
    padding: 10,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    padding: 12,
  },
  addButtonSmall: {
    marginTop: 10,
    paddingVertical: 8,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  modalBody: {
    padding: 15,
    maxHeight: "70%",
  },
  validationErrorsContainer: {
    borderWidth: 1,
    borderRadius: 5,
    margin: 15,
    padding: 10,
  },
  validationErrorText: {
    fontSize: 12,
    marginBottom: 3,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    borderTopWidth: 1,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 5,
    marginRight: 10,
    alignItems: "center",
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  saveButton: {
    flex: 1,
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default memo(SubFormController);
