// import React, { useEffect, useState } from "react";
// import { View, Text, StyleSheet } from "react-native";
// import { UseFormReturn, useWatch } from "react-hook-form";
// import { z } from "zod";
// import { FormControllerProps, PropsPropsType } from "../../types";

// // Import controllers
// import SelectController from "../controllers/SelectController";
// import TextareaController from "../controllers/TextareaController";
// import CheckBoxController from "../controllers/CheckBoxController";
// import DefaultInputController from "../controllers/DefaultInputController";
// import NumberInputController from "../controllers/NumberInputController";
// import MultiSelectController from "../controllers/MultiSelectController";
// import SearchableSelectController from "../controllers/SearchableSelectController";
// import DateHandler from "../controllers/DateHandler";
// import DateOfBirthHandler from "../controllers/DateOfBirthHandler";
// import LocationController from "../controllers/LocationController";
// import CurrentLocationController from "../controllers/CurrentLocationController";
// import PhoneController from "../controllers/PhoneController";
// import TagsInputController from "../controllers/TagsInputController";
// import SubFormController from "../controllers/SubFormController";
// import FileUploadController from "../controllers/FileUploadController";
// import CurrencyController from "../controllers/CurrencyController";
// import ListCreatorController from "../controllers/ListCreatorController";
// import FeaturedImageController from "../controllers/FeaturedImageController";
// import ImageGalleryController from "../controllers/ImageGalleryController";
// import ValueCounter from "../controllers/ValueCounter";

// type PropsType = {
//   controller: FormControllerProps;
//   form: UseFormReturn<z.TypeOf<any>, any, undefined>;
//   props?: PropsPropsType;
// };

// const FormElementHandler = ({ controller, form, props }: PropsType) => {
//   const selectedValues = useWatch({
//     control: form.control,
//     name: controller.name || "",
//   });

//   const [mappedControllers, setMappedControllers] = useState<
//     FormControllerProps[]
//   >([]);

//   useEffect(() => {
//     const fetchControllers = async () => {
//       if (
//         controller.mapController &&
//         typeof controller.mapController === "function"
//       ) {
//         if (selectedValues === undefined) return;
//         if (selectedValues === null) return;
//         if (selectedValues === "") {
//           setMappedControllers([]);
//           return;
//         }
//         const newControllers = await controller?.mapController(selectedValues);
//         setMappedControllers(newControllers);
//       }
//     };
//     fetchControllers();
//   }, [selectedValues, controller.mapController]);

//   const renderFormField = () => {
//     const field = form.register(controller?.name || "");
//     const value = form.getValues(controller?.name || "");
//     // const error = form.formState.errors[controller?.name || ""];

//     // Create a field object similar to the one in react-hook-form for web
//     const fieldProps = {
//       onChange: (value: any) => form.setValue(controller?.name || "", value),
//       onBlur: field.onBlur,
//       value: value,
//       name: controller?.name || "",
//     };

