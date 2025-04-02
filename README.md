# expo-dynamic-form

A highly customizable dynamic form component for React Native and Expo applications. This package provides a flexible and powerful way to create dynamic forms with various input types, validation, and multi-step support.

## Features

- Multiple controller types: text, email, number, select, multi-select, checkboxes, date pickers, location, and more
- Multi-step form support with navigation
- Form validation using Zod schemas
- Customizable UI components
- File upload support
- Sub-form support for nested data
- Integration with react-hook-form
- Fully typed with TypeScript

## Installation

```sh
npm install expo-dynamic-form

# or using yarn
yarn add expo-dynamic-form
```

### Dependencies

This package requires several peer dependencies:

```sh
# Required peer dependencies
npm install react-hook-form @hookform/resolvers zod date-fns
npm install @react-native-community/datetimepicker @react-native-async-storage/async-storage
npm install expo-document-picker expo-file-system expo-image-picker expo-location
npm install axios

# If using Expo
expo install react-hook-form @hookform/resolvers zod
expo install @react-native-community/datetimepicker @react-native-async-storage/async-storage
expo install expo-document-picker expo-file-system expo-image-picker expo-location
expo install axios
```

## Usage

Here's a basic example of how to use the `DynamicForm` component:

```jsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import DynamicForm from 'expo-dynamic-form';
import { z } from 'zod';

// Create a schema for form validation
const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  age: z.number().min(18, 'You must be at least 18 years old'),
});

export default function App() {
  // Define your form controllers
  const controllers = [
    {
      name: 'name',
      label: 'Full Name',
      type: 'text',
      placeholder: 'Enter your full name',
    },
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      placeholder: 'Enter your email',
    },
    {
      name: 'age',
      label: 'Your Age',
      type: 'number',
      placeholder: 'Enter your age',
    },
  ];

  // Handle form submission
  const handleSubmit = async ({ values }) => {
    console.log('Form values:', values);
    // Process form data here
  };

  return (
    <View style={styles.container}>
      <DynamicForm
        controllers={controllers}
        formSchema={formSchema}
        handleSubmit={handleSubmit}
        submitBtn={{ title: 'Submit Form' }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
});
```

## Multi-step Form Example

```jsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import DynamicForm from 'expo-dynamic-form';
import { z } from 'zod';

// Create schemas for each step
const personalInfoSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
});

const addressSchema = z.object({
  street: z.string().min(5, 'Please enter a valid street address'),
  city: z.string().min(2, 'City is required'),
  zipCode: z.string().min(5, 'ZIP code is required'),
});

export default function App() {
  // Define steps for your form
  const steps = [
    {
      stepName: 'Personal Information',
      stepSchema: personalInfoSchema,
      controllers: [
        {
          name: 'name',
          label: 'Full Name',
          type: 'text',
          placeholder: 'Enter your full name',
        },
        {
          name: 'email',
          label: 'Email Address',
          type: 'email',
          placeholder: 'Enter your email',
        },
      ],
    },
    {
      stepName: 'Address',
      stepSchema: addressSchema,
      controllers: [
        {
          name: 'street',
          label: 'Street Address',
          type: 'text',
          placeholder: 'Enter street address',
        },
        {
          name: 'city',
          label: 'City',
          type: 'text',
          placeholder: 'Enter city',
        },
        {
          name: 'zipCode',
          label: 'ZIP Code',
          type: 'text',
          placeholder: 'Enter ZIP code',
        },
      ],
    },
  ];

  // Handle form submission
  const handleSubmit = async ({ values }) => {
    console.log('Form values:', values);
    // Process form data here
  };

  return (
    <View style={styles.container}>
      <DynamicForm
        steps={steps}
        formtype="steper"
        handleSubmit={handleSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
});
```

## API

### DynamicForm Props

| Prop | Type | Description |
| ---- | ---- | ----------- |
| `controllers` | `FormControllerProps[]` | Array of form controllers for normal forms |
| `steps` | `StepsType<ZodSchema>[]` | Array of step configurations for multi-step forms |
| `formSchema` | `ZodSchema` | Zod schema for form validation |
| `formtype` | `"normal" \| "steper"` | Type of form to render (default: "normal") |
| `handleSubmit` | `(params: DynamicFormHanldeSubmitParamType<ZodSchema>) => Promise<void>` | Function to handle form submission |
| `submitBtn` | `{ title?: string }` | Configuration for submit button |
| `stepPreview` | `(value: any) => ReactNode` | Function to render step preview in multi-step forms |
| `hideStepsIndication` | `boolean` | Hide step indicators in multi-step forms |
| `apiOptions` | `apiOptionsType` | API configuration for form submission |
| `tricker` | `(props: any) => ReactNode` | Custom trigger for form submission |
| `props` | `PropsPropsType` | Custom props for form components |
| `modalComponent` | `(data: ModalType, setModal: (modal: ModalType) => void) => ReactNode` | Custom modal component |

### Controller Types

The package supports many controller types including:

- `text` - Text input
- `email` - Email input
- `number` - Number input
- `password` - Password input
- `select` - Dropdown select
- `multi-select` - Multi-selection dropdown
- `searchable-select` - Searchable dropdown
- `textarea` - Multi-line text input
- `checkbox` - Single checkbox
- `group-checkbox` - Group of checkboxes
- `date` - Date picker
- `date-of-birth` - Date of birth picker
- `location` - Location selector
- `multi-location` - Multiple location selector
- `current-location` - Current location selector
- `phone` - Phone number input
- `tags-input` - Tags input
- `sub-form` - Nested form
- `file-upload` - File upload
- `currency` - Currency input
- `list-creator` - Dynamic list creator
- `image-gallery` - Image gallery
- `featured-image` - Featured image upload

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT