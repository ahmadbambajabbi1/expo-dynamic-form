// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Modal,
//   ScrollView,
//   Alert,
//   TextInput,
// } from "react-native";
// import { UseFormReturn } from "react-hook-form";
// import { z } from "zod";
// import { FormControllerProps, StepsType } from "../../types";
// import { Ionicons } from "@expo/vector-icons";

// type SubFormControllerProps = {
//   field: {
//     onChange: (value: any) => void;
//     onBlur: () => void;
//     value: any;
//     name: string;
//   };
//   controller: FormControllerProps & {
//     subform?: {
//       formtype?: "normal" | "steper";
//       controllers?: FormControllerProps[];
//       steps?: StepsType<any>[];
//       formSchema?: z.ZodType<any, any>;
//     };
//     addMoreVisible?: boolean;
//     itemTitle?: string | ((item: any) => string);
//     display?: (item: any) => React.ReactNode;
//     emptyMessage?: string;
//   };
//   form: UseFormReturn<z.TypeOf<any>, any, undefined>;
// };

// /**
//  * SubFormController - Integrated with parent form
//  * This component handles nested form data that is stored within the parent form structure
//  */
// const SubFormController = ({
//   controller,
//   field,
//   form,
// }: SubFormControllerProps) => {
//   const [modalVisible, setModalVisible] = useState(false);
//   const [items, setItems] = useState<any[]>([]);
//   const [editingIndex, setEditingIndex] = useState<number | null>(null);
//   const [, setSubFormValues] = useState<any>({});
//   const [validationErrors, setValidationErrors] = useState<any[]>([]);

//   // Check if multiple items are allowed
//   const allowMultipleItems = controller.addMoreVisible === true;

//   // Function to fix any existing items in the data
//   const flattenStructure = (item: any) => {
//     if (!item || typeof item !== "object") return item;

//     // For ticketTiers items
//     if (
//       item.ticket &&
//       typeof item.ticket === "object" &&
//       controller.name === "ticketTiers"
//     ) {
//       // Move all properties from item.ticket to the root level
//       const result = { ...item.ticket };

//       // Copy any other properties that weren't under 'ticket'
//       Object.keys(item).forEach((key) => {
//         if (key !== "ticket") {
//           result[key] = item[key];
//         }
//       });

//       return result;
//     }

//     // For venue items
//     if (
//       item.venue &&
//       typeof item.venue === "object" &&
//       controller.name === "venue"
//     ) {
//       // Move all properties from item.venue to the root level
//       const result = { ...item.venue };

//       // Copy any other properties that weren't under 'venue'
//       Object.keys(item).forEach((key) => {
//         if (key !== "venue") {
//           result[key] = item[key];
//         }
//       });

//       return result;
//     }

//     return item;
//   };

//   // Initialize from existing value
//   useEffect(() => {
//     if (field.value) {
//       try {
//         // Handle array data
//         if (Array.isArray(field.value)) {
//           // Fix each item in the array
//           const fixedItems = field.value.map((item) => flattenStructure(item));
//           setItems(fixedItems);
//         }
//         // Handle object data
//         else if (
//           typeof field.value === "object" &&
//           field.value !== null &&
//           !Array.isArray(field.value)
//         ) {
//           // Fix the structure
//           const fixedItem = flattenStructure(field.value);

//           // If it's a single object and multiple items aren't allowed, set it as the only item
//           if (!allowMultipleItems) {
//             setItems([fixedItem]);
//           } else {
//             // Otherwise, wrap it in an array for multiple items
//             setItems([fixedItem]);
//             // Update form value to be an array
//             field.onChange([fixedItem]);
//             form.setValue(controller?.name || "", [fixedItem], {
//               shouldValidate: true,
//             });
//           }
//         }
//         // Handle JSON string
//         else if (typeof field.value === "string") {
//           try {
//             const parsedItems = JSON.parse(field.value);
//             if (Array.isArray(parsedItems)) {
//               // Fix each item in the array
//               const fixedItems = parsedItems.map((item) =>
//                 flattenStructure(item)
//               );
//               setItems(fixedItems);

//               // Update form with array or object based on addMoreVisible
//               if (!allowMultipleItems && fixedItems.length === 1) {
//                 field.onChange(fixedItems[0]);
//                 form.setValue(controller?.name || "", fixedItems[0], {
//                   shouldValidate: true,
//                 });
//               } else {
//                 field.onChange(fixedItems);
//                 form.setValue(controller?.name || "", fixedItems, {
//                   shouldValidate: true,
//                 });
//               }
//             } else if (
//               typeof parsedItems === "object" &&
//               parsedItems !== null
//             ) {
//               // Fix the structure
//               const fixedItem = flattenStructure(parsedItems);