//     switch (controller.type) {
//       case "select":
//         return (
//           <SelectController
//             form={form}
//             controller={controller}
//             field={fieldProps as any}
//           />
//         );
//       case "multi-select":
//         return (
//           <MultiSelectController
//             controller={controller}
//             field={fieldProps as any}
//             form={form}
//           />
//         );
//       case "searchable-select":
//         return (
//           <SearchableSelectController
//             controller={controller}
//             field={fieldProps as any}
//             form={form}
//           />
//         );
//       case "textarea":
//         return (
//           <TextareaController
//             controller={controller}
//             field={fieldProps as any}
//           />
//         );
//       case "checkbox":
//         return (
//           <CheckBoxController
//             form={form}
//             checkBoxController={controller}
//             field={fieldProps as any}
//           />
//         );
//       case "group-checkbox":
//         return controller?.groupCheckbox?.map((checkbox, index) => (
//           <React.Fragment
//             key={`${index}-${checkbox?.label}-${checkbox?.name}-${checkbox?.placeholder}`}
//           >
//             <Text style={styles.label}>{checkbox?.label || ""}</Text>
//             <CheckBoxController
//               form={form}
//               items={checkbox?.options !== "from-api" ? checkbox.options : []}
//               baseStyle={styles.checkboxGroup}
//               checkBoxController={checkbox}
//             />
//             {form.formState.errors[checkbox?.name || ""] && (
//               <Text style={styles.errorText}>
//                 {form.formState.errors[
//                   checkbox?.name || ""
//                 ]?.message?.toString()}
//               </Text>
//             )}
//           </React.Fragment>
//         ));
//       case "date":
//         return (
//           <DateHandler controller={controller} field={fieldProps as any} />
//         );
//       case "date-of-birth":
//         return (
//           <DateOfBirthHandler
//             controller={controller}
//             field={fieldProps as any}
//           />
//         );
//       case "location":
//       case "multi-location":
//         return (
//           <LocationController
//             controller={controller}
//             field={fieldProps as any}
//             form={form}
//           />
//         );
//       case "list-creator":
//         return (
//           <ListCreatorController
//             controller={controller}
//             field={fieldProps as any}
//             form={form}
//           />
//         );
//       case "featured-image":
//         return (
//           <FeaturedImageController
//             controller={controller}
//             field={fieldProps as any}
//             form={form}
//           />
//         );
//       case "image-gallery":
//         return (
//           <ImageGalleryController
//             controller={controller}
//             field={fieldProps as any}
//             form={form}
//           />
//         );
//       case "currency":
//         return (
//           <CurrencyController
//             controller={controller}
//             field={fieldProps as any}
//             form={form}
//           />
//         );
//       case "current-location":
//         return (
//           <CurrentLocationController
//             controller={controller}
//             field={fieldProps as any}
//             form={form}
//           />
//         );
//       case "file-upload":
//         return (
//           <FileUploadController
//             controller={controller}
//             field={fieldProps as any}
//             form={form}
//           />
//         );
//       case "tags-input":
//         return (
//           <TagsInputController
//             controller={controller}
//             field={fieldProps as any}
//             form={form}
//           />
//         );
//       case "phone":
//         return (
//           <PhoneController
//             controller={controller}
//             field={fieldProps as any}
//             form={form}
//           />
//         );
//       case "sub-form":
//         return (
//           <SubFormController
//             controller={controller}
//             field={fieldProps as any}
//             form={form}
//           />
//         );
//       case "number":
//         return (
//           <NumberInputController
//             controller={controller}
//             field={fieldProps as any}
//             form={form}
//           />
//         );
//       case "react-node":
//         return typeof controller?.reactNode === "function"
//           ? (
//               controller.reactNode as (args: {
//                 form: UseFormReturn<z.TypeOf<any>, any, undefined>;
//               }) => React.ReactNode
//             )({ form })
//           : controller?.reactNode || null;
//       default:
//         return (
//           <DefaultInputController
//             controller={controller}
//             field={fieldProps as any}
//             form={form}
//           />
//         );
//     }
//   };

//   return (
//     <>
//       <View style={[styles.fieldContainer, controller.style]}>
//         {controller.type !== "group-checkbox" &&
//           controller.type !== "sub-form" &&
//           controller.label && (
//             <View style={styles.labelContainer}>
//               <Text style={[styles.label, controller.labelProps?.style]}>
//                 {controller?.label}
//                 {controller?.optional ? (
//                   <Text style={styles.optional}> (optional)</Text>
//                 ) : (
//                   <Text style={styles.required}>*</Text>
//                 )}
//               </Text>

//               {controller?.maximun && (
//                 <ValueCounter
//                   value={form.getValues(controller?.name || "")}
//                   maximun={controller?.maximun}
//                 />
//               )}
//             </View>
//           )}

//         {renderFormField()}

//         {controller?.description && (
//           <Text style={styles.description}>{controller?.description}</Text>
//         )}

//         {form.formState.errors[controller?.name || ""] && (
//           <Text style={styles.errorText}>
//             {form.formState.errors[controller?.name || ""]?.message?.toString()}
//           </Text>
//         )}
//       </View>

