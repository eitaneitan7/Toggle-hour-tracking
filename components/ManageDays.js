import React, { useState, useContext } from 'react';
import { View, Text, Button, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { HoursContext } from '../context/HoursContext';

const ManageDays = () => {
  const { holidays, halfDays, addHoliday, addHalfDay, removeHoliday, removeHalfDay } = useContext(HoursContext);
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);
  const [currentType, setCurrentType] = useState('holiday');

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(false);
    setDate(currentDate);
    if (currentType === 'holiday') {
      addHoliday(currentDate);
    } else {
      addHalfDay(currentDate);
    }
  };

  const showMode = () => {
    setShow(true);
  };

  const showDatepicker = (type) => {
    setCurrentType(type);
    showMode();
  };

  const renderDayItem = ({ item, type }) => (
    <View style={styles.listItem}>
      <Text>{item.toDateString()}</Text>
      <TouchableOpacity onPress={() => (type === 'holiday' ? removeHoliday(item) : removeHalfDay(item))}>
        <Text style={styles.removeButton}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Days</Text>
      <View style={styles.buttonContainer}>
        <Button onPress={() => showDatepicker('holiday')} title="Add Holiday" />
        <Button onPress={() => showDatepicker('halfDay')} title="Add Half Day" />
      </View>
      {show && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode="date"
          is24Hour={true}
          display="default"
          onChange={onChange}
        />
      )}
      <Text style={styles.subTitle}>Holidays</Text>
      <FlatList
        data={holidays.sort((a, b) => a - b)}
        keyExtractor={(item) => item.toString()}
        renderItem={({ item }) => renderDayItem({ item, type: 'holiday' })}
      />
      <Text style={styles.subTitle}>Half Days</Text>
      <FlatList
        data={halfDays.sort((a, b) => a - b)}
        keyExtractor={(item) => item.toString()}
        renderItem={({ item }) => renderDayItem({ item, type: 'halfDay' })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f8ff',

  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subTitle: {
    fontSize: 20,
    marginVertical: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  removeButton: {
    color: 'red',
  },
});

export default ManageDays;
