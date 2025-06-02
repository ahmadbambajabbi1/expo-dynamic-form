// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Image,
//   ActivityIndicator,
//   Alert,
// } from "react-native";
// import { UseFormReturn } from "react-hook-form";
// import { z } from "zod";
// import { FormControllerProps } from "../../types";
// import { Ionicons } from "@expo/vector-icons";
// import * as ImagePicker from "expo-image-picker";
// import * as FileSystem from "expo-file-system";

// type PropsType = {
//   field: {
//     onChange: (value: any) => void;
//     onBlur: () => void;
//     value: any;
//     name: string;
//   };
//   controller: FormControllerProps;
//   form: UseFormReturn<z.TypeOf<any>, any, undefined>;
// };

// const FeaturedImageController = ({ controller, field, form }: PropsType) => {
//   const [imageUri, setImageUri] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   // Initialize with field value if it exists
//   useEffect(() => {
//     if (field.value) {
//       if (typeof field.value === "string") {
//         setImageUri(field.value);
//       } else if (
//         typeof field.value === "object" &&
//         field.value !== null &&
//         field.value.uri
//       ) {
//         setImageUri(field.value.uri);
//         // If we want to return just the URI, update form value
//         if (!controller.returnFullImageObject) {
//           field.onChange(field.value.uri);
//           form.setValue(controller?.name || "", field.value.uri, {
//             shouldValidate: true,
//           });
//         }
//       }
//     }
//   }, []);

//   // Update form when image changes
//   useEffect(() => {
//     field.onChange(imageUri);
//     form.setValue(controller?.name || "", imageUri, {
//       shouldValidate: true,
//     });
//   }, [imageUri]);

//   const requestPermissions = async () => {
//     const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (status !== "granted") {
//       Alert.alert(
//         "Permission Required",
//         "Please grant camera roll permissions to upload images."
//       );
//       return false;
//     }
//     return true;
//   };

//   const pickImage = async () => {
//     if (loading) return;

//     const hasPermission = await requestPermissions();
//     if (!hasPermission) return;

//     setLoading(true);
//     setError(null);

//     try {
//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         allowsEditing: controller.allowsEditing ?? true,
//         aspect: controller.aspect ? controller.aspect : [16, 9],
//         quality: 0.8,
//       });

//       if (!result.canceled && result.assets && result.assets.length > 0) {
//         const selectedImage = result.assets[0];

//         // Check file size if maxFileSize is specified
//         if (controller.maxFileSize) {
//           const fileInfo = await FileSystem.getInfoAsync(selectedImage.uri);
//           if (fileInfo.exists && fileInfo.size > controller.maxFileSize) {
//             const mbSize = (controller.maxFileSize / (1024 * 1024)).toFixed(1);
//             setError(`Image is too large. Maximum file size is ${mbSize}MB.`);
//             setLoading(false);
//             return;
//           }
//         }

//         setImageUri(selectedImage.uri);
//       }
//     } catch (error) {
//       console.error("Error picking image:", error);
//       setError("Failed to select image. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // const isRequired = !controller.optional;

//   return (
//     <View style={styles.container}>
//       <View style={[styles.imageContainer, controller.style]}>
//         {imageUri ? (
//           <View style={styles.imagePreviewContainer}>
//             <Image
//               source={{ uri: imageUri }}
//               style={styles.imagePreview}
//               resizeMode="cover"
//             />
//             <TouchableOpacity
//               style={styles.changeImageButton}
//               onPress={pickImage}
//               disabled={loading}
//             >
//               {loading ? (
//                 <ActivityIndicator size="small" color="white" />
//               ) : (
//                 <>
//                   <Ionicons name="camera" size={18} color="white" />
//                   <Text style={styles.changeImageText}>Change</Text>
//                 </>
//               )}
//             </TouchableOpacity>
//           </View>
//         ) : (
//           <TouchableOpacity
//             style={styles.uploadButton}
//             onPress={pickImage}
//             disabled={loading}
//           >
//             {loading ? (
//               <ActivityIndicator size="large" color="#0077CC" />
//             ) : (
//               <>
//                 <Ionicons name="image-outline" size={36} color="#0077CC" />
//                 <Text style={styles.uploadText}>
//                   {controller.placeholder || "Upload Featured Image"}
//                 </Text>
//                 {controller.description && (
//                   <Text style={styles.uploadSubtext}>
//                     {controller.description}
//                   </Text>
//                 )}
//               </>
//             )}
//           </TouchableOpacity>
//         )}
//       </View>

//       {error && <Text style={styles.errorText}>{error}</Text>}

//       {form.formState.errors[controller?.name || ""] && (
//         <Text style={styles.errorText}>
//           {form.formState.errors[controller?.name || ""]?.message?.toString()}
//         </Text>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     width: "100%",
//     marginBottom: 16,
//   },
//   labelContainer: {
//     marginBottom: 8,
//   },
//   label: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#333",
//   },
//   required: {
//     color: "#FF3B30",
//   },
//   imageContainer: {
//     width: "100%",
//     height: 200,
//     borderRadius: 10,
//     overflow: "hidden",
//   },
//   uploadButton: {
//     width: "100%",
//     height: "100%",
//     backgroundColor: "#eef7ff",
//     borderWidth: 2,
//     borderColor: "#d0e6ff",
//     borderStyle: "dashed",
//     borderRadius: 10,
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 20,
//   },
//   uploadText: {
//     color: "#0077CC",
//     fontSize: 16,
//     fontWeight: "bold",
//     marginTop: 10,
//     textAlign: "center",
//   },
//   uploadSubtext: {
//     color: "#666",
//     fontSize: 12,
//     marginTop: 5,
//     textAlign: "center",
//   },
//   imagePreviewContainer: {
//     width: "100%",
//     height: "100%",
//     position: "relative",
//   },
//   imagePreview: {
//     width: "100%",
//     height: "100%",
//   },
//   changeImageButton: {
//     position: "absolute",
//     bottom: 10,
//     right: 10,
//     backgroundColor: "rgba(0,0,0,0.6)",
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 20,
//   },
//   changeImageText: {
//     color: "white",
//     fontSize: 12,
//     fontWeight: "600",
//     marginLeft: 5,
//   },
//   errorText: {
//     color: "#FF3B30",
//     fontSize: 12,
//     marginTop: 5,
//   },
// });

