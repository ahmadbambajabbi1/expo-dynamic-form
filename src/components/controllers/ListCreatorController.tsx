import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { FormControllerProps } from "../../types";
import { Ionicons } from "@expo/vector-icons";

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

const ListCreatorController = ({ controller, field, form }: PropsType) => {
  const [items, setItems] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Initialize from existing value
  useEffect(() => {
    if (field.value) {
      try {
        if (Array.isArray(field.value)) {
          setItems(field.value);
        } else if (typeof field.value === "string") {
          // In case it's stored as a JSON string
          try {
            const parsed = JSON.parse(field.value);
            if (Array.isArray(parsed)) {
              setItems(parsed);
              // Update form with array instead of string
              field.onChange(parsed);
              form.setValue(controller?.name || "", parsed, {
                shouldValidate: true,
              });
            }
          } catch (e) {
            // If it's not valid JSON, assume it's a comma-separated string
            const values = field.value
              .split(",")
              .filter((v: string) => v.trim() !== "");
            setItems(values);
            field.onChange(values);
            form.setValue(controller?.name || "", values, {
              shouldValidate: true,
            });
          }
        }
      } catch (error) {
        console.error("Error initializing list items:", error);
        setItems([]);
      }
    }
  }, []);

  // Update form when items change
  useEffect(() => {
    field.onChange(items);
    form.setValue(controller?.name || "", items, {
      shouldValidate: true,
    });
  }, [items]);

  const addItem = () => {
    const trimmedValue = inputValue.trim();

    if (trimmedValue === "") {
      setError("Item cannot be empty");
      return;
    }

    // Check if item already exists (case-insensitive)
    if (
      items.some((item) => item.toLowerCase() === trimmedValue.toLowerCase())
    ) {
      setError("This item already exists");
      return;
    }

    // Check for maximum items (optional)
    const maxItems = controller.maximun || Infinity;
    if (items.length >= maxItems) {
      setError(`Maximum ${maxItems} items allowed`);
      return;
    }

    setItems([...items, trimmedValue]);
    setInputValue("");
    setError(null);
  };

  const removeItem = (index: number) => {
    Alert.alert("Remove Item", "Are you sure you want to remove this item?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Remove",
        onPress: () => {
          const newItems = [...items];
          newItems.splice(index, 1);
          setItems(newItems);
        },
        style: "destructive",
      },
    ]);
  };

  const handleKeyPress = ({
    nativeEvent,
  }: {
    nativeEvent: { key: string };
  }) => {
    if (nativeEvent.key === "Enter" || nativeEvent.key === "Return") {
      addItem();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputValue}
          onChangeText={setInputValue}
          placeholder={controller.placeholder || "Add new item..."}
          onKeyPress={handleKeyPress}
          onSubmitEditing={addItem}
          returnKeyType="done"
        />
        <TouchableOpacity style={styles.addButton} onPress={addItem}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {controller.description && (
        <Text style={styles.description}>{controller.description}</Text>
      )}

      {items.length > 0 ? (
        <View style={styles.itemsContainer}>
          <FlatList
            data={items}
            keyExtractor={(item, index) => `${item}-${index}`}
            renderItem={({ item, index }) => (
              <View style={styles.itemRow}>
                <View style={styles.itemBullet}>
                  <Text style={styles.bulletText}>•</Text>
                </View>
                <Text style={styles.itemText}>{item}</Text>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeItem(index)}
                >
                  <Ionicons name="close-circle" size={22} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            )}
            scrollEnabled={false}
          />
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {controller.emptyMessage || "No items added yet"}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  input: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    marginRight: 8,
    fontSize: 16,
  },
  addButton: {
    height: 46,
    width: 46,
    backgroundColor: "#0077CC",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 12,
    marginBottom: 8,
  },
  description: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  emptyContainer: {
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#eee",
    borderStyle: "dashed",
    alignItems: "center",
  },
  emptyText: {
    color: "#999",
    fontSize: 14,
  },
  itemsContainer: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 5,
    backgroundColor: "#f9f9f9",
    padding: 8,
    marginTop: 8,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: "#fff",
    borderRadius: 5,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  itemBullet: {
    marginRight: 8,
  },
  bulletText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0077CC",
  },
  itemText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  removeButton: {
    padding: 4,
  },
});

export default ListCreatorController;
