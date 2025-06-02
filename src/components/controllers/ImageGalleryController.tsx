import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
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

type ImageType = {
  uri: string;
  base64?: string; // Added for base64 data
  name?: string;
  type?: string;
  size?: number;
};

const ImageGalleryController = ({ controller, field, form }: PropsType) => {
  const [images, setImages] = useState<ImageType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Maximum number of images (default to 5 or use the controller's maximum)
  const maxImages = controller.maximun || 5;

  // Convert local URI to base64
  const convertToBase64 = async (uri: string): Promise<string> => {
    try {
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

      return `data:${mimeType};base64,${base64}`;
    } catch (error) {
      console.error("Error converting to base64:", error);
      throw error;
    }
  };

  // Process images to include base64 data
  const processImagesWithBase64 = async (
    imageList: ImageType[]
  ): Promise<ImageType[]> => {
    const processedImages = await Promise.all(
      imageList.map(async (img) => {
        // If image already has base64 or is a URL, keep it as is
        if (
          img.base64 ||
          img.uri.startsWith("data:") ||
          img.uri.startsWith("http")
        ) {
          return img;
        }

        // Convert local URI to base64
        try {
          const base64Data = await convertToBase64(img.uri);
          return {
            ...img,
            base64: base64Data,
          };
        } catch (error) {
          console.error("Failed to convert image to base64:", error);
          return img; // Return original if conversion fails
        }
      })
    );

    return processedImages;
  };

  // Initialize from existing value
  useEffect(() => {
    if (field.value) {
      try {
        if (Array.isArray(field.value)) {
          // Convert any string URIs to ImageType objects
          const processedImages = field.value.map((img) =>
            typeof img === "string" ? { uri: img } : img
          );
          setImages(processedImages);
        } else if (typeof field.value === "string") {
          try {
            // Try parsing as JSON
            const parsedImages = JSON.parse(field.value);
            if (Array.isArray(parsedImages)) {
              setImages(parsedImages);
              // Update form with array instead of string
              field.onChange(parsedImages);
              form.setValue(controller?.name || "", parsedImages, {
                shouldValidate: true,
              });
            } else {
              // Single image as string
              setImages([{ uri: field.value }]);
              field.onChange([{ uri: field.value }]);
              form.setValue(controller?.name || "", [{ uri: field.value }], {
                shouldValidate: true,
              });
            }
          } catch (e) {
            // Not valid JSON, assume it's a single image URL
            setImages([{ uri: field.value }]);
            field.onChange([{ uri: field.value }]);
            form.setValue(controller?.name || "", [{ uri: field.value }], {
              shouldValidate: true,
            });
          }
        }
      } catch (error) {
        console.error("Error initializing images:", error);
        setImages([]);
      }
    }
  }, []);

  // Update the form when images change
  useEffect(() => {
    const updateForm = async () => {
      if (images.length === 0) {
        field.onChange([]);
        form.setValue(controller?.name || "", [], {
          shouldValidate: true,
        });
        return;
      }

      // Process images to include base64 data
      const processedImages = await processImagesWithBase64(images);

      if (controller.returnFullImageObject) {
        // Return full image objects with metadata including base64
        field.onChange(processedImages);
        form.setValue(controller?.name || "", processedImages, {
          shouldValidate: true,
        });
      } else {
        // Return base64 data URLs for backend upload (default behavior)
        const imageData = processedImages.map((img) => img.base64 || img.uri);
        field.onChange(imageData);
        form.setValue(controller?.name || "", imageData, {
          shouldValidate: true,
        });
      }
    };

    updateForm();
  }, [images]);

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

    // Check if maximum number of images is reached
    if (images.length >= maxImages) {
      Alert.alert("Maximum Images", `You can add up to ${maxImages} images.`);
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setLoading(true);
    setError(null);

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: controller.allowsEditing ?? false,
        aspect: controller.aspect ? controller.aspect : undefined,
        quality: 0.8,
        allowsMultipleSelection:
          controller.allowsMultipleSelection && images.length + 1 < maxImages,
      });

      if (!result.canceled) {
        // Process selected images
        const newImages = await Promise.all(
          result.assets.map(async (asset) => {
            // Get file info for size
            const fileInfo = await FileSystem.getInfoAsync(asset.uri);

            // Validate file size if maxFileSize is specified
            if (
              controller.maxFileSize &&
              fileInfo.exists &&
              fileInfo.size > controller.maxFileSize
            ) {
              const mbSize = (controller.maxFileSize / (1024 * 1024)).toFixed(
                1
              );
              setError(`Image is too large. Maximum file size is ${mbSize}MB.`);
              return null;
            }

            // Create image object with metadata (base64 will be added when form updates)
            return {
              uri: asset.uri,
              name: asset.fileName || `image-${Date.now()}.jpg`,
              type: "image/jpeg", // Default MIME type
              size: fileInfo.exists ? fileInfo.size : undefined,
            };
          })
        );

        // Filter out null values (failed validations)
        const validImages = newImages.filter(
          (img) => img !== null
        ) as ImageType[];

        // Limit to maximum number of images
        const combinedImages = [...images, ...validImages].slice(0, maxImages);
        setImages(combinedImages);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      setError("Failed to select image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index: number) => {
    Alert.alert("Remove Image", "Are you sure you want to remove this image?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Remove",
        onPress: () => {
          const newImages = [...images];
          newImages.splice(index, 1);
          setImages(newImages);
        },
        style: "destructive",
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.imagesGrid}>
        {images.map((img, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image source={{ uri: img.uri }} style={styles.image} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeImage(index)}
            >
              <Ionicons name="close-circle" size={24} color="white" />
            </TouchableOpacity>
          </View>
        ))}

        {images.length < maxImages && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={pickImage}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#0077CC" />
            ) : (
              <>
                <Ionicons name="add" size={32} color="#0077CC" />
                <Text style={styles.addButtonText}>
                  {images.length === 0 ? "Add Images" : "Add More"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Text style={styles.counter}>
        {images.length} / {maxImages} images
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 16,
  },
  headerContainer: {
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  imagesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -5, // Compensate for image container margin
  },
  imageContainer: {
    width: 100,
    height: 100,
    margin: 5,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#f0f0f0",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  removeButton: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  addButton: {
    width: 100,
    height: 100,
    margin: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
  },
  addButtonText: {
    color: "#0077CC",
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 12,
    marginTop: 8,
  },
  counter: {
    fontSize: 12,
    color: "#666",
    marginTop: 8,
    textAlign: "right",
  },
});

export default ImageGalleryController;
