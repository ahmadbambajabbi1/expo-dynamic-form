import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
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

  // Use refs to avoid unnecessary re-renders
  const isInitializedRef = useRef(false);

  // Create form methods for the subform - only once
  const subformMethods = useForm({
    resolver: controller.subform?.formSchema
      ? zodResolver(controller.subform.formSchema)
      : undefined,
    mode: "onBlur",
  });

  // Component state
  const [modalVisible, setModalVisible] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [validationErrors, setValidationErrors] = useState<any[]>([]);

  // Check if multiple items are allowed
  const allowMultipleItems = controller.addMoreVisible === true;

  // Prevent infinite re-renders by memoizing the flatten function
  const flattenStructure = useCallback(
    (item: any) => {
      if (!item || typeof item !== "object") return item;

      // Extract the base name from the controller name (if present)
      const controllerBase = controller.name || "";

      // Look for any nested objects that match the controller name pattern
      for (const key in item) {
        if (
          (key === controllerBase ||
            key.toLowerCase() === controllerBase.toLowerCase()) &&
          typeof item[key] === "object" &&
          item[key] !== null
        ) {
          // Found a nested object that matches our controller name
          const result = { ...item[key] };

          // Copy any other properties that weren't under the nested key
          Object.keys(item).forEach((prop) => {
            if (prop !== key) {
              result[prop] = item[prop];
            }
          });

          return result;
        }
      }

      // If we don't find any specific nested object to flatten,
      // return the item as is
      return item;
    },
    [controller.name]
  );

  // Initialize from existing value once
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    if (field.value) {
      try {
        if (Array.isArray(field.value)) {
          // Fix each item in the array
          const fixedItems = field.value.map((item) => flattenStructure(item));
          setItems(fixedItems);
        } else if (
          typeof field.value === "object" &&
          field.value !== null &&
          !Array.isArray(field.value)
        ) {
          // Fix the structure
          const fixedItem = flattenStructure(field.value);

          // If it's a single object and multiple items aren't allowed, set it as the only item
          if (!allowMultipleItems) {
            setItems([fixedItem]);
          } else {
            // Otherwise, wrap it in an array for multiple items
            setItems([fixedItem]);
            // Update form value to be an array
            field.onChange([fixedItem]);
            parentForm.setValue(controller?.name || "", [fixedItem], {
              shouldValidate: true,
            });
          }
        } else if (typeof field.value === "string") {
          try {
            const parsedItems = JSON.parse(field.value);
            if (Array.isArray(parsedItems)) {
              // Fix each item in the array
              const fixedItems = parsedItems.map((item) =>
                flattenStructure(item)
              );
              setItems(fixedItems);

              // Update form with array or object based on addMoreVisible
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
              // Fix the structure
              const fixedItem = flattenStructure(parsedItems);

              // Handle single object
              setItems([fixedItem]);
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
            // Not valid JSON, start with empty array
            setItems([]);
          }
        }
      } catch (error) {
        setItems([]);
      }
    }
  }, []);

  // Update the main form when items change
  useEffect(() => {
    // Skip initial render
    if (!isInitializedRef.current) return;

    if (items.length > 0) {
      // Apply the flattening to each item before updating the form
      const fixedItems = items.map((item) => flattenStructure(item));

      if (!allowMultipleItems) {
        // When not allowing multiple items, store as an object
        field.onChange(fixedItems[0]);
        parentForm.setValue(controller?.name || "", fixedItems[0], {
          shouldValidate: true,
        });
      } else {
        // When allowing multiple items, store as an array
        field.onChange(fixedItems);
        parentForm.setValue(controller?.name || "", fixedItems, {
          shouldValidate: true,
        });
      }
    } else {
      // No items, set empty value
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
  }, [items]);

  // Handle adding a new item
  const handleAddItem = useCallback(() => {
    setEditingIndex(null);
    setValidationErrors([]);

    // Reset the subform
    subformMethods.reset({});

    // Pre-fill form with default values
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

  // Handle editing an existing item
  const handleEditItem = useCallback(
    (index: number) => {
      setEditingIndex(index);
      const itemToEdit = items[index];
      setValidationErrors([]);

      // Reset the subform first
      subformMethods.reset({});

      // Set the current values in the form
      if (
        controller.subform?.formtype === "normal" &&
        controller.subform.controllers
      ) {
        controller.subform.controllers.forEach((ctrl) => {
          if (ctrl.name && itemToEdit) {
            // Handle nested properties using path notation (e.g., "venue.name")
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

            // If found a value, set it in the form
            if (value !== undefined) {
              subformMethods.setValue(ctrl.name, value, {
                shouldValidate: false,
              });
            } else {
              // If not found, set default value
              subformMethods.setValue(ctrl.name, ctrl.defaultValue || "", {
                shouldValidate: false,
              });
            }
          }
        });
      } else if (
        controller.subform?.formtype === "steper" &&
        controller.subform.steps
      ) {
        controller.subform.steps.forEach((step) => {
          step.controllers.forEach((ctrl) => {
            if (ctrl.name && itemToEdit) {
              // Handle nested properties
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

              // Set form value if found
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
          });
        });
      }

      setModalVisible(true);
    },
    [items, controller.subform]
  );

  // Handle deleting an item
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

  // Validate the subform
  const validateSubForm = useCallback(
    (values: any): boolean => {
      // Clear previous validation errors
      setValidationErrors([]);

      // Skip validation if no schema is provided
      if (!controller.subform?.formSchema) {
        return true;
      }

      try {
        const result = controller.subform.formSchema.safeParse(values);

        if (result.success) {
          return true;
        } else {
          // Store validation errors
          setValidationErrors(result.error.issues);

          // Show validation errors in the form
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

  // Function to collect form values
  const collectFormValues = useCallback(() => {
    // Dynamic handling for any field prefix pattern
    if (controller.name) {
      const formValues: { [key: string]: any } = {};
      const controllerPrefix = `${controller.name.toLowerCase()}.`;

      // Get all controller names
      const controllerNames =
        controller.subform?.controllers?.map((ctrl) => ctrl.name) || [];

      // Check if any fields start with the controllerName prefix (e.g., 'venue.', 'ticket.', etc.)
      const prefixedFields = controllerNames.filter(
        (name) => name && name.toLowerCase().startsWith(controllerPrefix)
      );

      // If we have fields that share a common prefix matching our controller name
      if (
        prefixedFields.length > 0 &&
        prefixedFields.length === controllerNames.length
      ) {
        // All fields have the expected prefix
        controller.subform?.controllers?.forEach((ctrl) => {
          if (
            ctrl.name &&
            ctrl.name.toLowerCase().startsWith(controllerPrefix)
          ) {
            // Remove the prefix to get the actual field name
            const prefixLength = controllerPrefix.length;
            const fieldName = ctrl.name.substring(prefixLength);
            formValues[fieldName] = subformMethods.getValues(ctrl.name);
          }
        });
        return formValues;
      }
    }

    // Default behavior when no specific prefix pattern is detected
    const formValues: { [key: string]: any } = {};

    // Helper function to process a controller and handle its nested properties
    const processController = (ctrl: FormControllerProps) => {
      if (!ctrl.name) return;

      // Handle nested properties
      const nameParts = ctrl.name.split(".");

      if (nameParts.length === 1) {
        // Simple property - no nesting
        formValues[ctrl.name] = subformMethods.getValues(ctrl.name);
      } else {
        // Nested property (e.g., "venue.name" or any other nested structure)
        let currentObj = formValues;

        // Build the nested structure
        for (let i = 0; i < nameParts.length - 1; i++) {
          const part = nameParts[i];
          if (!currentObj[part]) {
            currentObj[part] = {};
          }
          currentObj = currentObj[part];
        }

        // Set the value at the deepest level
        currentObj[nameParts[nameParts.length - 1]] = subformMethods.getValues(
          ctrl.name
        );
      }
    };

    // Process all controllers based on form type
    if (controller.subform?.formtype === "steper" && controller.subform.steps) {
      // For stepped forms, collect from all steps
      controller.subform.steps.forEach((step) => {
        step.controllers?.forEach(processController);
      });
    } else if (controller.subform?.controllers) {
      // For normal forms, collect from controllers
      controller.subform.controllers.forEach(processController);
    }

    return formValues;
  }, [controller.name, controller.subform]);

  // Handle submitting the subform
  const handleSubmitSubForm = useCallback(() => {
    // Get all values from the subform
    const values = collectFormValues();

    // Skip if validation fails
    if (!validateSubForm(values)) {
      return;
    }

    // Flatten the structure if needed
    const processedValues = flattenStructure(values);

    if (editingIndex !== null) {
      // Editing existing item
      const newItems = [...items];
      newItems[editingIndex] = processedValues;
      setItems(newItems);
    } else {
      // Adding new item
      if (!allowMultipleItems) {
        // If not allowing multiple items, replace the existing item (if any)
        setItems([processedValues]);
      } else {
        // For multiple items, add to the array
        setItems([...items, processedValues]);
      }
    }

    // Close the modal
    setModalVisible(false);
  }, [
    collectFormValues,
    validateSubForm,
    flattenStructure,
    editingIndex,
    items,
    allowMultipleItems,
  ]);

  // Function to get the title for an item
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

  // Function to close the modal without saving
  const handleCancelModal = useCallback(() => {
    setModalVisible(false);
    setValidationErrors([]);
  }, []);

  // Render the SubForm content based on formtype
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
          onSubmit={() => {}} // No direct submit, use save button instead
          hideStepsIndication={false}
        />
      );
    } else {
      // Default to normal form
      return (
        <NormalHandler
          controllers={subform.controllers}
          form={subformMethods}
          onSubmit={() => {}} // No direct submit, use save button instead
          isStepMode={true} // Hide the submit button in the normal handler
        />
      );
    }
  }, [controller.subform, theme.colors.error]);

  // Helper to safely display nested object data
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

      // Format arrays nicely
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

      // Skip ID fields
      if (key === "id") return null;

      // Show everything else
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
      {/* Current Items Display */}
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
                {/* Use custom display function if provided */}
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

          {/* "Add More" button only appears when addMoreVisible is true */}
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

      {/* Main Add Button - only visible when there are no items or allowMultipleItems is true */}
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

      {/* SubForm Modal */}
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

export default SubFormController;
