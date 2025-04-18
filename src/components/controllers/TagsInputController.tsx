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
import { useTheme } from "../../context/ThemeContext";

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
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<TagType[]>([]);
  const [selectedTags, setSelectedTags] = useState<TagType[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  useEffect(() => {
    if (field.value) {
      try {
        if (Array.isArray(field.value)) {
          if (typeof field.value[0] === "string") {
            const tagObjects = field.value.map((name, index) => ({
              id: `temp-${index}`,
              name,
            }));
            setSelectedTags(tagObjects);
          } else {
            setSelectedTags(field.value);
            const tagNames = field.value.map((tag) => tag.name);
            field.onChange(tagNames);
            form.setValue(controller?.name || "", tagNames, {
              shouldValidate: true,
            });
          }
        } else if (typeof field.value === "string") {
          try {
            const parsedTags = JSON.parse(field.value);
            if (Array.isArray(parsedTags)) {
              if (typeof parsedTags[0] === "string") {
                const tagObjects = parsedTags.map((name, index) => ({
                  id: `temp-${index}`,
                  name,
                }));
                setSelectedTags(tagObjects);
                field.onChange(parsedTags);
              } else {
                setSelectedTags(parsedTags);
                const tagNames = parsedTags.map((tag) => tag.name);
                field.onChange(tagNames);
                form.setValue(controller?.name || "", tagNames, {
                  shouldValidate: true,
                });
              }
            }
          } catch (error) {
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
      const response = await Axios.get("/tags/search", {
        params: { q: query },
      });

      if (response.data && Array.isArray(response.data.data)) {
        setSearchResults(response.data.data);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (text: string) => {
    setSearch(text);

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
    if (!selectedTags.some((t) => t.id === tag.id)) {
      const updatedTags = [...selectedTags, tag];
      setSelectedTags(updatedTags);
      const tagNames = updatedTags.map((t) => t.name);
      field.onChange(tagNames);
      form.setValue(controller?.name || "", tagNames, {
        shouldValidate: true,
      });
    }
  };

  const createNewTag = () => {
    if (!search.trim()) return;
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
    const tagNames = updatedTags.map((tag) => tag.name);
    field.onChange(tagNames);
    form.setValue(controller?.name || "", tagNames, {
      shouldValidate: true,
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.tagsButton,
          {
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.background,
          },
          controller.style,
        ]}
        onPress={() => setModalVisible(true)}
      >
        <Text
          style={[
            styles.tagsButtonText,
            { color: theme.colors.text },
            selectedTags.length === 0 && { color: theme.colors.textSecondary },
          ]}
        >
          {selectedTags.length > 0
            ? `${selectedTags.length} tag(s) selected`
            : controller.placeholder || "Select or add tags"}
        </Text>
        <Ionicons
          name="pricetags"
          size={20}
          color={theme.colors.textSecondary}
        />
      </TouchableOpacity>

      {selectedTags.length > 0 && (
        <View style={styles.tagsContainer}>
          {selectedTags.map((tag) => (
            <View
              key={tag.id}
              style={[
                styles.tag,
                { backgroundColor: `${theme.colors.primary}15` },
              ]}
            >
              <Text style={[styles.tagText, { color: theme.colors.primary }]}>
                {tag.name}
              </Text>
              <TouchableOpacity
                style={styles.tagRemove}
                onPress={() => removeTag(tag.id)}
              >
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={theme.colors.textSecondary}
                />
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
                {controller.label || "Search or Add Tags"}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.searchContainer,
                {
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surface,
                },
              ]}
            >
              <Ionicons
                name="search"
                size={20}
                color={theme.colors.textSecondary}
                style={styles.searchIcon}
              />
              <TextInput
                style={[styles.searchInput, { color: theme.colors.text }]}
                value={search}
                onChangeText={handleSearchChange}
                placeholder="Search for tags..."
                placeholderTextColor={theme.colors.textSecondary}
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
                    color={theme.colors.primary}
                  />
                  <Text
                    style={[
                      styles.addButtonText,
                      { color: theme.colors.primary },
                    ]}
                  >
                    Add new
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text
                  style={[
                    styles.loadingText,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Searching tags...
                </Text>
              </View>
            ) : searchResults.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text
                  style={[
                    styles.emptyText,
                    { color: theme.colors.textSecondary },
                  ]}
                >
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
                        { borderBottomColor: theme.colors.border },
                        isSelected && {
                          backgroundColor: `${theme.colors.primary}10`,
                        },
                      ]}
                      onPress={() => addTag(item)}
                    >
                      <Text
                        style={[
                          styles.tagItemText,
                          { color: theme.colors.text },
                          isSelected && {
                            fontWeight: "bold",
                            color: theme.colors.primary,
                          },
                        ]}
                      >
                        {item.name}
                      </Text>

                      {isSelected ? (
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color={theme.colors.primary}
                        />
                      ) : (
                        <Ionicons
                          name="add-circle-outline"
                          size={20}
                          color={theme.colors.textSecondary}
                        />
                      )}
                    </TouchableOpacity>
                  );
                }}
              />
            )}

            <View
              style={[
                styles.modalFooter,
                { borderTopColor: theme.colors.border },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.doneButton,
                  { backgroundColor: theme.colors.primary },
                ]}
                onPress={() => setModalVisible(false)}
              >
                <Text
                  style={[
                    styles.doneButtonText,
                    { color: theme.colors.contrast || "#fff" },
                  ]}
                >
                  Done
                </Text>
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
    borderRadius: 5,
    padding: 10,
    height: 46,
  },
  tagsButtonText: {
    fontSize: 16,
    flex: 1,
  },
  placeholderText: {},
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
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
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 5,
    margin: 10,
    paddingHorizontal: 10,
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
    marginLeft: 4,
  },
  loadingContainer: {
    padding: 30,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  emptyContainer: {
    padding: 30,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
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
  },
  tagItemText: {
    fontSize: 16,
  },
  selectedTagItem: {},
  selectedTagItemText: {},
  modalFooter: {
    padding: 15,
    borderTopWidth: 1,
    alignItems: "center",
  },
  doneButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default TagsInputController;