//               // Handle single object
//               setItems([fixedItem]);
//               if (!allowMultipleItems) {
//                 field.onChange(fixedItem);
//                 form.setValue(controller?.name || "", fixedItem, {
//                   shouldValidate: true,
//                 });
//               } else {
//                 field.onChange([fixedItem]);
//                 form.setValue(controller?.name || "", [fixedItem], {
//                   shouldValidate: true,
//                 });
//               }
//             }
//           } catch (error) {
//             // Not valid JSON, start with empty array
//             setItems([]);
//           }
//         }
//       } catch (error) {
//         console.error("Error initializing items:", error);
//         setItems([]);
//       }
//     }
//   }, []);

//   // Update the main form when items change
//   useEffect(() => {
//     if (items.length > 0) {
//       // Apply the flattening to each item before updating the form
//       const fixedItems = items.map((item) => flattenStructure(item));

//       if (!allowMultipleItems) {
//         // When not allowing multiple items, store as an object
//         field.onChange(fixedItems[0]);
//         form.setValue(controller?.name || "", fixedItems[0], {
//           shouldValidate: true,
//         });
//       } else {
//         // When allowing multiple items, store as an array
//         field.onChange(fixedItems);
//         form.setValue(controller?.name || "", fixedItems, {
//           shouldValidate: true,
//         });
//       }
//     } else {
//       // No items, set empty value
//       if (!allowMultipleItems) {
//         field.onChange({});
//         form.setValue(
//           controller?.name || "",
//           {},
//           {
//             shouldValidate: true,
//           }
//         );
//       } else {
//         field.onChange([]);
//         form.setValue(controller?.name || "", [], {
//           shouldValidate: true,
//         });
//       }
//     }
//   }, [items]);

//   const handleAddItem = () => {
//     setEditingIndex(null);
//     setSubFormValues({});
//     setValidationErrors([]);

//     // Pre-fill form with default values
//     if (
//       controller.subform?.formtype === "normal" &&
//       controller.subform.controllers
//     ) {
//       controller.subform.controllers.forEach((ctrl) => {
//         if (ctrl.name) {
//           form.setValue(ctrl.name, ctrl.defaultValue || "", {
//             shouldValidate: false,
//           });
//         }
//       });
//     } else if (
//       controller.subform?.formtype === "steper" &&
//       controller.subform.steps
//     ) {
//       controller.subform.steps.forEach((step) => {
//         step.controllers.forEach((ctrl) => {
//           if (ctrl.name) {
//             form.setValue(ctrl.name, ctrl.defaultValue || "", {
//               shouldValidate: false,
//             });
//           }
//         });
//       });
//     }

//     setModalVisible(true);
//   };

//   const handleEditItem = (index: number) => {
//     setEditingIndex(index);
//     const itemToEdit = items[index];
//     setSubFormValues(itemToEdit);
//     setValidationErrors([]);

//     // Set the current values in the form
//     if (
//       controller.subform?.formtype === "normal" &&
//       controller.subform.controllers
//     ) {
//       controller.subform.controllers.forEach((ctrl) => {
//         if (ctrl.name && itemToEdit) {
//           // Handle nested properties using path notation (e.g., "venue.name")
//           const nameParts = ctrl.name.split(".");
//           let value = itemToEdit;

//           for (const part of nameParts) {
//             if (value && typeof value === "object") {
//               value = value[part];
//             } else {
//               value = undefined;
//               break;
//             }
//           }

//           // If found a value, set it in the form
//           if (value !== undefined) {
//             form.setValue(ctrl.name, value, { shouldValidate: false });
//           } else {
//             // If not found, set default value
//             form.setValue(ctrl.name, ctrl.defaultValue || "", {
//               shouldValidate: false,
//             });
//           }
//         }
//       });
//     } else if (
//       controller.subform?.formtype === "steper" &&
//       controller.subform.steps
//     ) {
//       controller.subform.steps.forEach((step) => {
//         step.controllers.forEach((ctrl) => {
//           if (ctrl.name && itemToEdit) {
//             // Handle nested properties
//             const nameParts = ctrl.name.split(".");
//             let value = itemToEdit;

//             for (const part of nameParts) {
//               if (value && typeof value === "object") {
//                 value = value[part];
//               } else {
//                 value = undefined;
//                 break;
//               }
//             }

//             // Set form value if found
//             if (value !== undefined) {
//               form.setValue(ctrl.name, value, { shouldValidate: false });
//             } else {
//               form.setValue(ctrl.name, ctrl.defaultValue || "", {
//                 shouldValidate: false,
//               });
//             }
//           }
//         });
//       });
//     }