//       {mappedControllers?.length > 0 &&
//         mappedControllers.map((controller, index) => {
//           if (controller.groupControllers) {
//             return (
//               <View
//                 key={`${index}-${controller?.groupName || controller?.type}`}
//                 style={[styles.groupContainer, controller?.style]}
//               >
//                 {controller?.groupName && (
//                   <Text style={styles.groupName}>{controller?.groupName}</Text>
//                 )}
//                 <View
//                   style={
//                     props?.groupcontrollerBase?.style ||
//                     styles.groupControllerContainer
//                   }
//                 >
//                   {controller?.groupControllers?.map((groupController) => (
//                     <FormElementHandler
//                       key={`${index}-${groupController?.name}`}
//                       controller={groupController}
//                       form={form}
//                       props={props}
//                     />
//                   ))}
//                 </View>
//               </View>
//             );
//           }
//           return (
//             <FormElementHandler
//               key={`${index}-${controller?.name}`}
//               controller={controller}
//               form={form}
//               props={props}
//             />
//           );
//         })}
//     </>
//   );
// };

// const styles = StyleSheet.create({
//   fieldContainer: {
//     marginBottom: 16,
//     width: "100%",
//   },
//   labelContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 8,
//   },
//   label: {
//     fontSize: 14,
//     fontWeight: "600",
//     marginLeft: 8,
//   },
//   required: {
//     color: "red",
//     marginLeft: 4,
//   },
//   optional: {
//     color: "#666",
//     fontWeight: "normal",
//   },
//   description: {
//     fontSize: 12,
//     color: "#666",
//     marginTop: 4,
//     marginLeft: 8,
//   },
//   errorText: {
//     color: "red",
//     fontSize: 12,
//     marginTop: 4,
//     marginLeft: 8,
//   },
//   groupContainer: {
//     marginTop: 16,
//     marginBottom: 16,
//   },
//   groupName: {
//     fontSize: 16,
//     fontWeight: "bold",
//     textTransform: "uppercase",
//     marginLeft: 8,
//     marginBottom: 8,
//   },
//   groupControllerContainer: {
//     paddingHorizontal: 8,
//   },
//   checkboxGroup: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//   },
// });

// export default FormElementHandler;

import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { UseFormReturn, useWatch } from "react-hook-form";
import { z } from "zod";
import { FormControllerProps, PropsPropsType } from "../../types";
import { Ionicons } from "@expo/vector-icons";

// Import controllers
import SelectController from "../controllers/SelectController";
import TextareaController from "../controllers/TextareaController";
import CheckBoxController from "../controllers/CheckBoxController";
import DefaultInputController from "../controllers/DefaultInputController";
import NumberInputController from "../controllers/NumberInputController";
import MultiSelectController from "../controllers/MultiSelectController";
import SearchableSelectController from "../controllers/SearchableSelectController";
import DateOfBirthHandler from "../controllers/DateOfBirthHandler";
import LocationController from "../controllers/LocationController";
import CurrentLocationController from "../controllers/CurrentLocationController";
import PhoneController from "../controllers/PhoneController";
import TagsInputController from "../controllers/TagsInputController";
import SubFormController from "../controllers/SubFormController";
import FileUploadController from "../controllers/FileUploadController";
import CurrencyController from "../controllers/CurrencyController";
import ListCreatorController from "../controllers/ListCreatorController";
import FeaturedImageController from "../controllers/FeaturedImageController";
import ImageGalleryController from "../controllers/ImageGalleryController";
import ValueCounter from "../controllers/ValueCounter";
import DateTimeController from "../controllers/DateAndTimeContrller";
import RichTextEditorController from "../controllers/RichTextEditorController";

type PropsType = {
  controller: FormControllerProps;
  form: UseFormReturn<z.TypeOf<any>, any, undefined>;
  props?: PropsPropsType;
};

