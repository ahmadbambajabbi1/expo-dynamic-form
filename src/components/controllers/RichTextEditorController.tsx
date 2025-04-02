import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Text,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FormControllerProps } from "../../types";

type PropsType = {
  field: {
    onChange: (value: any) => void;
    onBlur: () => void;
    value: any;
    name: string;
  };
  controller: FormControllerProps;
};

type FormatType =
  | "bold"
  | "italic"
  | "underline"
  | "h1"
  | "h2"
  | "h3"
  | "link"
  | "bullet"
  | "numbered"
  | "quote";

const RichTextEditorController = ({ controller, field }: PropsType) => {
  const [text, setText] = useState(field.value || "");
  const [htmlContent, setHtmlContent] = useState(field.value || "");
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [activeFormats, setActiveFormats] = useState<FormatType[]>([]);

  // Modal state for link insertion
  const [linkModalVisible, setLinkModalVisible] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");

  const inputRef = useRef<TextInput>(null);

  // Synchronize the HTML content with the form field
  useEffect(() => {
    field.onChange(htmlContent);
  }, [htmlContent]);

  // Update active formats based on cursor position
  const updateActiveFormats = (start: number, end: number) => {
    // This is a simplified implementation
    // In a real-world app, you'd parse the HTML around the cursor
    const formats: FormatType[] = [];

    const surroundingText = text.substring(
      Math.max(0, start - 10),
      Math.min(text.length, end + 10)
    );

    if (surroundingText.includes("<b>")) formats.push("bold");
    if (surroundingText.includes("<i>")) formats.push("italic");
    if (surroundingText.includes("<u>")) formats.push("underline");
    if (surroundingText.includes("<h1>")) formats.push("h1");
    if (surroundingText.includes("<h2>")) formats.push("h2");
    if (surroundingText.includes("<h3>")) formats.push("h3");
    if (surroundingText.includes("<blockquote>")) formats.push("quote");
    if (surroundingText.includes("<a href=")) formats.push("link");

    setActiveFormats(formats);
  };

  // Apply formatting
  const applyFormat = (format: FormatType) => {
    if (
      selection.start === selection.end &&
      format !== "bullet" &&
      format !== "numbered"
    ) {
      // Just enable the format for next typing if no text is selected
      setActiveFormats((prev) =>
        prev.includes(format)
          ? prev.filter((f) => f !== format)
          : [...prev, format]
      );
      return;
    }

    const selectedText = text.substring(selection.start, selection.end);
    let formattedText = "";
    let newCursorPosition = selection.end;

    switch (format) {
      case "bold":
        formattedText = `<b>${selectedText}</b>`;
        newCursorPosition += 7; // accounting for the added tags
        break;
      case "italic":
        formattedText = `<i>${selectedText}</i>`;
        newCursorPosition += 7;
        break;
      case "underline":
        formattedText = `<u>${selectedText}</u>`;
        newCursorPosition += 7;
        break;
      case "h1":
        formattedText = `<h1>${selectedText}</h1>`;
        newCursorPosition += 9;
        break;
      case "h2":
        formattedText = `<h2>${selectedText}</h2>`;
        newCursorPosition += 9;
        break;
      case "h3":
        formattedText = `<h3>${selectedText}</h3>`;
        newCursorPosition += 9;
        break;
      case "quote":
        formattedText = `<blockquote>${selectedText}</blockquote>`;
        newCursorPosition += 25;
        break;
      case "bullet":
        const bulletLines = selectedText
          .split("\n")
          .map((line) => `• ${line}`)
          .join("\n");
        formattedText = bulletLines;
        newCursorPosition = selection.start + formattedText.length;
        break;
      case "numbered":
        const numberedLines = selectedText
          .split("\n")
          .map((line, index) => `${index + 1}. ${line}`)
          .join("\n");
        formattedText = numberedLines;
        newCursorPosition = selection.start + formattedText.length;
        break;
      default:
        formattedText = selectedText;
    }

    // Insert formatted text
    const newText =
      text.substring(0, selection.start) +
      formattedText +
      text.substring(selection.end);

    setText(newText);
    setHtmlContent(newText);

    // Focus back on the editor and set selection
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        // Select just after the inserted formatted text
        inputRef.current.setNativeProps({
          selection: { start: newCursorPosition, end: newCursorPosition },
        });
      }
    }, 10);
  };

  // Handle text selection
  const handleSelectionChange = (event: any) => {
    const { start, end } = event.nativeEvent.selection;
    setSelection({ start, end });
    updateActiveFormats(start, end);
  };

  // Handle text changes
  const handleChangeText = (newText: string) => {
    setText(newText);
    setHtmlContent(newText);
  };

  // Add a link
  const handleAddLink = () => {
    // Set the link text to the selected text if any
    if (selection.start !== selection.end) {
      setLinkText(text.substring(selection.start, selection.end));
    }
    setLinkModalVisible(true);
  };

  // Insert link into the editor
  const insertLink = () => {
    if (!linkUrl) {
      Alert.alert("Error", "Please enter a URL for the link");
      return;
    }

    const linkHtml = `<a href="${linkUrl}">${linkText || linkUrl}</a>`;

    const newText =
      text.substring(0, selection.start) +
      linkHtml +
      text.substring(selection.end);

    setText(newText);
    setHtmlContent(newText);
    setLinkModalVisible(false);
    setLinkUrl("");
    setLinkText("");
  };

  return (
    <View style={styles.container}>
      {/* Formatting Toolbar */}
      <View style={styles.toolbar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {/* Text formatting */}
          <TouchableOpacity
            style={[
              styles.toolbarButton,
              activeFormats.includes("bold") && styles.activeButton,
            ]}
            onPress={() => applyFormat("bold")}
          >
            <Ionicons
              name="text"
              size={20}
              color={activeFormats.includes("bold") ? "#0077CC" : "#444"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toolbarButton,
              activeFormats.includes("italic") && styles.activeButton,
            ]}
            onPress={() => applyFormat("italic")}
          >
            <Ionicons
              name="text-outline"
              size={20}
              color={activeFormats.includes("italic") ? "#0077CC" : "#444"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toolbarButton,
              activeFormats.includes("underline") && styles.activeButton,
            ]}
            onPress={() => applyFormat("underline")}
          >
            <Ionicons
              name="text"
              size={20}
              color={activeFormats.includes("underline") ? "#0077CC" : "#444"}
            />
          </TouchableOpacity>

          <View style={styles.separator} />

          {/* Headings */}
          <TouchableOpacity
            style={[
              styles.toolbarButton,
              activeFormats.includes("h1") && styles.activeButton,
            ]}
            onPress={() => applyFormat("h1")}
          >
            <Text
              style={[
                styles.headingButton,
                activeFormats.includes("h1") && styles.activeHeading,
              ]}
            >
              H1
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toolbarButton,
              activeFormats.includes("h2") && styles.activeButton,
            ]}
            onPress={() => applyFormat("h2")}
          >
            <Text
              style={[
                styles.headingButton,
                activeFormats.includes("h2") && styles.activeHeading,
              ]}
            >
              H2
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toolbarButton,
              activeFormats.includes("h3") && styles.activeButton,
            ]}
            onPress={() => applyFormat("h3")}
          >
            <Text
              style={[
                styles.headingButton,
                activeFormats.includes("h3") && styles.activeHeading,
              ]}
            >
              H3
            </Text>
          </TouchableOpacity>

          <View style={styles.separator} />

          {/* Lists */}
          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={() => applyFormat("bullet")}
          >
            <Ionicons name="list" size={20} color="#444" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={() => applyFormat("numbered")}
          >
            <Ionicons name="list-outline" size={20} color="#444" />
          </TouchableOpacity>

          <View style={styles.separator} />

          {/* Blockquote */}
          <TouchableOpacity
            style={[
              styles.toolbarButton,
              activeFormats.includes("quote") && styles.activeButton,
            ]}
            onPress={() => applyFormat("quote")}
          >
            <Ionicons
              name="chatbubble-ellipses"
              size={20}
              color={activeFormats.includes("quote") ? "#0077CC" : "#444"}
            />
          </TouchableOpacity>

          {/* Link */}
          <TouchableOpacity
            style={[
              styles.toolbarButton,
              activeFormats.includes("link") && styles.activeButton,
            ]}
            onPress={handleAddLink}
          >
            <Ionicons
              name="link"
              size={20}
              color={activeFormats.includes("link") ? "#0077CC" : "#444"}
            />
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Editor */}
      <ScrollView style={styles.editorScrollView}>
        <TextInput
          ref={inputRef}
          style={[
            styles.editor,
            { minHeight: (controller.rows || 6) * 20 },
            controller.style,
          ]}
          placeholder={controller.placeholder}
          value={text}
          onChangeText={handleChangeText}
          onBlur={field.onBlur}
          multiline
          textAlignVertical="top"
          numberOfLines={controller.rows || 6}
          onSelectionChange={handleSelectionChange}
          maxLength={controller.maximun}
        />
      </ScrollView>

      {/* Link Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={linkModalVisible}
        onRequestClose={() => setLinkModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Insert Link</Text>

            <Text style={styles.inputLabel}>Link Text</Text>
            <TextInput
              style={styles.modalInput}
              value={linkText}
              onChangeText={setLinkText}
              placeholder="Text to display"
            />

            <Text style={styles.inputLabel}>URL</Text>
            <TextInput
              style={styles.modalInput}
              value={linkUrl}
              onChangeText={setLinkUrl}
              placeholder="https://example.com"
              autoCapitalize="none"
              keyboardType="url"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setLinkModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.insertButton]}
                onPress={insertLink}
              >
                <Text style={styles.insertButtonText}>Insert</Text>
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
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  toolbar: {
    padding: 8,
    backgroundColor: "#f5f5f5",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  toolbarButton: {
    padding: 8,
    marginHorizontal: 2,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  activeButton: {
    backgroundColor: "#e6f2ff",
  },
  headingButton: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#444",
  },
  activeHeading: {
    color: "#0077CC",
  },
  separator: {
    width: 1,
    height: 24,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 6,
  },
  editorScrollView: {
    maxHeight: 300,
  },
  editor: {
    padding: 10,
    width: "100%",
    fontSize: 16,
    textAlignVertical: "top",
    minHeight: 120,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    width: "80%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 5,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    minWidth: 100,
    alignItems: "center",
  },
  insertButton: {
    backgroundColor: "#0077CC",
  },
  cancelButtonText: {
    color: "#0077CC",
  },
  insertButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default RichTextEditorController;