//     setModalVisible(true);
//   };

//   const handleDeleteItem = (index: number) => {
//     Alert.alert("Delete Item", "Are you sure you want to delete this item?", [
//       {
//         text: "Cancel",
//         style: "cancel",
//       },
//       {
//         text: "Delete",
//         onPress: () => {
//           const newItems = [...items];
//           newItems.splice(index, 1);
//           setItems(newItems);
//         },
//         style: "destructive",
//       },
//     ]);
//   };

//   const validateSubForm = (values: any): boolean => {
//     // Clear previous validation errors
//     setValidationErrors([]);

//     // Skip validation if no schema is provided
//     if (!controller.subform?.formSchema) {
//       return true;
//     }

//     try {
//       const result = controller.subform.formSchema.safeParse(values);

//       if (result.success) {
//         return true;
//       } else {
//         // Store validation errors
//         setValidationErrors(result.error.issues);

//         // Show validation errors in the form
//         result.error.issues.forEach((issue: any) => {
//           const path = Array.isArray(issue.path) ? issue.path[0] : issue.path;
//           form.setError(path as string, {
//             type: "manual",
//             message: issue.message,
//           });
//         });

//         return false;
//       }
//     } catch (error) {
//       console.error("Validation error:", error);
//       return false;
//     }
//   };

//   // Function to collect form values
//   const collectFormValues = () => {
//     // For venue field pattern
//     if (controller.name === "venue") {
//       const formValues: { [key: string]: any } = {};

//       // Get all controller names
//       const controllerNames =
//         controller.subform?.controllers?.map((ctrl) => ctrl.name) || [];

//       // Check if all fields start with 'venue.'
//       const allFieldsStartWithVenue =
//         controllerNames.length > 0 &&
//         controllerNames.every((name) => name && name.startsWith("venue."));

//       // Collect form values but skip the 'venue.' prefix to flatten the structure
//       if (allFieldsStartWithVenue) {
//         controller.subform?.controllers?.forEach((ctrl) => {
//           if (ctrl.name && ctrl.name.startsWith("venue.")) {
//             const fieldName = ctrl.name.substring(6); // remove 'venue.'
//             formValues[fieldName] = form.getValues(ctrl.name);
//           }
//         });
//         return formValues;
//       }
//     }

//     // For ticket fields in ticketTiers
//     if (controller.name === "ticketTiers" && allowMultipleItems) {
//       const formValues: { [key: string]: any } = {};

//       const controllerNames =
//         controller.subform?.controllers?.map((ctrl) => ctrl.name) || [];

//       const allFieldsStartWithTicket =
//         controllerNames.length > 0 &&
//         controllerNames.every((name) => name && name.startsWith("ticket."));

//       if (allFieldsStartWithTicket) {
//         controller.subform?.controllers?.forEach((ctrl) => {
//           if (ctrl.name && ctrl.name.startsWith("ticket.")) {
//             const fieldName = ctrl.name.substring(7); // remove 'ticket.'
//             formValues[fieldName] = form.getValues(ctrl.name);
//           }
//         });
//         return formValues;
//       }
//     }

//     // Default behavior for other fields
//     const formValues: { [key: string]: any } = {};

//     if (controller.subform?.formtype === "steper" && controller.subform.steps) {
//       controller.subform.steps.forEach((step) => {
//         step.controllers?.forEach((ctrl) => {
//           if (ctrl.name) {
//             // Handle nested properties
//             const nameParts = ctrl.name.split(".");

//             if (nameParts.length === 1) {
//               // Simple property
//               formValues[ctrl.name] = form.getValues(ctrl.name);
//             } else {
//               // Nested property (e.g., venue.name)
//               let currentObj = formValues;

//               for (let i = 0; i < nameParts.length - 1; i++) {
//                 const part = nameParts[i];
//                 if (!currentObj[part]) {
//                   currentObj[part] = {};
//                 }
//                 currentObj = currentObj[part];
//               }

//               currentObj[nameParts[nameParts.length - 1]] = form.getValues(
//                 ctrl.name
//               );
//             }
//           }
//         });
//       });
//     } else if (controller.subform?.controllers) {
//       controller.subform.controllers.forEach((ctrl) => {
//         if (ctrl.name) {
//           // Handle nested properties
//           const nameParts = ctrl.name.split(".");

//           if (nameParts.length === 1) {
//             // Simple property
//             formValues[ctrl.name] = form.getValues(ctrl.name);
//           } else {
//             // Nested property (e.g., venue.name)
//             let currentObj = formValues;

