import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { FormControllerProps } from "../../types";
import { Ionicons } from "@expo/vector-icons";
import Axios from "../../utils/axiosConfig";

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

type TagType = {
  id: string;
  name: string;
};

const TagsInputController = ({ controller, field, form }: PropsType) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<TagType[]>([]);
  const [selectedTags, setSelectedTags] = useState<TagType[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  // Initialize with any existing value
  useEffect(() => {
    if (field.value) {
      try {
        if (Array.isArray(field.value)) {
          // If it's already an array of strings, convert to TagType for internal use
          if (typeof field.value[0] === "string") {
            const tagObjects = field.value.map((name, index) => ({
              id: `temp-${index}`,
              name,
            }));
            setSelectedTags(tagObjects);
            // No need to update form since it's already in correct format
          } else {
            // It's an array of TagType objects, so set internal state
            setSelectedTags(field.value);
            // Update form with just the names
            const tagNames = field.value.map((tag) => tag.name);
            field.onChange(tagNames);
            form.setValue(controller?.name || "", tagNames, {
              shouldValidate: true,
            });
          }
        } else if (typeof field.value === "string") {
          // Handle case where it might be a JSON string
          try {
            const parsedTags = JSON.parse(field.value);
            if (Array.isArray(parsedTags)) {
              // If it's an array of strings
              if (typeof parsedTags[0] === "string") {
                const tagObjects = parsedTags.map((name, index) => ({
                  id: `temp-${index}`,
                  name,
                }));
                setSelectedTags(tagObjects);
                field.onChange(parsedTags);
              } else {
                // If it's an array of objects
                setSelectedTags(parsedTags);
                // Return just the names
                const tagNames = parsedTags.map((tag) => tag.name);
                field.onChange(tagNames);
                form.setValue(controller?.name || "", tagNames, {
                  shouldValidate: true,
                });
              }
            }
          } catch (error) {
            // Not a JSON string, maybe comma-separated?
            const tagNames = field.value.split(",").filter(Boolean);
            const tagObjects = tagNames.map((name, index) => ({
              id: `temp-${index}`,
              name: name.trim(),
            }));
            setSelectedTags(tagObjects);
            field.onChange(tagNames);
            form.setValue(controller?.name || "", tagNames, {
              shouldValidate: true,
            });
          }
        }
      } catch (error) {
        console.error("Error initializing tags:", error);
      }
    }
  }, []);

  const searchTags = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Call the API endpoint
      const response = await Axios.get("/tags/search", {
        params: { q: query },
      });

      if (response.data && Array.isArray(response.data.data)) {
        setSearchResults(response.data.data);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      // console.error("Error searching tags:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (text: string) => {
    setSearch(text);

    // Debounce search requests
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (text.length >= 2) {
      const timeout = setTimeout(() => {
        searchTags(text);
      }, 500);

      setSearchTimeout(timeout as any);
    } else {
      setSearchResults([]);
    }
  };

  const addTag = (tag: TagType) => {
    // Check if tag is already selected
    if (!selectedTags.some((t) => t.id === tag.id)) {
      const updatedTags = [...selectedTags, tag];
      setSelectedTags(updatedTags);

      // Extract just the tag names for the form
      const tagNames = updatedTags.map((t) => t.name);

      // Update form with array of strings
      field.onChange(tagNames);
      form.setValue(controller?.name || "", tagNames, {
        shouldValidate: true,
      });
    }
  };

  const createNewTag = () => {
    if (!search.trim()) return;

    // Create a new tag with a temporary ID
    const newTag = {
      id: `new-${Date.now()}`,
      name: search.trim(),
    };

    addTag(newTag);
    setSearch("");
  };

  const removeTag = (tagId: string) => {
    const updatedTags = selectedTags.filter((tag) => tag.id !== tagId);
    setSelectedTags(updatedTags);

    // Extract just the tag names for the form
    const tagNames = updatedTags.map((tag) => tag.name);

    // Update form with array of strings
    field.onChange(tagNames);
    form.setValue(controller?.name || "", tagNames, {
      shouldValidate: true,
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.tagsButton, controller.style]}
        onPress={() => setModalVisible(true)}
      >
        <Text
          style={[
            styles.tagsButtonText,
            selectedTags.length === 0 && styles.placeholderText,
          ]}
        >
          {selectedTags.length > 0
            ? `${selectedTags.length} tag(s) selected`
            : controller.placeholder || "Select or add tags"}
        </Text>
        <Ionicons name="pricetags" size={20} color="#666" />
      </TouchableOpacity>

      {selectedTags.length > 0 && (
        <View style={styles.tagsContainer}>
          {selectedTags.map((tag) => (
            <View key={tag.id} style={styles.tag}>
              <Text style={styles.tagText}>{tag.name}</Text>
              <TouchableOpacity
                style={styles.tagRemove}
                onPress={() => removeTag(tag.id)}
              >
                <Ionicons name="close-circle" size={18} color="#666" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

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
                {controller.label || "Search or Add Tags"}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Ionicons
                name="search"
                size={20}
                color="#666"
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                value={search}
                onChangeText={handleSearchChange}
                placeholder="Search for tags..."
                autoCapitalize="none"
                clearButtonMode="while-editing"
              />
              {search.trim() !== "" && (
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={createNewTag}
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={22}
                    color="#0077CC"
                  />
                  <Text style={styles.addButtonText}>Add new</Text>
                </TouchableOpacity>
              )}
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0077CC" />
                <Text style={styles.loadingText}>Searching tags...</Text>
              </View>
            ) : searchResults.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {search.trim() === ""
                    ? "Type to search for tags"
                    : "No tags found. You can add a new tag."}
                </Text>
              </View>
            ) : (
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.id}
                style={styles.tagsList}
                renderItem={({ item }) => {
                  const isSelected = selectedTags.some(
                    (tag) => tag.id === item.id
                  );

                  return (
                    <TouchableOpacity
                      style={[
                        styles.tagItem,
                        isSelected && styles.selectedTagItem,
                      ]}
                      onPress={() => addTag(item)}
                    >
                      <Text
                        style={[
                          styles.tagItemText,
                          isSelected && styles.selectedTagItemText,
                        ]}
                      >
                        {item.name}
                      </Text>

                      {isSelected ? (
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color="#0077CC"
                        />
                      ) : (
                        <Ionicons
                          name="add-circle-outline"
                          size={20}
                          color="#666"
                        />
                      )}
                    </TouchableOpacity>
                  );
                }}
              />
            )}

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.doneButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.doneButtonText}>Done</Text>
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
  tagsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    backgroundColor: "#fff",
    height: 46,
  },
  tagsButtonText: {
    fontSize: 16,
    color: "#000",
    flex: 1,
  },
  placeholderText: {
    color: "#999",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e1f5fe",
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: "#0077CC",
    marginRight: 4,
  },
  tagRemove: {
    justifyContent: "center",
    alignItems: "center",
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
    maxHeight: "80%",
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    margin: 10,
    paddingHorizontal: 10,
    backgroundColor: "#f9f9f9",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  addButtonText: {
    color: "#0077CC",
    marginLeft: 4,
  },
  loadingContainer: {
    padding: 30,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    padding: 30,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  tagsList: {
    maxHeight: 300,
  },
  tagItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  tagItemText: {
    fontSize: 16,
  },
  selectedTagItem: {
    backgroundColor: "#f0f7ff",
  },
  selectedTagItemText: {
    fontWeight: "bold",
    color: "#0077CC",
  },
  modalFooter: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    alignItems: "center",
  },
  doneButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#0077CC",
    borderRadius: 5,
  },
  doneButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default TagsInputController;
