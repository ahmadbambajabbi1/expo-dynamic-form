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

// Internal location type for displaying in the UI
type LocationType = {
  id: string;
  name: string;
  address: string;
  country: string;
  lat: number;
  lng: number;
  placeId: string;
};

// Type that directly matches what the schema expects
type SchemaLocationData = {
  coordinates: [number, number]; // [longitude, latitude]
  address: string;
  city: string;
  country: string;
  placeId: string;
  postalCode?: string;
};

const LocationController = ({ controller, field, form }: PropsType) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState<LocationType[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationType | null>(
    null
  );
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  // For multi-select mode
  const [selectedLocations, setSelectedLocations] = useState<LocationType[]>(
    []
  );
  const isMultiSelect = controller.type === "multi-location";

  // Convert LocationType to schema-compatible format
  const convertToSchemaFormat = (
    location: LocationType
  ): SchemaLocationData => {
    // Extract city from the address (assuming format like "Name, City, Region, Country")
    const addressParts = location.address.split(", ");
    const city = addressParts.length > 1 ? addressParts[1] : location.name;

    return {
      coordinates: [location.lng, location.lat], // [longitude, latitude] order
      address: location.address,
      city: city,
      country: location.country,
      placeId: location.placeId,
    };
  };

  // // Function to get user's current location
  // const getUserCurrentLocation = () => {
  //   return new Promise<{ lat: number; lng: number }>((resolve, reject) => {
  //     if (!navigator.geolocation) {
  //       console.log("Geolocation is not supported by this browser");
  //       reject(new Error("Geolocation not supported"));
  //       return;
  //     }

  //     navigator.geolocation.getCurrentPosition(
  //       (position) => {
  //         const userLocation = {
  //           lat: position.coords.latitude,
  //           lng: position.coords.longitude,
  //         };
  //         resolve(userLocation);
  //       },
  //       (error) => {
  //         console.error("Error getting user location:", error);
  //         reject(error);
  //       },
  //       { timeout: 10000, enableHighAccuracy: true }
  //     );
  //   });
  // };

  // // Function to reverse geocode coordinates to get location details
  // const reverseGeocode = async (
  //   lat: number,
  //   lng: number
  // ): Promise<LocationType | null> => {
  //   try {
  //     const response = await fetch(
  //       `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
  //     );

  //     if (!response.ok) {
  //       throw new Error(
  //         `Reverse geocoding failed with status ${response.status}`
  //       );
  //     }

  //     const data = await response.json();

  //     // Only return data if we have valid information from the API
  //     if (!data || !data.place_id) {
  //       console.error("Invalid response from geocoding API");
  //       return null;
  //     }

  //     // Extract data from response
  //     const name =
  //       data.name || data.address?.road || data.address?.suburb || null;

  //     // If we don't have a proper name, don't continue
  //     if (!name) {
  //       console.error("No valid name found in geocoding response");
  //       return null;
  //     }

  //     return {
  //       id: `loc_${data.place_id}`,
  //       name: name,
  //       address: data.display_name || "",
  //       country: data.address?.country || "",
  //       lat: lat,
  //       lng: lng,
  //       placeId: data.place_id.toString(),
  //     };
  //   } catch (error) {
  //     console.error("Reverse geocoding error:", error);
  //     return null;
  //   }
  // };

  // Initialize from existing value or default
  useEffect(() => {
    // Handle existing form values
    if (field.value) {
      try {
        // If it's already in schema format with coordinates
        if (field.value.coordinates && field.value.address) {
          // Create a display-friendly version
          const displayLocation: LocationType = {
            id: `loc_${
              field.value.placeId || Math.random().toString(36).substr(2, 9)
            }`,
            name: field.value.city || field.value.address.split(",")[0],
            address: field.value.address,
            country: field.value.country || "",
            lat: field.value.coordinates[1], // lat
            lng: field.value.coordinates[0], // lng
            placeId: field.value.placeId || "",
          };

          setSelectedLocation(displayLocation);
          // No need to update form since it's already in correct format
        }
        // Handle other formats if needed
      } catch (error) {
        console.error("Error handling existing location value:", error);
      }
    }
  }, []);

  // Extract country from address string
  const extractCountry = (addressString: string): string => {
    // Typically the country is the last part of the address in Nominatim results
    const parts = addressString.split(", ");
    return parts.length > 0 ? parts[parts.length - 1] : "";
  };

  const searchLocations = async (query: string) => {
    if (!query.trim()) {
      // Don't show any locations when search is empty
      setLocations([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Use Nominatim API for searching
      // Add proper headers including User-Agent which is required by Nominatim
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query
        )}&format=json&limit=10`,
        {
          headers: {
            "User-Agent": "YourAppName/1.0", // Replace with your app name and version
            "Accept-Language": "en", // Optional: specify language preference
            Referer: "https://your-app-domain.com", // Replace with your app's domain
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();

      // Map the Nominatim API response to our location format
      // Filter out any items without valid data
      const mappedLocations = data
        .filter((item: any) => item && item.place_id && item.display_name)
        .map((item: any) => {
          const country = extractCountry(item.display_name);
          const nameParts = item.display_name.split(", ");
          const name = nameParts[0] || item.name;

          // Skip items without a proper name
          if (!name) return null;

          return {
            id: `loc_${item.place_id}`,
            name: name,
            address: item.display_name,
            country: country,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            placeId: item.place_id.toString(),
          };
        })
        .filter(Boolean); // Remove any null items from the map

      setLocations(mappedLocations);
    } catch (error) {
      console.error("Search locations error:", error);
      // If API fails, show an empty list
      setLocations([]);
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

    // Only trigger search if there are at least 3 characters (to reduce API calls)
    if (text.length >= 3) {
      const timeout = setTimeout(() => {
        searchLocations(text);
      }, 500);

      setSearchTimeout(timeout as any);
    } else {
      // Clear locations when text is less than 3 characters
      setLocations([]);
    }
  };

  // Load empty locations list when modal opens
  useEffect(() => {
    if (modalVisible) {
      setLocations([]);
      setSearch("");
    }
  }, [modalVisible]);

  const handleSelectLocation = (location: LocationType) => {
    if (isMultiSelect) {
      // For multi-select, add to array if not already selected
      const isAlreadySelected = selectedLocations.some(
        (loc) => loc.id === location.id
      );

      let updatedLocations;
      if (isAlreadySelected) {
        updatedLocations = selectedLocations.filter(
          (loc) => loc.id !== location.id
        );
      } else {
        updatedLocations = [...selectedLocations, location];
      }

      setSelectedLocations(updatedLocations);

      // Convert to schema format for form submission
      const schemaFormattedLocations = updatedLocations.map(
        convertToSchemaFormat
      );

      // Update form with schema-formatted data
      field.onChange(schemaFormattedLocations);
      form.setValue(controller?.name || "", schemaFormattedLocations, {
        shouldValidate: true,
      });
    } else {
      // For single select
      setSelectedLocation(location);

      // Convert to schema format for form submission
      const schemaFormattedLocation = convertToSchemaFormat(location);

      // Update form with schema-formatted data
      field.onChange(schemaFormattedLocation);
      form.setValue(controller?.name || "", schemaFormattedLocation, {
        shouldValidate: true,
      });
      setModalVisible(false);
    }
  };

  const removeLocation = (locationId: string) => {
    const updatedLocations = selectedLocations.filter(
      (loc) => loc.id !== locationId
    );
    setSelectedLocations(updatedLocations);

    // Convert to schema format for form submission
    const schemaFormattedLocations = updatedLocations.map(
      convertToSchemaFormat
    );

    // Update form with schema-formatted data
    field.onChange(schemaFormattedLocations);
    form.setValue(controller?.name || "", schemaFormattedLocations, {
      shouldValidate: true,
    });
  };

  const handleDone = () => {
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.selectButton, controller.style]}
        onPress={() => setModalVisible(true)}
      >
        <Text
          style={[
            styles.selectButtonText,
            !selectedLocation &&
              !selectedLocations.length &&
              styles.placeholderText,
          ]}
        >
          {isMultiSelect
            ? selectedLocations.length > 0
              ? `${selectedLocations.length} location(s) selected`
              : controller.placeholder || "Select locations"
            : selectedLocation
            ? selectedLocation.name
            : controller.placeholder || "Search for a location"}
        </Text>
        <Ionicons name="location" size={20} color="#666" />
      </TouchableOpacity>

      {isMultiSelect && selectedLocations.length > 0 && (
        <View style={styles.chipsContainer}>
          {selectedLocations.map((location) => (
            <View key={location.id} style={styles.chip}>
              <Text style={styles.chipText} numberOfLines={1}>
                {location.name}
              </Text>
              <TouchableOpacity
                style={styles.chipRemove}
                onPress={() => removeLocation(location.id)}
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
                {controller.label ||
                  (isMultiSelect ? "Select Locations" : "Search Location")}
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
                placeholder="Type at least 3 characters to search..."
                autoCapitalize="none"
                clearButtonMode="while-editing"
              />
              {search !== "" && (
                <TouchableOpacity
                  onPress={() => {
                    setSearch("");
                    setLocations([]);
                  }}
                >
                  <Ionicons name="close-circle" size={20} color="#666" />
                </TouchableOpacity>
              )}
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0077CC" />
                <Text style={styles.loadingText}>Searching locations...</Text>
              </View>
            ) : locations.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {search.trim() === ""
                    ? "Type to search for locations"
                    : "No locations found"}
                </Text>
              </View>
            ) : (
              <>
                <FlatList
                  data={locations}
                  keyExtractor={(item) => item.id}
                  style={styles.locationsList}
                  renderItem={({ item }) => {
                    const isSelected = isMultiSelect
                      ? selectedLocations.some((loc) => loc.id === item.id)
                      : selectedLocation?.id === item.id;

                    return (
                      <TouchableOpacity
                        style={[
                          styles.locationItem,
                          isSelected && styles.selectedLocation,
                        ]}
                        onPress={() => handleSelectLocation(item)}
                      >
                        <View style={styles.locationInfo}>
                          <Text
                            style={[
                              styles.locationName,
                              isSelected && styles.selectedLocationText,
                            ]}
                          >
                            {item.name}
                          </Text>
                          <Text
                            style={styles.locationAddress}
                            numberOfLines={2}
                          >
                            {item.address}
                          </Text>
                          <Text style={styles.locationCountry}>
                            {item.country}
                          </Text>
                        </View>

                        {isMultiSelect ? (
                          <View
                            style={[
                              styles.checkbox,
                              isSelected
                                ? styles.checkboxChecked
                                : styles.checkboxUnchecked,
                            ]}
                          >
                            {isSelected && (
                              <Ionicons
                                name="checkmark"
                                size={16}
                                color="#fff"
                              />
                            )}
                          </View>
                        ) : (
                          isSelected && (
                            <Ionicons
                              name="checkmark"
                              size={20}
                              color="#0077CC"
                            />
                          )
                        )}
                      </TouchableOpacity>
                    );
                  }}
                />

                {isMultiSelect && (
                  <View style={styles.modalFooter}>
                    <TouchableOpacity
                      style={styles.doneButton}
                      onPress={handleDone}
                    >
                      <Text style={styles.doneButtonText}>Done</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
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
  selectButton: {
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
  selectButtonText: {
    fontSize: 16,
    color: "#000",
    flex: 1,
  },
  placeholderText: {
    color: "#999",
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e1f5fe",
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 8,
    marginBottom: 8,
    maxWidth: "45%",
  },
  chipText: {
    fontSize: 14,
    color: "#0077CC",
    marginRight: 4,
    flex: 1,
  },
  chipRemove: {
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
  locationsList: {
    maxHeight: 300,
  },
  locationItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: "500",
  },
  locationAddress: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  locationCountry: {
    fontSize: 14,
    color: "#0077CC",
    marginTop: 2,
    fontWeight: "500",
  },
  selectedLocation: {
    backgroundColor: "#f0f7ff",
  },
  selectedLocationText: {
    fontWeight: "bold",
    color: "#0077CC",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxUnchecked: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  checkboxChecked: {
    backgroundColor: "#0077CC",
    borderWidth: 1,
    borderColor: "#0077CC",
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

export default LocationController;