const FormElementHandler = ({ controller, form, props }: PropsType) => {
  const selectedValues = useWatch({
    control: form.control,
    name: controller.name || "",
  });

  const [mappedControllers, setMappedControllers] = useState<
    FormControllerProps[]
  >([]);

  // Handle group-checkbox specially
  const [groupCheckboxState, setGroupCheckboxState] = useState<
    Record<string, boolean>
  >({});

  // Initialize group checkbox state
  useEffect(() => {
    if (controller.type === "group-checkbox" && controller.groupCheckbox) {
      const initialState: Record<string, boolean> = {};

      controller.groupCheckbox.forEach((checkbox) => {
        initialState[checkbox.name || ""] = checkbox.defaultValue === true;
      });

      setGroupCheckboxState(initialState);

      // Set the form value directly for the parent field
      form.setValue(controller.name || "", initialState);
    }
  }, [controller, form]);

  useEffect(() => {
    const fetchControllers = async () => {
      if (
        controller.mapController &&
        typeof controller.mapController === "function"
      ) {
        if (selectedValues === undefined) return;
        if (selectedValues === null) return;
        if (selectedValues === "") {
          setMappedControllers([]);
          return;
        }
        const newControllers = await controller?.mapController(selectedValues);
        setMappedControllers(newControllers);
      }
    };
    fetchControllers();
  }, [selectedValues, controller.mapController]);

  // Handle group checkbox toggle
  const handleGroupCheckboxToggle = (checkboxName: string) => {
    if (!controller.name) return;

    // Update local state
    const newState = {
      ...groupCheckboxState,
      [checkboxName]: !groupCheckboxState[checkboxName],
    };

    setGroupCheckboxState(newState);

    // Update form value
    form.setValue(controller.name, newState, {
      shouldValidate: true,
    });
  };

  // Custom render for group-checkbox
  const renderGroupCheckbox = () => {
    if (!controller.groupCheckbox) return null;

    return (
      <>
        {controller.groupCheckbox.map((checkbox) => (
          <TouchableOpacity
            key={checkbox.name}
            style={styles.checkboxContainer}
            onPress={() => handleGroupCheckboxToggle(checkbox.name || "")}
          >
            <View
              style={[
                styles.checkbox,
                groupCheckboxState[checkbox.name || ""]
                  ? styles.checkboxChecked
                  : styles.checkboxUnchecked,
              ]}
            >
              {groupCheckboxState[checkbox.name || ""] && (
                <Ionicons name="checkmark" size={16} color="#fff" />
              )}
            </View>
            <Text style={styles.checkboxLabel}>{checkbox.label}</Text>
          </TouchableOpacity>
        ))}
      </>
    );
  };

  const renderFormField = () => {
    const field = form.register(controller?.name || "");
    const value = form.getValues(controller?.name || "");

    // Create a field object similar to the one in react-hook-form for web
    const fieldProps = {
      onChange: (value: any) => form.setValue(controller?.name || "", value),
      onBlur: field.onBlur,
      value: value,
      name: controller?.name || "",
    };

    // Handle group-checkbox separately in this component
    if (controller.type === "group-checkbox") {
      return renderGroupCheckbox();
    }

    switch (controller.type) {
      case "select":
        return (
          <SelectController
            form={form}
            controller={controller}
            field={fieldProps as any}
          />
        );
      case "multi-select":
        return (
          <MultiSelectController
            controller={controller}
            field={fieldProps as any}
            form={form}
          />
        );
      case "searchable-select":
        return (
          <SearchableSelectController
            controller={controller}
            field={fieldProps as any}
            form={form}
          />
        );
      case "rich-text":
        return (
          <RichTextEditorController
            controller={controller}
            field={fieldProps as any}
          />
        );
      case "date":
        return (
          <DateTimeController
            controller={controller}
            field={fieldProps as any}
            form={form}
          />
        );
      case "textarea":
        return (
          <TextareaController
            controller={controller}
            field={fieldProps as any}
          />
        );
      case "checkbox":
        return (
          <CheckBoxController
            form={form}
            checkBoxController={controller}
            field={fieldProps as any}
          />
        );
      case "date-of-birth":
        return (
          <DateOfBirthHandler
            controller={controller}
            field={fieldProps as any}
          />
        );
      case "location":
      case "multi-location":
        return (
          <LocationController
            controller={controller}
            field={fieldProps as any}
            form={form}
          />
        );
      case "list-creator":
        return (
          <ListCreatorController
            controller={controller}
            field={fieldProps as any}
            form={form}
          />
        );
      case "featured-image":
        return (
          <FeaturedImageController
            controller={controller}
            field={fieldProps as any}
            form={form}
          />
        );
      case "image-gallery":
        return (
          <ImageGalleryController
            controller={controller}
            field={fieldProps as any}
            form={form}
          />
        );
      case "currency":
        return (
          <CurrencyController
            controller={controller}
            field={fieldProps as any}
            form={form}
          />
        );
      case "current-location":
        return (
          <CurrentLocationController
            controller={controller}
            field={fieldProps as any}
            form={form}
          />
        );
      case "file-upload":
        return (
          <FileUploadController
            controller={controller}
            field={fieldProps as any}
            form={form}
          />
        );
      case "tags-input":
        return (
          <TagsInputController
            controller={controller}
            field={fieldProps as any}
            form={form}
          />
        );
      case "phone":
        return (
          <PhoneController
            controller={controller}
            field={fieldProps as any}
            form={form}
          />
        );
      case "sub-form":
        return (
          <SubFormController
            controller={controller}
            field={fieldProps as any}
            form={form}
          />
        );
      case "number":
        return (
          <NumberInputController
            controller={controller}
            field={fieldProps as any}
            form={form}
          />
        );
      case "react-node":
        return typeof controller?.reactNode === "function"
          ? (
              controller.reactNode as (args: {
                form: UseFormReturn<z.TypeOf<any>, any, undefined>;
              }) => React.ReactNode
            )({ form })
          : controller?.reactNode || null;
      default:
        return (
          <DefaultInputController
            controller={controller}
            field={fieldProps as any}
            form={form}
          />
        );
    }
  };

  return (
    <>
      <View style={[styles.fieldContainer, controller.style]}>
        {controller.type !== "sub-form" && controller.label && (
          <View style={styles.labelContainer}>
            <Text style={[styles.label, controller.labelProps?.style]}>
              {controller?.label}
              {controller?.optional ? (
                <Text style={styles.optional}> (optional)</Text>
              ) : (
                <Text style={styles.required}>*</Text>
              )}
            </Text>

            {controller?.maximun && (
              <ValueCounter
                value={form.getValues(controller?.name || "")}
                maximun={controller?.maximun}
              />
            )}
          </View>
        )}

        {renderFormField()}

        {controller?.description && (
          <Text style={styles.description}>{controller?.description}</Text>
        )}

        {form.formState.errors[controller?.name || ""] && (
          <Text style={styles.errorText}>
            {form.formState.errors[controller?.name || ""]?.message?.toString()}
          </Text>
        )}
      </View>

      {mappedControllers?.length > 0 &&
        mappedControllers.map((controller, index) => {
          if (controller.groupControllers) {
            return (
              <View
                key={`${index}-${controller?.groupName || controller?.type}`}
                style={[styles.groupContainer, controller?.style]}
              >
                {controller?.groupName && (
                  <Text style={styles.groupName}>{controller?.groupName}</Text>
                )}
                <View
                  style={
                    props?.groupcontrollerBase?.style ||
                    styles.groupControllerContainer
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
    </>
  );
};

const styles = StyleSheet.create({
  fieldContainer: {
    marginBottom: 16,
    width: "100%",
  },
  labelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  required: {
    color: "red",
    marginLeft: 4,
  },
  optional: {
    color: "#666",
    fontWeight: "normal",
  },
  description: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    marginLeft: 8,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 8,
  },
  groupContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  groupName: {
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginLeft: 8,
    marginBottom: 8,
  },
  groupControllerContainer: {
    paddingHorizontal: 8,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  checkboxUnchecked: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  checkboxChecked: {
    backgroundColor: "#0077CC",
    borderWidth: 1,
    borderColor: "#0077CC",
  },
  checkboxLabel: {
    fontSize: 16,
  },
});

export default FormElementHandler;
