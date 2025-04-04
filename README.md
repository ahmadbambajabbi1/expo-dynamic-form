# expo-dynamic-form

A highly customizable dynamic form component for React Native and Expo applications. This package provides a flexible and powerful way to create dynamic forms with various input types, validation, and multi-step support.

## Features

- 🚀 Multiple controller types:

  - Text inputs (text, email, password, number)
  - Selection inputs (select, multi-select, searchable-select)
  - Date and time inputs (date, date-of-birth, datetime)
  - Location inputs (location, multi-location, current-location)
  - Special inputs (phone, tags, currency, rich text)
  - File and image inputs (file upload, image gallery, featured image)
  - Advanced inputs (list creator, sub-form)

- 📝 Form Capabilities:

  - Multi-step form support with dynamic navigation
  - Form validation using Zod schemas
  - Conditional field rendering
  - Dynamic field mapping
  - Nested form support
  - Integration with react-hook-form

- 🎨 Customization Options:
  - Fully typed with TypeScript
  - Customizable UI components

## Installation

```sh
# Using npm
npm install expo-dynamic-form

# Using yarn
yarn add expo-dynamic-form
```

### Required Peer Dependencies

```sh
npm install react-hook-form @hookform/resolvers zod date-fns
npm install @react-native-community/datetimepicker @react-native-async-storage/async-storage
npm install expo-document-picker expo-file-system expo-image-picker expo-location
npm install axios
```

## Basic Usage

### Simple Form with API Submission

```jsx
import React from "react";
import { View, StyleSheet } from "react-native";
import DynamicForm, { initConfig } from "expo-dynamic-form";
import { z } from "zod";

export default function App() {
  // Initialize global API configuration (optional)
  React.useEffect(() => {
    initConfig(
      {
        api: {
          baseURL: "https://your-api-base-url.com",
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 30000,
        },
      },
      async () => {
        // Optional: Custom session token retrieval
        return { accessToken: "your-access-token" };
      }
    );
  }, []);

  // Create a schema for form validation
  const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    age: z.number().min(18, "You must be at least 18 years old"),
  });

  // Define your form controllers
  const controllers = [
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
      placeholder: "Enter your email",
    },
    {
      name: "age",
      label: "Your Age",
      type: "number",
      placeholder: "Enter your age",
    },
  ];

  // API Submission Example
  const apiOptions = {
    api: "/users/create", // Relative API endpoint
    method: "POST",
    options: {
      // Optional axios config
      headers: {
        "X-Custom-Header": "value",
      },
    },
    extraData: {
      // Optional additional data to be sent with form submission
      source: "mobile-app",
    },
    errorHandler: (error, type) => {
      // Custom error handling
      if (type === "FORM_ERROR") {
        console.error("Form submission error:", error);
      }
    },
    onFinish: (data) => {
      // Callback after successful submission
      console.log("Submission completed:", data);
    },
  };

  return (
    <View style={styles.container}>
      <DynamicForm
        controllers={controllers}
        formSchema={formSchema}
        apiOptions={apiOptions}
        submitBtn={{ title: "Submit Form" }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
});
```

### Key API Submission Features

The `DynamicForm` component provides powerful API submission capabilities:

- **Automatic Error Handling**: Handles form-level and API-level errors
- **Flexible API Configuration**:
  - Specify API endpoint
  - Choose HTTP method
  - Add custom headers
  - Include extra data
- **Error Callback**: Custom error handling
- **Submission Callback**: Handle successful submissions
- **Global Configuration**: Set base URL, default headers via `initConfig()`

The component uses Axios under the hood, supporting:

- Automatic token attachment
- Timeout configuration
- Custom error handling
- Flexible API interaction

### Multi-step Form Example

```jsx
import React from "react";
import { View, StyleSheet } from "react-native";
import DynamicForm from "expo-dynamic-form";
import { z } from "zod";

export default function App() {
  // Create schemas for each step
  const personalInfoSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
  });

  const addressSchema = z.object({
    street: z.string().min(5, "Please enter a valid street address"),
    city: z.string().min(2, "City is required"),
    zipCode: z.string().min(5, "ZIP code is required"),
  });

  // Define steps for your form
  const steps = [
    {
      stepName: "Personal Information",
      stepSchema: personalInfoSchema,
      controllers: [
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
          placeholder: "Enter your email",
        },
      ],
    },
    {
      stepName: "Address",
      stepSchema: addressSchema,
      controllers: [
        {
          name: "street",
          label: "Street Address",
          type: "text",
          placeholder: "Enter street address",
        },
        {
          name: "city",
          label: "City",
          type: "text",
          placeholder: "Enter city",
        },
        {
          name: "zipCode",
          label: "ZIP Code",
          type: "text",
          placeholder: "Enter ZIP code",
        },
      ],
    },
  ];

  // Handle form submission
  const handleSubmit = async ({ values }) => {
    console.log("Form values:", values);
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
    backgroundColor: "#fff",
  },
});
```