//             for (let i = 0; i < nameParts.length - 1; i++) {
//               const part = nameParts[i];
//               if (!currentObj[part]) {
//                 currentObj[part] = {};
//               }
//               currentObj = currentObj[part];
//             }

//             currentObj[nameParts[nameParts.length - 1]] = form.getValues(
//               ctrl.name
//             );
//           }
//         }
//       });
//     }

//     return formValues;
//   };

//   const handleSubmitSubForm = (values: any) => {
//     // Skip if validation fails
//     if (!validateSubForm(values)) {
//       return;
//     }

//     // Flatten the structure if needed
//     const processedValues = flattenStructure(values);

//     if (editingIndex !== null) {
//       // Editing existing item
//       const newItems = [...items];
//       newItems[editingIndex] = processedValues;
//       setItems(newItems);
//     } else {
//       // Adding new item
//       if (!allowMultipleItems) {
//         // If not allowing multiple items, replace the existing item (if any)
//         setItems([processedValues]);
//       } else {
//         // For multiple items, add to the array
//         setItems([...items, processedValues]);
//       }
//     }

//     setModalVisible(false);
//   };

//   const getItemTitle = (item: any, index: number): string => {
//     if (typeof controller.itemTitle === "function") {
//       const title = controller.itemTitle(item);
//       return title || `Item ${index + 1}`;
//     } else if (
//       typeof controller.itemTitle === "string" &&
//       item[controller.itemTitle]
//     ) {
//       return item[controller.itemTitle];
//     } else if (item.name) {
//       return item.name;
//     } else if (item.title) {
//       return item.title;
//     } else {
//       return `Item ${index + 1}`;
//     }
//   };

//   // Get controllers from either steps or direct controllers
//   const getControllers = () => {
//     if (controller.subform?.formtype === "steper" && controller.subform.steps) {
//       return controller.subform.steps.flatMap((step) => step.controllers || []);
//     }
//     return controller.subform?.controllers || [];
//   };

//   // Simplified form rendering that doesn't depend on other components
//   const renderSimpleForm = () => {
//     if (!controller.subform) {
//       return (
//         <Text style={styles.errorText}>Subform configuration missing</Text>
//       );
//     }

//     const controllers = getControllers();

//     return (
//       <View style={styles.simpleFormContainer}>
//         <Text style={styles.formInstructions}>
//           Fill in the form fields below and tap Save when done.
//         </Text>

//         {controllers.map((ctrl, index) => (
//           <View key={index} style={styles.formField}>
//             {ctrl.label && (
//               <Text style={styles.fieldLabel}>
//                 {ctrl.label}
//                 {!ctrl.optional && <Text style={styles.requiredStar}>*</Text>}
//               </Text>
//             )}

//             <TextInput
//               style={[
//                 styles.fieldInput,
//                 ctrl.type === "textarea" && styles.textareaInput,
//               ]}
//               placeholder={
//                 ctrl.placeholder || `Enter ${ctrl.label || ctrl.name}`
//               }
//               value={form.getValues(ctrl.name || "")}
//               onChangeText={(value) =>
//                 form.setValue(ctrl.name || "", value, {
//                   shouldValidate: true,
//                 })
//               }
//               multiline={ctrl.type === "textarea"}
//               numberOfLines={ctrl.type === "textarea" ? 4 : 1}
//               secureTextEntry={ctrl.type === "password"}
//               keyboardType={
//                 ctrl.type === "number" || ctrl.type === "phone"
//                   ? "numeric"
//                   : ctrl.type === "email"
//                   ? "email-address"
//                   : "default"
//               }
//             />

//             {form.formState.errors[ctrl.name || ""] && (
//               <Text style={styles.fieldError}>
//                 {form.formState.errors[ctrl.name || ""]?.message?.toString()}
//               </Text>
//             )}
//           </View>
//         ))}
//       </View>
//     );
//   };

//   // Helper to safely display nested object data
//   const renderItemDetail = (key: string, value: any, prefix = "") => {
//     const fullKey = prefix ? `${prefix}.${key}` : key;

//     if (value === null || value === undefined) {
//       return null;
//     }

//     if (typeof value === "object" && !Array.isArray(value)) {
//       return Object.entries(value).map(([nestedKey, nestedValue]) =>
//         renderItemDetail(nestedKey, nestedValue, fullKey)
//       );
//     }

//     // Format arrays nicely
//     if (Array.isArray(value)) {
//       const displayValue = value.length > 0 ? value.join(", ") : "none";
//       return (
//         <Text key={fullKey} style={styles.itemDetail}>
//           <Text style={styles.itemDetailLabel}>{key}: </Text>
//           {displayValue}
//         </Text>
//       );
//     }

//     // Skip ID fields
//     if (key === "id") return null;

