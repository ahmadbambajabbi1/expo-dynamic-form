import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { FormControllerProps } from "../../types";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";

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

// Match the LocationType from LocationController
type LocationType = {
  id: string;
  name: string;
  address: string;
  country: string;
  lat: number;
  lng: number;
  placeId: string;
};

const CurrentLocationController = ({ controller, field, form }: PropsType) => {
  const [loading, setLoading] = useState(true); // Start with loading state
  const [locationData, setLocationData] = useState<LocationType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Function to validate location data structure
  const isValidLocationData = (data: any): boolean => {
    if (!data) return false;
    if (typeof data !== "object") return false;

    return (
      data.id &&
      data.name &&
      typeof data.lat === "number" &&
      typeof data.lng === "number" &&
      data.placeId
    );
  };

  // Auto fetch location on component mount
  useEffect(() => {
    // Check if there's a controller.defaultValue first
    if (controller.defaultValue) {
      try {
        let defaultVal = controller.defaultValue;

        // Parse if it's a string
        if (typeof defaultVal === "string") {
          defaultVal = JSON.parse(defaultVal);
        }

        // Validate the data before using it
        if (isValidLocationData(defaultVal)) {
          setLocationData(defaultVal);
          field.onChange(defaultVal);
          form.setValue(controller?.name || "", defaultVal, {
            shouldValidate: true,
          });
          setLoading(false);
          return; // Exit early since we've set the default value
        } else {
          console.error("Invalid location format in controller.defaultValue");
          // Continue to next option if validation fails
        }
      } catch (error) {
        console.error("Error parsing controller default value:", error);
        // Continue to next option if parsing fails
      }
    }

    // Initialize with pre-selected value if exists
    if (field.value) {
      try {
        if (typeof field.value === "object" && field.value !== null) {
          // It's already an object, validate it
          if (isValidLocationData(field.value)) {
            setLocationData(field.value as LocationType);
            setLoading(false);
            return;
          }
        } else if (typeof field.value === "string" && field.value !== "") {
          // It's a string (for backward compatibility)
          const parsedLocation = JSON.parse(field.value);

          // Validate the parsed location
          if (isValidLocationData(parsedLocation)) {
            setLocationData(parsedLocation);
            // Update form with object instead of string
            field.onChange(parsedLocation);
            form.setValue(controller?.name || "", parsedLocation, {
              shouldValidate: true,
            });
            setLoading(false);
            return;
          }
        }
        // If we reach here, the value was invalid
        console.error("Invalid location format in field.value");
        field.onChange(null);
        // Continue with location fetch if validation fails
      } catch (error) {
        console.error("Error parsing location value:", error);
        field.onChange(null);
        // Continue with location fetch if parsing fails
      }
    }

    // No valid existing value, fetch location automatically
    autoFetchLocation();
  }, []);

  const autoFetchLocation = async () => {
    try {
      // Check if permission is already granted
      const { status } = await Location.getForegroundPermissionsAsync();

      if (status === "granted") {
        // Permission already granted, get location
        await getCurrentLocation();
      } else {
        // Need to request permission
        const { status: newStatus } =
          await Location.requestForegroundPermissionsAsync();

        if (newStatus === "granted") {
          await getCurrentLocation();
        } else {
          setPermissionDenied(true);
          setError("Location permission was denied. Tap to try again.");
          setLoading(false);
        }
      }
    } catch (error) {
      console.error("Error in auto fetch location:", error);
      setError("Failed to get your location automatically. Tap to try again.");
      setLoading(false);
    }
  };

  const requestLocationPermission = async () => {
    setLoading(true);
    setError(null);
    setPermissionDenied(false);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setPermissionDenied(true);
        setError("Location permission was denied");
        setLoading(false);
        return;
      }

      await getCurrentLocation();
    } catch (error) {
      console.error("Error requesting location permission:", error);
      setError("Failed to request location permission");
      setLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      // Get current position
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = position.coords;

      // Reverse geocode to get address
      const [geocodeResult] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (!geocodeResult) {
        throw new Error("Could not retrieve location information");
      }

      // Extract city and country
      const city =
        geocodeResult.city ||
        geocodeResult.subregion ||
        geocodeResult.region ||
        "";
      const country = geocodeResult.country || "";
      const postalCode = geocodeResult.postalCode || "";

      // Format address in a user-friendly way
      const addressComponents = [
        geocodeResult.street,
        geocodeResult.district,
        city,
        geocodeResult.region,
        country,
      ].filter(Boolean);

      const address = addressComponents.join(", ");

      // Generate a stable ID and placeId based on the coordinates
      // This is deterministic and not random
      const coordinateString = `${latitude.toFixed(6)},${longitude.toFixed(6)}`;
      const id = `loc_coord_${coordinateString.replace(/[,.]/g, "_")}`;
      const placeId = `expo_location_${coordinateString.replace(/[,.]/g, "_")}`;

      // Create the name for display purposes
      const name = city || "Current Location";

      // Set the location data for the UI display
      setLocationData({
        id,
        name,
        address,
        country,
        lat: latitude,
        lng: longitude,
        placeId,
      });

      // Create location data object in the required format for the form
      const formLocationData: any = {
        coordinates: [longitude, latitude], // [lng, lat] order
        address,
        city,
        country,
        placeId,
      };

      // Add optional postalCode if available
      if (postalCode) {
        formLocationData.postalCode = postalCode;
      }

      // Return the object in the format required by the schema
      field.onChange(formLocationData);
      form.setValue(controller?.name || "", formLocationData, {
        shouldValidate: true,
      });
    } catch (error) {
      console.error("Error getting current location:", error);

      // Don't set any default value, just show error
      setError("Failed to get your current location. Please try again.");

      // Keep field empty on failure
      field.onChange(null);
      form.setValue(controller?.name || "", null, {
        shouldValidate: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const clearLocation = () => {
    setLocationData(null);
    field.onChange(null);
    form.setValue(controller?.name || "", null, {
      shouldValidate: true,
    });
  };

  return (
    <View style={styles.container}>
      {!locationData ? (
        <TouchableOpacity
          style={[styles.locationButton, controller.style]}
          onPress={requestLocationPermission}
          disabled={loading && !permissionDenied}
        >
          {loading ? (
            <>
              <ActivityIndicator size="small" color="#0077CC" />
              <Text style={[styles.locationButtonText, styles.loadingText]}>
                Getting your location...
              </Text>
            </>
          ) : (
            <>
              <Ionicons name="location" size={20} color="#0077CC" />
              <Text style={styles.locationButtonText}>
                {permissionDenied
                  ? "Enable Location Access"
                  : controller.placeholder || "Get Current Location"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.locationDataContainer}>
          <View style={styles.locationDetails}>
            <View style={styles.locationHeader}>
              <Ionicons name="location" size={20} color="#0077CC" />
              <Text style={styles.locationTitle}>{locationData.name}</Text>
            </View>

            <Text style={styles.locationAddress} numberOfLines={2}>
              {locationData.address}
            </Text>

            <Text style={styles.locationCountry}>{locationData.country}</Text>
          </View>

          <TouchableOpacity style={styles.clearButton} onPress={clearLocation}>
            <Ionicons name="close-circle" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#0077CC",
    borderRadius: 5,
    padding: 12,
    backgroundColor: "#EBF5FF",
    height: 46,
  },
  locationButtonText: {
    fontSize: 16,
    color: "#0077CC",
    marginLeft: 8,
    fontWeight: "500",
  },
  loadingText: {
    color: "#0077CC",
  },
  locationDataContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "#fff",
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  locationDetails: {
    flex: 1,
  },
  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 6,
    color: "#0077CC",
  },
  locationAddress: {
    fontSize: 14,
    color: "#333",
    marginTop: 2,
  },
  locationCountry: {
    fontSize: 14,
    color: "#0077CC",
    marginTop: 4,
    fontWeight: "500",
  },
  clearButton: {
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default CurrentLocationController;