## Controller Types

The package supports a wide range of controller types:

1. **Text Inputs**

   - `text`: Standard text input
   - `email`: Email input with validation
   - `password`: Secure text input
   - `number`: Numeric input
   - `textarea`: Multi-line text input

2. **Selection Inputs**

   - `select`: Dropdown select
   - `multi-select`: Multi-selection dropdown
   - `searchable-select`: Searchable dropdown
   - `group-checkbox`: Group of checkboxes

3. **Date and Time Inputs**

   - `date`: Date picker
   - `date-of-birth`: Specialized date of birth picker
   - `datetime`: Combined date and time picker

4. **Location Inputs**

   - `location`: Single location selection
   - `multi-location`: Multiple location selection
   - `current-location`: Current device location

5. **Special Inputs**

   - `phone`: Phone number input with country code
   - `tags-input`: Tagging input
   - `currency`: Currency selection
   - `rich-text`: Rich text editor

6. **File and Image Inputs**

   - `file-upload`: File upload with multiple type support
   - `image-gallery`: Multiple image upload
   - `featured-image`: Single image upload

7. **Advanced Inputs**
   - `sub-form`: Nested form support
   - `list-creator`: Dynamic list creation
   - `react-node`: Custom React component input

## API Reference

### DynamicForm Props

| Prop                  | Type                                                                     | Description                                         |
| --------------------- | ------------------------------------------------------------------------ | --------------------------------------------------- |
| `controllers`         | `FormControllerProps[]`                                                  | Array of form controllers for normal forms          |
| `steps`               | `StepsType<ZodSchema>[]`                                                 | Array of step configurations for multi-step forms   |
| `formSchema`          | `ZodSchema`                                                              | Zod schema for form validation                      |
| `formtype`            | `"normal" \| "steper"`                                                   | Type of form to render (default: "normal")          |
| `handleSubmit`        | `(params: DynamicFormHanldeSubmitParamType<ZodSchema>) => Promise<void>` | Function to handle form submission                  |
| `submitBtn`           | `{ title?: string }`                                                     | Configuration for submit button                     |
| `stepPreview`         | `(value: any) => ReactNode`                                              | Function to render step preview in multi-step forms |
| `hideStepsIndication` | `boolean`                                                                | Hide step indicators in multi-step forms            |
| `apiOptions`          | `apiOptionsType`                                                         | API configuration for form submission               |
| `tricker`             | `(props: any) => ReactNode`                                              | Custom trigger for form submission                  |
| `props`               | `PropsPropsType`                                                         | Custom props for form components                    |
| `modalComponent`      | `(data: ModalType, setModal: (modal: ModalType) => void) => ReactNode`   | Custom modal component                              |

## Configuration

### Global API Configuration

You can initialize global configuration for API calls using the `initConfig` method:

```typescript
import { initConfig } from "expo-dynamic-form";
import config from "./form.config.json";
import { getSession } from "./your-session-service";

// Optional: Pass a configuration object and a session retrieval function
initConfig(config, getSession);
```

#### Configuration Object Example

Create a `form.config.json` in your project root:

```json
{
  "api": {
    "baseURL": "https://your-api-base-url.com",
    "headers": {
      "Content-Type": "application/json"
    },
    "timeout": 30000
  }
}
```

#### Session Retrieval Function

The session retrieval function is optional and can be used to dynamically fetch access tokens:

```typescript
// Example session service
export const getSession = async () => {
  try {
    // Retrieve stored session data
    const storedSession = await AsyncStorage.getItem("user_session");

    if (storedSession) {
      const sessionData = JSON.parse(storedSession);
      return {
        accessToken: sessionData.accessToken,
      };
    }

    return { accessToken: undefined };
  } catch (error) {
    console.error("Failed to retrieve session", error);
    return { accessToken: undefined };
  }
};
```

### Advanced API Submission Options