//     // Show everything else
//     return (
//       <Text key={fullKey} style={styles.itemDetail}>
//         <Text style={styles.itemDetailLabel}>{key}: </Text>
//         {String(value)}
//       </Text>
//     );
//   };

//   return (
//     <View style={styles.container}>
//       {/* Current Items Display */}
//       {items.length > 0 ? (
//         <View style={styles.itemsContainer}>
//           {items.map((item, index) => (
//             <View key={index} style={styles.itemCard}>
//               <View style={styles.itemContent}>
//                 <Text style={styles.itemTitle}>
//                   {getItemTitle(item, index)}
//                 </Text>
//                 {/* Use custom display function if provided */}
//                 {controller.display ? (
//                   <View style={styles.customDisplayContainer}>
//                     {controller.display(item)}
//                   </View>
//                 ) : (
//                   <View style={styles.itemDetails}>
//                     {Object.entries(item).map(([key, value]) =>
//                       renderItemDetail(key, value)
//                     )}
//                   </View>
//                 )}
//               </View>
//               <View style={styles.itemActions}>
//                 <TouchableOpacity
//                   style={styles.editButton}
//                   onPress={() => handleEditItem(index)}
//                 >
//                   <Ionicons name="pencil" size={18} color="#0077CC" />
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   style={styles.deleteButton}
//                   onPress={() => handleDeleteItem(index)}
//                 >
//                   <Ionicons name="trash" size={18} color="#FF3B30" />
//                 </TouchableOpacity>
//               </View>
//             </View>
//           ))}

//           {/* "Add More" button only appears when addMoreVisible is true */}
//           {allowMultipleItems && (
//             <TouchableOpacity
//               style={styles.addMoreButton}
//               onPress={handleAddItem}
//             >
//               <Ionicons name="add-circle" size={20} color="#0077CC" />
//               <Text style={styles.addMoreButtonText}>Add More</Text>
//             </TouchableOpacity>
//           )}
//         </View>
//       ) : (
//         <View style={styles.emptyContainer}>
//           <Text style={styles.emptyText}>
//             {controller.emptyMessage || "No items added yet"}
//           </Text>
//         </View>
//       )}

//       {/* Main Add Button - only visible when there are no items */}
//       {items.length === 0 && (
//         <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
//           <Ionicons name="add" size={20} color="#FFFFFF" />
//           <Text style={styles.addButtonText}>
//             Add {controller.label || "Item"}
//           </Text>
//         </TouchableOpacity>
//       )}

//       {/* SubForm Modal */}
//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={modalVisible}
//         onRequestClose={() => setModalVisible(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>
//                 {editingIndex !== null
//                   ? `Edit ${controller.label || "Item"}`
//                   : `Add ${controller.label || "Item"}`}
//               </Text>
//               <TouchableOpacity onPress={() => setModalVisible(false)}>
//                 <Ionicons name="close" size={24} color="#000" />
//               </TouchableOpacity>
//             </View>

//             <ScrollView style={styles.modalBody}>
//               {renderSimpleForm()}
//             </ScrollView>

//             {validationErrors.length > 0 && (
//               <View style={styles.validationErrorsContainer}>
//                 {validationErrors.map((error, index) => (
//                   <Text key={index} style={styles.validationErrorText}>
//                     {`${error.path.join(".")} - ${error.message}`}
//                   </Text>
//                 ))}
//               </View>
//             )}

//             <View style={styles.modalFooter}>
//               <TouchableOpacity
//                 style={styles.cancelButton}
//                 onPress={() => setModalVisible(false)}
//               >
//                 <Text style={styles.cancelButtonText}>Cancel</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.saveButton}
//                 onPress={() => {
//                   // Collect and validate form values
//                   const formValues = collectFormValues();

