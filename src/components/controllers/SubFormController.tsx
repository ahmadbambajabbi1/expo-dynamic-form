import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from "react-native";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { FormControllerProps, StepsType } from "../../types/index";
import { Ionicons } from "@expo/vector-icons";
import SubFormNormalHandler from "../handlers/SubFormNormalHandler";
import SubFormStepsHandler from "../handlers/SubFormStepsHandler";

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
  form,
}: SubFormControllerProps) => {
  // Track initialization state to avoid re-initializing
  const initializedRef = useRef(false);

  // Main state
  const [modalVisible, setModalVisible] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [validationErrors, setValidationErrors] = useState<any[]>([]);

  // Check if multiple items are allowed
  const allowMultipleItems = controller.addMoreVisible === true;

  // Initialize items from field value only once
  useEffect(() => {
    if (initializedRef.current) return;

    if (field.value) {
      try {
        if (Array.isArray(field.value)) {
          // If it's already an array, use it directly
          setItems(field.value);
        } else if (typeof field.value === "object" && field.value !== null) {
          // If it's a single object and we don't allow multiple items, wrap it in an array for internal use
          setItems([field.value]);
        } else if (typeof field.value === "string") {
          try {
            // Try parsing as JSON
            const parsed = JSON.parse(field.value);
            setItems(Array.isArray(parsed) ? parsed : [parsed]);
          } catch {
            // Not valid JSON
          }
        }
      } catch (error) {
        console.error("Error initializing items:", error);
      }
    }

    initializedRef.current = true;
  }, []);

  // Update the parent form when items change, but we need to handle the format differently
  // based on whether multiple items are allowed
  useEffect(() => {
    if (items.length > 0) {
      if (allowMultipleItems) {
        // For multiple items, return the array
        field.onChange(items);
        form.setValue(controller?.name || "", items, {
          shouldValidate: true,
        });
      } else {
        // For single item, return only the first object
        field.onChange(items[0]);
        form.setValue(controller?.name || "", items[0], {
          shouldValidate: true,
        });
      }
    } else {
      // No items, set appropriate empty value
      if (allowMultipleItems) {
        field.onChange([]);
        form.setValue(controller?.name || "", [], {
          shouldValidate: true,
        });
      } else {
        field.onChange({});
        form.setValue(
          controller?.name || "",
          {},
          {
            shouldValidate: true,
          }
        );
      }
    }
  }, [items, allowMultipleItems]);

  const handleAddItem = () => {
    setEditingIndex(null);
    setValidationErrors([]);

    // Clear the form for a new item
    const subformControllers =
      controller.subform?.formtype === "steper"
        ? controller.subform.steps?.flatMap((step) => step.controllers) || []
        : controller.subform?.controllers || [];

    // Reset with default values only
    const defaultValues = {};
    subformControllers.forEach((ctrl) => {
      if (ctrl.name && ctrl.defaultValue !== undefined) {
        defaultValues[ctrl.name] = ctrl.defaultValue;
      }
    });

    form.reset(defaultValues);

    setModalVisible(true);
  };

  const handleEditItem = (index: number) => {
    setEditingIndex(index);
    setValidationErrors([]);

    // Reset form with item values
    const itemToEdit = items[index];
    if (itemToEdit) {
      form.reset(itemToEdit);
    }

    setModalVisible(true);
  };

  const handleDeleteItem = (index: number) => {
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
  };

  const validateSubForm = () => {
    if (!controller.subform?.formSchema) {
      return true;
    }

    try {
      const values = form.getValues();
      const result = controller.subform.formSchema.safeParse(values);

      if (result.success) {
        return true;
      } else {
        setValidationErrors(result.error.issues);

        result.error.issues.forEach((issue) => {
          const path = Array.isArray(issue.path) ? issue.path[0] : issue.path;
          form.setError(path as string, {
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
  };

  const handleSubmitSubForm = () => {
    if (!validateSubForm()) {
      return;
    }

    // Get current form values
    const formValues = form.getValues();

    let newItems;
    if (editingIndex !== null) {
      // Edit existing item
      newItems = [...items];
      newItems[editingIndex] = formValues;
    } else {
      // Add new item
      if (!allowMultipleItems) {
        newItems = [formValues];
      } else {
        newItems = [...items, formValues];
      }
    }

    // Update local state
    setItems(newItems);

    // Close modal
    setModalVisible(false);
  };

  // Get title for item display
  const getItemTitle = (item: any, index: number): string => {
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
  };

  // Helper to safely display nested object data
  const renderItemDetail = (key: string, value: any, prefix = "") => {
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
        <Text key={fullKey} style={styles.itemDetail}>
          <Text style={styles.itemDetailLabel}>{key}: </Text>
          {displayValue}
        </Text>
      );
    }

    // Skip ID fields
    if (key === "id") return null;

    // Date handling - convert date strings to readable format
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
      try {
        const dateObj = new Date(value);
        if (!isNaN(dateObj.getTime())) {
          value = dateObj.toLocaleDateString();
        }
      } catch (e) {
        // Not a valid date, continue with the string value
      }
    }

    // Show everything else
    return (
      <Text key={fullKey} style={styles.itemDetail}>
        <Text style={styles.itemDetailLabel}>{key}: </Text>
        {String(value)}
      </Text>
    );
  };

  return (
    <View style={styles.container}>
      {/* Current Items Display */}
      {items.length > 0 ? (
        <View style={styles.itemsContainer}>
          {items.map((item, index) => (
            <View key={index} style={styles.itemCard}>
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>
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
                  <Ionicons name="pencil" size={18} color="#0077CC" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteItem(index)}
                >
                  <Ionicons name="trash" size={18} color="#FF3B30" />
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
              <Ionicons name="add-circle" size={20} color="#0077CC" />
              <Text style={styles.addMoreButtonText}>Add More</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {controller.emptyMessage || "No items added yet"}
          </Text>
        </View>
      )}

      {/* Main Add Button - only visible when there are no items or when multiple items are allowed */}
      {(items.length === 0 || (allowMultipleItems && items.length > 0)) &&
        items.length === 0 && (
          <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>
              Add {controller.label || "Item"}
            </Text>
          </TouchableOpacity>
        )}

      {/* SubForm Modal - Only render when visible for better performance */}
      {modalVisible && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingIndex !== null
                    ? `Edit ${controller.label || "Item"}`
                    : `Add ${controller.label || "Item"}`}
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#000" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                {controller.subform?.formtype === "steper" &&
                controller.subform.steps ? (
                  <SubFormStepsHandler
                    steps={controller.subform.steps}
                    form={form}
                    onSubmit={() => {}}
                    hideStepsIndication={false}
                  />
                ) : (
                  <SubFormNormalHandler
                    controllers={controller.subform?.controllers}
                    form={form}
                    onSubmit={() => {}}
                    isStepMode={true}
                  />
                )}
              </ScrollView>

              {validationErrors.length > 0 && (
                <View style={styles.validationErrorsContainer}>
                  {validationErrors.map((error, index) => (
                    <Text key={index} style={styles.validationErrorText}>
                      {`${error.path.join(".")} - ${error.message}`}
                    </Text>
                  ))}
                </View>
              )}

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSubmitSubForm}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
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
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
    color: "#0077CC",
  },
  customDisplayContainer: {
    width: "100%",
  },
  itemDetails: {},
  itemDetail: {
    fontSize: 14,
    color: "#333",
    marginBottom: 3,
  },
  itemDetailLabel: {
    fontWeight: "500",
    color: "#555",
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
    color: "#0077CC",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 5,
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderStyle: "dashed",
  },
  emptyText: {
    color: "#666",
    fontSize: 14,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 14,
    textAlign: "center",
    padding: 10,
  },
  addButton: {
    backgroundColor: "#0077CC",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    padding: 12,
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
    backgroundColor: "#fff",
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
    borderBottomColor: "#eee",
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
    backgroundColor: "#FFF3F3",
    borderColor: "#FFCCCC",
    borderWidth: 1,
    borderRadius: 5,
    margin: 15,
    padding: 10,
  },
  validationErrorText: {
    color: "#D32F2F",
    fontSize: 12,
    marginBottom: 3,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    padding: 12,
    borderRadius: 5,
    marginRight: 10,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "500",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#0077CC",
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
