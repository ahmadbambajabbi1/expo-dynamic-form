# Expo Dynamic Form

A comprehensive, high-performance dynamic form library for React Native and Expo applications. Built with TypeScript, React Hook Form, and Zod for a complete form handling solution.

## Features

- 📱 Built specifically for React Native and Expo
- 🔄 20+ input controllers for every form need
- 📑 Support for multi-step forms
- 🔍 Form validation using Zod schemas
- ⚡ Optimized performance with debounced inputs
- 📚 TypeScript support
- 🧪 Fully testable components

## Installation

```bash
npm install expo-dynamic-form

# Or using yarn
yarn add expo-dynamic-form
```

### Peer Dependencies

This package has the following peer dependencies:

```bash
npm install react-hook-form zod @hookform/resolvers
```

Also, depending on which form controllers you use, you may need to install:

```bash
# For location-based controllers
expo install expo-location

# For image and file controllers
expo install expo-image-picker expo-document-picker expo-file-system

# For date pickers
expo install @react-native-community/datetimepicker
```

## Basic Usage

```tsx
import React from "react";
import { View, Text } from "react-native";
import { z } from "zod";
import { DynamicForm } from "expo-dynamic-form";

// Define form schema
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  age: z.number().min(18, "Must be at least 18 years old").or(z.null()),
});

// Define form controllers
const formControllers = [
  {
    name: "name",
    label: "Full Name",
    type: "text",
    placeholder: "Enter your full name",
  },
  {
    name: "email",
    label: "Email Address",
    type: "email",
    placeholder: "Enter your email address",
  },
  {
    name: "age",
    label: "Age",
    type: "number",
    placeholder: "Enter your age",
  },
];

const MyForm = () => {
  const handleSubmit = async ({ values, reset }) => {
    console.log("Form submitted:", values);
    // Submit to API, etc.
    reset();
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 24, marginBottom: 16 }}>User Registration</Text>
      <DynamicForm
        controllers={formControllers}
        formSchema={formSchema}
        handleSubmit={handleSubmit}
        submitBtn={{ title: "Register" }}
      />
    </View>
  );
};

export default MyForm;
```

## Multi-Step Forms

```tsx
import React from "react";
import { View, Text } from "react-native";
import { z } from "zod";
import { DynamicForm } from "expo-dynamic-form";

// Define schemas for each step
const personalInfoSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
});

const contactInfoSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(10),
});

// Combined schema
const formSchema = personalInfoSchema.merge(contactInfoSchema);

// Define form steps
const formSteps = [
  {
    stepName: "Personal Information",
    stepSchema: personalInfoSchema,
    controllers: [
      {
        name: "firstName",
        label: "First Name",
        type: "text",
      },
      {
        name: "lastName",
        label: "Last Name",
        type: "text",
      },
    ],
  },
  {
    stepName: "Contact Information",
    stepSchema: contactInfoSchema,
    controllers: [
      {
        name: "email",
        label: "Email",
        type: "email",
      },
      {
        name: "phone",
        label: "Phone",
        type: "phone",
      },
    ],
  },
];

const StepForm = () => {
  const handleSubmit = async ({ values }) => {
    console.log("Multi-step form submitted:", values);
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 24, marginBottom: 16 }}>Registration Form</Text>
      <DynamicForm
        steps={formSteps}
        formSchema={formSchema}
        formtype="steper"
        handleSubmit={handleSubmit}
      />
    </View>
  );
};

export default StepForm;
```

## Available Form Controllers

| Type                | Description                           |
| ------------------- | ------------------------------------- |
| `text`              | Standard text input                   |
| `email`             | Email input with email keyboard       |
| `number`            | Numeric input (performance optimized) |
| `password`          | Password input with visibility toggle |
| `textarea`          | Multi-line text input                 |
| `checkbox`          | Single checkbox for boolean values    |
| `group-checkbox`    | Group of checkboxes                   |
| `select`            | Dropdown selector                     |
| `multi-select`      | Multi-option selector                 |
| `searchable-select` | Searchable dropdown                   |
| `date`              | Date picker                           |
| `date-of-birth`     | Specialized date picker for DOB       |
| `phone`             | Phone number input with country code  |
| `location`          | Location selector with map            |
| `multi-location`    | Multiple location selector            |
| `current-location`  | Current location picker               |
| `file-upload`       | File upload handler                   |
| `currency`          | Currency input with selector          |
| `tags-input`        | Tags input field                      |
| `list-creator`      | Dynamic list creator                  |
| `image-gallery`     | Image gallery selector                |
| `featured-image`    | Single featured image picker          |
| `sub-form`          | Nested form                           |
| `react-node`        | Custom React component                |

## Testing

This package includes comprehensive testing setup. To run tests:

```bash
npm test
```

## License

MIT