//                   // Handle submit with collected values
//                   handleSubmitSubForm(formValues);
//                 }}
//               >
//                 <Text style={styles.saveButtonText}>Save</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     width: "100%",
//   },
//   itemsContainer: {
//     marginBottom: 15,
//   },
//   itemCard: {
//     backgroundColor: "#f8f9fa",
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 10,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     borderWidth: 1,
//     borderColor: "#e0e0e0",
//   },
//   itemContent: {
//     flex: 1,
//   },
//   itemTitle: {
//     fontSize: 16,
//     fontWeight: "600",
//     marginBottom: 5,
//     color: "#0077CC",
//   },
//   customDisplayContainer: {
//     width: "100%",
//   },
//   itemDetails: {},
//   itemDetail: {
//     fontSize: 14,
//     color: "#333",
//     marginBottom: 3,
//   },
//   itemDetailLabel: {
//     fontWeight: "500",
//     color: "#555",
//   },
//   itemActions: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   editButton: {
//     padding: 5,
//     marginRight: 10,
//   },
//   deleteButton: {
//     padding: 5,
//   },
//   addMoreButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     alignSelf: "flex-end",
//     padding: 8,
//     marginTop: 5,
//   },
//   addMoreButtonText: {
//     color: "#0077CC",
//     fontSize: 14,
//     fontWeight: "500",
//     marginLeft: 5,
//   },
//   emptyContainer: {
//     padding: 20,
//     alignItems: "center",
//     backgroundColor: "#f8f9fa",
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#e0e0e0",
//     borderStyle: "dashed",
//   },
//   emptyText: {
//     color: "#666",
//     fontSize: 14,
//   },
//   errorText: {
//     color: "#FF3B30",
//     fontSize: 14,
//     textAlign: "center",
//     padding: 10,
//   },
//   addButton: {
//     backgroundColor: "#0077CC",
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     borderRadius: 5,
//     padding: 12,
//   },
//   addButtonText: {
//     color: "white",
//     fontSize: 16,
//     fontWeight: "500",
//     marginLeft: 8,
//   },
//   modalOverlay: {
//     flex: 1,
//     justifyContent: "flex-end",
//     backgroundColor: "rgba(0, 0, 0, 0.5)",
//   },
//   modalContent: {
//     backgroundColor: "#fff",
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     maxHeight: "90%",
//   },
//   modalHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: "#eee",
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//   },
//   modalBody: {
//     padding: 15,
//     maxHeight: "70%",
//   },
//   validationErrorsContainer: {
//     backgroundColor: "#FFF3F3",
//     borderColor: "#FFCCCC",
//     borderWidth: 1,
//     borderRadius: 5,
//     margin: 15,
//     padding: 10,
//   },
//   validationErrorText: {
//     color: "#D32F2F",
//     fontSize: 12,
//     marginBottom: 3,
//   },
//   modalFooter: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     padding: 15,
//     borderTopWidth: 1,
//     borderTopColor: "#eee",
//   },
//   cancelButton: {
//     flex: 1,
//     backgroundColor: "#f2f2f2",
//     padding: 12,
//     borderRadius: 5,
//     marginRight: 10,
//     alignItems: "center",
//   },
//   cancelButtonText: {
//     color: "#333",
//     fontSize: 16,
//     fontWeight: "500",
//   },
//   saveButton: {
//     flex: 1,
//     backgroundColor: "#0077CC",
//     padding: 12,
//     borderRadius: 5,
//     alignItems: "center",
//   },
//   saveButtonText: {
//     color: "white",
//     fontSize: 16,
//     fontWeight: "500",
//   },
//   // Simple form styles
//   simpleFormContainer: {
//     padding: 5,
//   },
//   formInstructions: {
//     fontSize: 14,
//     color: "#666",
//     marginBottom: 15,
//     textAlign: "center",
//   },
//   formField: {
//     marginBottom: 15,
//   },
//   fieldLabel: {
//     fontSize: 14,
//     fontWeight: "500",
//     marginBottom: 5,
//     color: "#333",
//   },
//   requiredStar: {
//     color: "#FF3B30",
//     marginLeft: 4,
//   },
//   fieldInput: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 5,
//     padding: 10,
//     fontSize: 16,
//     backgroundColor: "#fff",
//     minHeight: 46,
//   },
//   textareaInput: {
//     minHeight: 100,
//     textAlignVertical: "top",
//   },
//   fieldError: {
//     color: "#FF3B30",
//     fontSize: 12,
//     marginTop: 4,
//   },
// });

