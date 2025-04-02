import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { FormControllerProps } from "../../types";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
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

type FileInfo = {
  uri: string;
  name: string;
  type: string;
  size: number;
  mimeType?: string;
  preview?: string;
};

const FileUploadController = ({ controller, field, form }: PropsType) => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get controller configuration
  const multiple = controller.multiple || false;
  const acceptedFiles = controller.acceptedFiles || ["*/*"]; // Default to accept all files
  const maxFileSize = controller.maxFileSize || 10 * 1024 * 1024; // Default 10MB max size

  // Initialize from existing value
  useEffect(() => {
    if (field.value) {
      try {
        if (Array.isArray(field.value)) {
          setFiles(field.value);
        } else if (typeof field.value === "string") {
          try {
            // Try parsing as JSON
            const parsedFiles = JSON.parse(field.value);
            if (Array.isArray(parsedFiles)) {
              setFiles(parsedFiles);
              // Update form with array instead of string
              field.onChange(parsedFiles);
            } else {
              // Single file as object
              setFiles([parsedFiles]);
              // Update form with array
              field.onChange([parsedFiles]);
            }
          } catch (error) {
            // If it's not valid JSON, it might be a single file URL
            setFiles([
              {
                uri: field.value,
                name: getFileNameFromUrl(field.value),
                type: getFileTypeFromUrl(field.value),
                size: 0,
              },
            ]);
          }
        } else if (typeof field.value === "object" && field.value !== null) {
          // Single file as object
          setFiles([field.value as FileInfo]);
        }
      } catch (error) {
        console.error("Error initializing files:", error);
        setFiles([]);
      }
    }
  }, []);

  // Update the main form when files change
  useEffect(() => {
    if (multiple) {
      field.onChange(files);
      form.setValue(controller?.name || "", files, {
        shouldValidate: true,
      });
    } else {
      // For single file upload, store just the first file
      const singleFile = files.length > 0 ? files[0] : null;
      field.onChange(singleFile);
      form.setValue(controller?.name || "", singleFile, {
        shouldValidate: true,
      });
    }
  }, [files]);

  const getFileNameFromUrl = (url: string): string => {
    try {
      const pathParts = url.split("/");
      return pathParts[pathParts.length - 1];
    } catch (error) {
      return "file";
    }
  };

  const getFileTypeFromUrl = (url: string): string => {
    try {
      const extension = url.split(".").pop()?.toLowerCase() || "";
      switch (extension) {
        case "jpg":
        case "jpeg":
          return "image/jpeg";
        case "png":
          return "image/png";
        case "pdf":
          return "application/pdf";
        case "doc":
        case "docx":
          return "application/msword";
        default:
          return "application/octet-stream";
      }
    } catch (error) {
      return "application/octet-stream";
    }
  };

  const isImage = (fileType: string): boolean => {
    return fileType.startsWith("image/");
  };

  const isPdf = (fileType: string): boolean => {
    return fileType === "application/pdf";
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const validateFile = (file: FileInfo): string | null => {
    // Check file size
    if (file.size > maxFileSize) {
      return `File is too large. Maximum size is ${formatFileSize(
        maxFileSize
      )}`;
    }

    // Check file type if acceptedFiles is specified
    if (
      acceptedFiles &&
      acceptedFiles.length > 0 &&
      acceptedFiles[0] !== "*/*"
    ) {
      let fileExtension = file.name.split(".").pop()?.toLowerCase() || "";
      let mimeType = file.type || "";

      // If no extension, try to get it from mimeType
      if (!fileExtension && mimeType) {
        const mimeExtensionMap = {
          "image/jpeg": "jpg",
          "image/png": "png",
          "application/pdf": "pdf",
          "application/msword": "doc",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            "docx",
        };
        fileExtension =
          mimeExtensionMap[mimeType as keyof typeof mimeExtensionMap] || "";
      }

      // Check if file type is accepted
      const isAccepted = acceptedFiles.some((type) => {
        // Handle mime types
        if (type.includes("/")) {
          return (
            mimeType === type ||
            (type.endsWith("/*") && mimeType.startsWith(type.split("/*")[0]))
          );
        }
        // Handle extensions (without dot)
        return fileExtension === type.replace(".", "");
      });

      if (!isAccepted) {
        return `File type not accepted. Accepted types: ${acceptedFiles.join(
          ", "
        )}`;
      }
    }

    return null;
  };

  const handleDocumentPick = async () => {
    try {
      setLoading(true);
      setError(null);

      // Request permissions if needed (for Android)
      if (Platform.OS === "android") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          setError("Permission to access media is required!");
          setLoading(false);
          return;
        }
      }

      const result = await DocumentPicker.getDocumentAsync({
        type: acceptedFiles.includes("*/*")
          ? "*/*"
          : acceptedFiles.map((type) => {
              // Convert extensions to mime types if needed
              if (type.startsWith(".")) {
                const ext = type.substring(1).toLowerCase();
                switch (ext) {
                  case "jpg":
                  case "jpeg":
                    return "image/jpeg";
                  case "png":
                    return "image/png";
                  case "pdf":
                    return "application/pdf";
                  case "doc":
                  case "docx":
                    return "application/msword";
                  default:
                    return `application/${ext}`;
                }
              }
              return type;
            }),
        multiple,
      });

      if (result.canceled) {
        setLoading(false);
        return;
      }

      let newFiles: FileInfo[] = result.assets.map((asset) => ({
        uri: asset.uri,
        name: asset.name || "Unknown File",
        type: asset.mimeType || getFileTypeFromUrl(asset.uri),
        size: asset.size || 0,
        mimeType: asset.mimeType,
      }));

      // Validate each file
      const invalidFiles: { file: FileInfo; reason: string }[] = [];
      newFiles = newFiles.filter((file) => {
        const validationError = validateFile(file);
        if (validationError) {
          invalidFiles.push({ file, reason: validationError });
          return false;
        }
        return true;
      });

      if (invalidFiles.length > 0) {
        // Show an alert for invalid files
        Alert.alert(
          "Invalid Files",
          `${invalidFiles.length} file(s) were not added:\n${invalidFiles
            .map((invalid) => `${invalid.file.name}: ${invalid.reason}`)
            .join("\n")}`,
          [{ text: "OK" }]
        );
      }

      // Update files state
      if (multiple) {
        setFiles((prevFiles) => [...prevFiles, ...newFiles]);
      } else {
        // For single file upload, replace existing file
        setFiles(newFiles.slice(0, 1));
      }
    } catch (error) {
      console.error("Error picking document:", error);
      setError("Failed to select file. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleImagePick = async () => {
    try {
      setLoading(true);
      setError(null);

      // Request permissions
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        setError("Permission to access media is required!");
        setLoading(false);
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        allowsMultipleSelection: multiple,
        quality: 0.8,
      });

      if (result.canceled) {
        setLoading(false);
        return;
      }

      let newFiles: FileInfo[] = await Promise.all(
        result.assets.map(async (asset) => {
          // Get file info
          const fileInfo = await FileSystem.getInfoAsync(asset.uri);

          // Convert asset to FileInfo structure
          return {
            uri: asset.uri,
            name:
              asset.fileName ||
              `image-${Date.now()}.${asset.uri.split(".").pop()}`,
            type: `image/${asset.uri.split(".").pop()}`,
            size: fileInfo.exists ? fileInfo.size : 0,
            preview: asset.uri,
          };
        })
      );

      // Validate each file
      const invalidFiles: { file: FileInfo; reason: string }[] = [];
      newFiles = newFiles.filter((file) => {
        const validationError = validateFile(file);
        if (validationError) {
          invalidFiles.push({ file, reason: validationError });
          return false;
        }
        return true;
      });

      if (invalidFiles.length > 0) {
        Alert.alert(
          "Invalid Files",
          `${invalidFiles.length} file(s) were not added:\n${invalidFiles
            .map((invalid) => `${invalid.file.name}: ${invalid.reason}`)
            .join("\n")}`,
          [{ text: "OK" }]
        );
      }

      // Update files state
      if (multiple) {
        setFiles((prevFiles) => [...prevFiles, ...newFiles]);
      } else {
        setFiles(newFiles.slice(0, 1));
      }
    } catch (error) {
      console.error("Error picking image:", error);
      setError("Failed to select image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prevFiles) => {
      const newFiles = [...prevFiles];
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const renderFilePreview = (file: FileInfo, index: number) => {
    return (
      <View key={`${file.uri}-${index}`} style={styles.filePreview}>
        {isImage(file.type) ? (
          <Image source={{ uri: file.uri }} style={styles.imagePreview} />
        ) : isPdf(file.type) ? (
          <View style={styles.pdfPreview}>
            <Ionicons name="document-text" size={32} color="#FF5733" />
          </View>
        ) : (
          <View style={styles.generalFilePreview}>
            <Ionicons name="document" size={32} color="#0077CC" />
          </View>
        )}

        <View style={styles.fileInfo}>
          <Text style={styles.fileName} numberOfLines={1}>
            {file.name}
          </Text>
          <Text style={styles.fileSize}>{formatFileSize(file.size)}</Text>
        </View>

        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeFile(index)}
        >
          <Ionicons name="close-circle" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    );
  };

  // Create a user-friendly display of accepted file types
  const getAcceptedFilesDisplay = (): string => {
    if (
      !acceptedFiles ||
      acceptedFiles.length === 0 ||
      acceptedFiles[0] === "*/*"
    ) {
      return "All files";
    }

    return acceptedFiles
      .map((type) => {
        // Convert mime types to user-friendly names
        if (type.includes("/")) {
          if (type === "image/*") return "Images";
          if (type === "application/pdf") return "PDF";
          if (type === "application/msword") return "DOC";
          if (
            type ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          )
            return "DOCX";
          return type.split("/")[1].toUpperCase();
        }
        // Handle extensions
        return type.replace(".", "").toUpperCase();
      })
      .join(", ");
  };

  return (
    <View style={styles.container}>
      {/* Files Preview Section */}
      {files.length > 0 && (
        <ScrollView
          horizontal={files.length <= 3}
          style={[
            styles.filesContainer,
            files.length > 3 && styles.filesGridContainer,
          ]}
          contentContainerStyle={files.length > 3 ? styles.filesGrid : null}
        >
          {files.map((file, index) => renderFilePreview(file, index))}
        </ScrollView>
      )}

      {/* Upload Button Section */}
      <View style={styles.uploadButtonContainer}>
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={handleDocumentPick}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="document-attach" size={20} color="#FFFFFF" />
              <Text style={styles.uploadButtonText}>
                {multiple
                  ? files.length > 0
                    ? "Add More Files"
                    : "Select Files"
                  : files.length > 0
                  ? "Change File"
                  : "Select File"}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Only show image picker button if images are accepted */}
        {(acceptedFiles.includes("*/*") ||
          acceptedFiles.includes("image/*") ||
          acceptedFiles.some(
            (type) =>
              type.startsWith("image/") ||
              type === "jpg" ||
              type === "jpeg" ||
              type === "png"
          )) && (
          <TouchableOpacity
            style={styles.imagePickerButton}
            onPress={handleImagePick}
            disabled={loading}
          >
            <Ionicons name="image" size={20} color="#FFFFFF" />
            <Text style={styles.uploadButtonText}>
              {multiple ? "Add Images" : "Select Image"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Help Text */}
      <Text style={styles.helpText}>
        {controller.description ||
          `Accepted: ${getAcceptedFilesDisplay()}. Max size: ${formatFileSize(
            maxFileSize
          )}`}
      </Text>

      {/* Error Display */}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  filesContainer: {
    marginBottom: 10,
    maxHeight: 120,
  },
  filesGridContainer: {
    height: 200,
  },
  filesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  filePreview: {
    width: 100,
    height: 100,
    margin: 5,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f9f9f9",
    position: "relative",
  },
  imagePreview: {
    width: "100%",
    height: 70,
    resizeMode: "cover",
    backgroundColor: "#f0f0f0",
  },
  pdfPreview: {
    width: "100%",
    height: 70,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF4F2",
  },
  generalFilePreview: {
    width: "100%",
    height: 70,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F7FF",
  },
  fileInfo: {
    padding: 5,
    height: 30,
    justifyContent: "center",
  },
  fileName: {
    fontSize: 10,
    fontWeight: "500",
    color: "#333",
  },
  fileSize: {
    fontSize: 8,
    color: "#666",
  },
  removeButton: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 12,
  },
  uploadButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0077CC",
    borderRadius: 5,
    padding: 12,
    flex: 1,
    marginRight: 5,
  },
  imagePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#34C759",
    borderRadius: 5,
    padding: 12,
    flex: 1,
    marginLeft: 5,
  },
  uploadButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  helpText: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
    marginLeft: 4,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 12,
    marginTop: 5,
    marginLeft: 4,
  },
});

export default FileUploadController;