```jsx
apiOptions={{
  api: "/auth/login",
  method: "POST",
  options: {
    // Optional Axios configuration
    headers: {
      'X-Custom-Header': 'value'
    },
    // Additional Axios request configuration
    withCredentials: true
  },
  extraData: {
    // Additional data to be sent with the request
    deviceInfo: 'mobile-app',
    timezone: 'UTC'
  },
  onVerify: (data) => {
    // Handle verification steps (e.g., two-factor authentication)
    if (data.requiresVerification) {
      // Trigger additional verification process
      navigateToVerificationScreen();
    }
  },
  onFinish: async (data) => {
    // Handle successful submission
    await saveUserSession(data);
    navigateToMainScreen();
  }
}}
```

#### Error Handling and Form Validation

The package provides a sophisticated error handling mechanism that seamlessly integrates backend validation with Zod schema validation.

##### Backend Error Response Format

Your backend can return errors in two primary formats:

1. **Single Error Object**:

```json
{
  "error": {
    "path": ["email"],
    "message": "Invalid Email Or Password"
  },
  "errorType": "FORM_ERROR"
}
```

2. **Multiple Errors Array**:

```json
{
  "errors": [
    {
      "path": ["email"],
      "message": "Invalid Email address"
    },
    {
      "path": ["password"],
      "message": "Password is too short"
    }
  ],
  "errorType": "FORM_ERROR"
}
```

##### How Error Handling Works

- **Automatic Error Mapping**: The form automatically maps backend errors to specific form fields
- **Supports Single and Multiple Errors**: Works with both single error objects and error arrays
- **Zod Schema Compatibility**: Error structure matches Zod's `safeParse` error format
- **Field-Specific Error Placement**: Errors are displayed next to corresponding form fields

Example Backend Error Handling:

```typescript
// Express.js example
app.post("/auth/login", (req, res) => {
  // Authentication logic
  if (!isValidUser) {
    return res.status(404).json({
      error: {
        path: ["email"],
        message: "Invalid Email Or Password",
      },
      errorType: "FORM_ERROR",
    });
  }

  // Multiple errors example
  if (validationFailed) {
    return res.status(400).json({
      errors: [
        {
          path: ["email"],
          message: "Email is required",
        },
        {
          path: ["password"],
          message: "Password must be at least 8 characters",
        },
      ],
      errorType: "FORM_ERROR",
    });
  }
});
```

##### Verification Flow

The package supports advanced verification scenarios, such as two-factor authentication or email verification:

```json
{
  "succesType": "VERIFIED",
  "data": {
    "user": { ... },
    "requiresAdditionalAction": true
  }
}
```

Example API Options for Verification:

```jsx
apiOptions={{
  api: "/auth/login",
  method: "POST",
  onVerify: (data) => {
    // Handle verification steps
    if (data.requiresVerification) {
      // Trigger additional verification process
      navigateToVerificationScreen();
    }
  },
  onFinish: async (data) => {
    // Handle final successful authentication
    if (data.succesType === "VERIFIED") {
      await saveUserSession(data.data);
      navigateToMainScreen();
    }
  }
}}
```

##### Verification Flow Characteristics

- **Flexible Verification Handling**:
  - Detect when additional verification is needed
  - Support for multi-step authentication processes
- **Success Types**:
  - `VERIFIED`: Indicates complete authentication
  - Allows for conditional navigation based on verification status
- **Rich Metadata**:
  - Carry additional user or verification-related data
  - Support complex authentication scenarios

Backend Example:

```typescript
app.post("/auth/login", (req, res) => {
  // Authentication logic
  if (needsTwoFactorVerification) {
    return res.status(200).json({
      succesType: "VERIFIED",
      data: {
        user: partialUserData,
        requiresVerification: true,
        verificationMethod: "otp",
      },
    });
  }

  // Complete authentication
  if (authenticationSuccessful) {
    return res.status(200).json({
      succesType: "VERIFIED",
      data: {
        user: fullUserData,
        accessToken: generatedToken,
      },
    });
  }
});
```

### Key Configuration Features

- **Flexible Configuration**:
  - Global API settings via JSON config
  - Optional session token retrieval
  - Dynamic headers and timeout
- **Seamless Token Management**:
  - Automatically attach access tokens
  - Support for custom session retrieval
- **Error Handling**:
  - Built-in error management
  - Custom error callback support
- **Submission Callbacks**:
  - `onFinish` for successful submissions
  - `errorHandler` for custom error processing

The configuration is designed to be:

- Optional
- Easily customizable
- Adaptable to different project structures

## Contributing

Contributions are welcome! Please see the [contributing guide](CONTRIBUTING.md) for details on how to get started.

## License

MIT License
