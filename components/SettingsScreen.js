import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = ({ navigation }) => {
  const [apiKey, setApiKey] = useState('');
  const [workspaceId, setWorkspaceId] = useState('');

  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem('togglApiKey', apiKey);
      await AsyncStorage.setItem('togglWorkspaceId', workspaceId);
      Alert.alert('Success', 'Settings saved successfully', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Home'),
        },
      ]);
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Toggl API Key"
        value={apiKey}
        onChangeText={setApiKey}
      />
      <TextInput
        style={styles.input}
        placeholder="Toggl Workspace ID"
        value={workspaceId}
        onChangeText={setWorkspaceId}
      />
      <Button title="Save Settings" onPress={saveSettings} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f8ff',
  },
  input: {
    width: '80%',
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
});

export default SettingsScreen;