// export default SubFormController;
import React, { useState, useEffect } from "react";
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
import NormalHandler from "../handlers/SubFormNormalHandler";
import StepsHandler from "../handlers/SubFormStepsHandler";

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
  const [modalVisible, setModalVisible] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [, setSubFormValues] = useState<any>({});
  const [validationErrors, setValidationErrors] = useState<any[]>([]);

  // Check if multiple items are allowed
  const allowMultipleItems = controller.addMoreVisible === true;

  // Function to fix any existing items in the data
  const flattenStructure = (item) => {
    if (!item || typeof item !== "object") return item;

    // For ticketTiers items
    if (
      item.ticket &&
      typeof item.ticket === "object" &&
      controller.name === "ticketTiers"
    ) {
      // Move all properties from item.ticket to the root level
      const result = { ...item.ticket };

      // Copy any other properties that weren't under 'ticket'
      Object.keys(item).forEach((key) => {
        if (key !== "ticket") {
          result[key] = item[key];
        }
      });

      return result;
    }

    // For venue items
    if (
      item.venue &&
      typeof item.venue === "object" &&
      controller.name === "venue"
    ) {
      // Move all properties from item.venue to the root level
      const result = { ...item.venue };

      // Copy any other properties that weren't under 'venue'
      Object.keys(item).forEach((key) => {
        if (key !== "venue") {
          result[key] = item[key];
        }
      });

      return result;
    }

    return item;
  };

  // Initialize from existing value
  useEffect(() => {
    if (field.value) {
      try {
        // Handle array data
        if (Array.isArray(field.value)) {
          // Fix each item in the array
          const fixedItems = field.value.map((item) => flattenStructure(item));
          setItems(fixedItems);
        }
        // Handle object data (for single items when addMoreVisible is false)
        else if (
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
            form.setValue(controller?.name || "", [fixedItem], {
              shouldValidate: true,
            });
          }
        }
        // Handle JSON string
        else if (typeof field.value === "string") {
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
                form.setValue(controller?.name || "", fixedItems[0], {
                  shouldValidate: true,
                });
              } else {
                field.onChange(fixedItems);
                form.setValue(controller?.name || "", fixedItems, {
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
                form.setValue(controller?.name || "", fixedItem, {
                  shouldValidate: true,
                });
              } else {
                field.onChange([fixedItem]);
                form.setValue(controller?.name || "", [fixedItem], {
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
        console.error("Error initializing items:", error);
        setItems([]);
      }
    }
  }, []);

  // Update the main form when items change
  useEffect(() => {
    if (items.length > 0) {
      // Apply the flattening to each item before updating the form
      const fixedItems = items.map((item) => flattenStructure(item));

      if (!allowMultipleItems) {
        // When not allowing multiple items, store as an object
        field.onChange(fixedItems[0]);
        form.setValue(controller?.name || "", fixedItems[0], {
          shouldValidate: true,
        });
      } else {
        // When allowing multiple items, store as an array
        field.onChange(fixedItems);
        form.setValue(controller?.name || "", fixedItems, {
          shouldValidate: true,
        });
      }
    } else {
      // No items, set empty value
      if (!allowMultipleItems) {
        field.onChange({});
        form.setValue(
          controller?.name || "",
          {},
          {
            shouldValidate: true,
          }
        );
      } else {
        field.onChange([]);
        form.setValue(controller?.name || "", [], {
          shouldValidate: true,
        });
      }
    }
  }, [items]);

  const handleAddItem = () => {
    setEditingIndex(null);
    setSubFormValues({});
    setValidationErrors([]);

    // Pre-fill form with default values
    if (
      controller.subform?.formtype === "normal" &&
      controller.subform.controllers
    ) {
      // Clear any existing values for controllers
      controller.subform.controllers.forEach((ctrl) => {
        if (ctrl.name) {
          form.setValue(ctrl.name, ctrl.defaultValue || "", {
            shouldValidate: false,
          });
        }
      });
    } else if (
      controller.subform?.formtype === "steper" &&
      controller.subform.steps
    ) {
      // Clear values for all step controllers
      controller.subform.steps.forEach((step) => {
        step.controllers.forEach((ctrl) => {
          if (ctrl.name) {
            form.setValue(ctrl.name, ctrl.defaultValue || "", {
              shouldValidate: false,
            });
          }
        });
      });
    }

    setModalVisible(true);
  };

  const handleEditItem = (index: number) => {
    setEditingIndex(index);
    const itemToEdit = items[index];
    setSubFormValues(itemToEdit);
    setValidationErrors([]);

    // Set the current values in the form
    if (
      controller.subform?.formtype === "normal" &&
      controller.subform.controllers
    ) {
      // Set all values from the item
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
            form.setValue(ctrl.name, value, { shouldValidate: false });
          } else {
            // If not found, set default value
            form.setValue(ctrl.name, ctrl.defaultValue || "", {
              shouldValidate: false,
            });
          }
        }
      });
    } else if (
      controller.subform?.formtype === "steper" &&
      controller.subform.steps
    ) {
      // Set values for all controllers in all steps
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
              form.setValue(ctrl.name, value, { shouldValidate: false });
            } else {
              form.setValue(ctrl.name, ctrl.defaultValue || "", {
                shouldValidate: false,
              });
            }
          }
        });
      });
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

  const validateSubForm = (values: any): boolean => {
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

  // Function to collect form values
  const collectFormValues = () => {
    // For venue field pattern
    if (controller.name === "venue") {
      const formValues = {};

      // Get all controller names
      const controllerNames =
        controller.subform?.controllers?.map((ctrl) => ctrl.name) || [];

      // Check if all fields start with 'venue.'
      const allFieldsStartWithVenue =
        controllerNames.length > 0 &&
        controllerNames.every((name) => name && name.startsWith("venue."));

      // Collect form values but skip the 'venue.' prefix to flatten the structure
      if (allFieldsStartWithVenue) {
        controller.subform?.controllers?.forEach((ctrl) => {
          if (ctrl.name && ctrl.name.startsWith("venue.")) {
            const fieldName = ctrl.name.substring(6); // remove 'venue.'
            formValues[fieldName] = form.getValues(ctrl.name);
          }
        });
        return formValues;
      }
    }

    // For ticket fields in ticketTiers
    if (controller.name === "ticketTiers" && allowMultipleItems) {
      const formValues = {};

      // Get all controller names
      const controllerNames =
        controller.subform?.controllers?.map((ctrl) => ctrl.name) || [];

      // Check if all fields start with 'ticket.'
      const allFieldsStartWithTicket =
        controllerNames.length > 0 &&
        controllerNames.every((name) => name && name.startsWith("ticket."));

      // Collect form values but skip the 'ticket.' prefix to flatten the structure
      if (allFieldsStartWithTicket) {
        controller.subform?.controllers?.forEach((ctrl) => {
          if (ctrl.name && ctrl.name.startsWith("ticket.")) {
            const fieldName = ctrl.name.substring(7); // remove 'ticket.'
            formValues[fieldName] = form.getValues(ctrl.name);
          }
        });
        return formValues;
      }
    }

    // Default behavior for other fields
    const formValues = {};

    if (controller.subform?.formtype === "steper" && controller.subform.steps) {
      controller.subform.steps.forEach((step) => {
        step.controllers?.forEach((ctrl) => {
          if (ctrl.name) {
            // Handle nested properties
            const nameParts = ctrl.name.split(".");

            if (nameParts.length === 1) {
              // Simple property
              formValues[ctrl.name] = form.getValues(ctrl.name);
            } else {
              // Nested property (e.g., venue.name)
              let currentObj = formValues;

              for (let i = 0; i < nameParts.length - 1; i++) {
                const part = nameParts[i];
                if (!currentObj[part]) {
                  currentObj[part] = {};
                }
                currentObj = currentObj[part];
              }

              currentObj[nameParts[nameParts.length - 1]] = form.getValues(
                ctrl.name
              );
            }
          }
        });
      });
    } else if (controller.subform?.controllers) {
      controller.subform.controllers.forEach((ctrl) => {
        if (ctrl.name) {
          // Handle nested properties
          const nameParts = ctrl.name.split(".");

          if (nameParts.length === 1) {
            // Simple property
            formValues[ctrl.name] = form.getValues(ctrl.name);
          } else {
            // Nested property (e.g., venue.name)
            let currentObj = formValues;

            for (let i = 0; i < nameParts.length - 1; i++) {
              const part = nameParts[i];
              if (!currentObj[part]) {
                currentObj[part] = {};
              }
              currentObj = currentObj[part];
            }

            currentObj[nameParts[nameParts.length - 1]] = form.getValues(
              ctrl.name
            );
          }
        }
      });
    }

    return formValues;
  };

  const handleSubmitSubForm = (values) => {
    // Skip validation if validation fails
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

    setModalVisible(false);
  };

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

  // Render the SubForm content based on formtype
  const renderSubForm = () => {
    if (!controller.subform) {
      return (
        <Text style={styles.errorText}>Subform configuration missing</Text>
      );
    }

    const subform = controller.subform;

    if (subform.formtype === "steper" && subform.steps) {
      return (
        <StepsHandler
          steps={subform.steps}
          form={form}
          onSubmit={() => {}} // No submit button in modal, handled by Save button
          hideStepsIndication={false} // Hide the submit button in the step handler
        />
      );
    } else {
      // Default to normal form
      return (
        <NormalHandler
          controllers={subform.controllers}
          form={form}
          onSubmit={() => {}} // No submit button in modal, handled by Save button
          isStepMode={true} // Hide the submit button in the normal handler
        />
      );
    }
  };

  // Helper to safely display nested object data
  const renderItemDetail: any = (key: string, value: any, prefix = "") => {
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

      {/* Main Add Button - only visible when there are no items */}
      {items.length === 0 && (
        <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>
            Add {controller.label || "Item"}
          </Text>
        </TouchableOpacity>
      )}

      {/* SubForm Modal */}
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

            <ScrollView style={styles.modalBody}>{renderSubForm()}</ScrollView>

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
                onPress={() => {
                  // Collect and validate form values
                  const formValues = collectFormValues();

                  // Handle submit with collected values
                  handleSubmitSubForm(formValues);
                }}
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