// export default FeaturedImageController;
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { FormControllerProps } from "../../types";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";

type PropsType = {
  field: {
    onChange: (value: any) => void;
    onBlur: () => void;
    value: any;
    name: string;
  };
  controller: FormControllerProps;
  form: UseFormReturn<z.TypeOf<any>, any, undefined>;
};

const FeaturedImageController = ({ controller, field, form }: PropsType) => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize with field value if it exists
  useEffect(() => {
    if (field.value) {
      if (typeof field.value === "string") {
        // Check if it's already a base64 or URL
        if (field.value.startsWith("data:") || field.value.startsWith("http")) {
          setBase64Image(field.value);
          setImageUri(field.value);
        } else {
          // It's a local URI, convert to base64
          convertToBase64(field.value);
        }
      } else if (
        typeof field.value === "object" &&
        field.value !== null &&
        field.value.uri
      ) {
        convertToBase64(field.value.uri);
      }
    }
  }, []);

  // Update form when base64 image changes
  useEffect(() => {
    if (base64Image) {
      field.onChange(base64Image);
      form.setValue(controller?.name || "", base64Image, {
        shouldValidate: true,
      });
    }
  }, [base64Image]);

  const convertToBase64 = async (uri: string) => {
    try {
      setLoading(true);
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Determine the MIME type based on file extension or default to jpeg
      const fileExtension = uri.split(".").pop()?.toLowerCase();
      let mimeType = "image/jpeg";

      if (fileExtension === "png") {
        mimeType = "image/png";
      } else if (fileExtension === "gif") {
        mimeType = "image/gif";
      } else if (fileExtension === "webp") {
        mimeType = "image/webp";
      }

      const dataUrl = `data:${mimeType};base64,${base64}`;
      setBase64Image(dataUrl);
      setImageUri(uri); // Keep original URI for display
    } catch (error) {
      console.error("Error converting to base64:", error);
      setError("Failed to process image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please grant camera roll permissions to upload images."
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    if (loading) return;

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setLoading(true);
    setError(null);

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: controller.allowsEditing ?? true,
        aspect: controller.aspect ? controller.aspect : [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];

        // Check file size if maxFileSize is specified
        if (controller.maxFileSize) {
          const fileInfo = await FileSystem.getInfoAsync(selectedImage.uri);
          if (fileInfo.exists && fileInfo.size > controller.maxFileSize) {
            const mbSize = (controller.maxFileSize / (1024 * 1024)).toFixed(1);
            setError(`Image is too large. Maximum file size is ${mbSize}MB.`);
            setLoading(false);
            return;
          }
        }

        // Convert the selected image to base64
        await convertToBase64(selectedImage.uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      setError("Failed to select image. Please try again.");
      setLoading(false);
    }
  };

  const removeImage = () => {
    setImageUri(null);
    setBase64Image(null);
    field.onChange(null);
    form.setValue(controller?.name || "", null, {
      shouldValidate: true,
    });
  };

  return (
    <View style={styles.container}>
      <View style={[styles.imageContainer, controller.style]}>
        {imageUri ? (
          <View style={styles.imagePreviewContainer}>
            <Image
              source={{ uri: imageUri }}
              style={styles.imagePreview}
              resizeMode="cover"
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.changeImageButton}
                onPress={pickImage}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Ionicons name="camera" size={18} color="white" />
                    <Text style={styles.changeImageText}>Change</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.changeImageButton, styles.removeButton]}
                onPress={removeImage}
                disabled={loading}
              >
                <Ionicons name="trash" size={18} color="white" />
                <Text style={styles.changeImageText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={pickImage}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="large" color="#0077CC" />
            ) : (
              <>
                <Ionicons name="image-outline" size={36} color="#0077CC" />
                <Text style={styles.uploadText}>
                  {controller.placeholder || "Upload Featured Image"}
                </Text>
                {controller.description && (
                  <Text style={styles.uploadSubtext}>
                    {controller.description}
                  </Text>
                )}
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {form.formState.errors[controller?.name || ""] && (
        <Text style={styles.errorText}>
          {form.formState.errors[controller?.name || ""]?.message?.toString()}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 16,
  },
  labelContainer: {
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  required: {
    color: "#FF3B30",
  },
  imageContainer: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    overflow: "hidden",
  },
  uploadButton: {
    width: "100%",
    height: "100%",
    backgroundColor: "#eef7ff",
    borderWidth: 2,
    borderColor: "#d0e6ff",
    borderStyle: "dashed",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  uploadText: {
    color: "#0077CC",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    textAlign: "center",
  },
  uploadSubtext: {
    color: "#666",
    fontSize: 12,
    marginTop: 5,
    textAlign: "center",
  },
  imagePreviewContainer: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 10,
    right: 10,
    flexDirection: "row",
    gap: 8,
  },
  changeImageButton: {
    backgroundColor: "rgba(0,0,0,0.6)",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  removeButton: {
    backgroundColor: "rgba(220,53,69,0.8)",
  },
  changeImageText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 5,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 12,
    marginTop: 5,
  },
});

export default FeaturedImageController;
