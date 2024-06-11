import React, { useContext, useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, ScrollView } from "react-native";
import { HoursContext } from "../context/HoursContext";

const HomeScreen = () => {
  const { totalHours, expectedHours, hourBalance, message, fetchData } =
    useContext(HoursContext);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setErrorMessage(message);
  }, [message]);

  const formatTime = (hoursDecimal) => {
    const hours = Math.floor(hoursDecimal);
    const minutes = Math.round((hoursDecimal - hours) * 60);
    return `${hours}H and ${minutes}M`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Toggl Hour Tracker</Text>
      <Text style={styles.message}>{errorMessage}</Text>
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Total Hours:</Text>
        <Text style={styles.value}>{formatTime(totalHours)}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Expected Hours: </Text>
        <Text style={styles.value}>{formatTime(expectedHours)}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Hour Balance: </Text>
        <Text style={styles.value}>{formatTime(hourBalance)}</Text>
      </View>
      <Button title="Re-fetch Data" onPress={fetchData} color="#4CAF50" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f8ff",
    padding: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 100,
  },
  message: {
    fontSize: 18,
    color: "red",
    marginBottom: 20,
    textAlign: "center",
  },
  infoContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: "#fff",
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  value: {
    fontSize: 20,
    color: "#4CAF50",
  },
  button: {
    backgroundColor: "#4CAF50",
    color: "#fff",
    padding: 10,
    borderRadius: 5,
  },
});

export default HomeScreen;
