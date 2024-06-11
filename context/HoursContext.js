import React, { createContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Constants from "expo-constants";
import { encode } from "base-64";

const HoursContext = createContext();

const HoursProvider = ({ children }) => {
  const [totalHours, setTotalHours] = useState(0);
  const [expectedHours, setExpectedHours] = useState(0);
  const [hourBalance, setHourBalance] = useState(0);
  const [holidays, setHolidays] = useState([]);
  const [halfDays, setHalfDays] = useState([]);
  const [message, setMessage] = useState("");

  const loadDays = useCallback(async () => {
    try {
      const storedHolidays = await AsyncStorage.getItem("holidays");
      const storedHalfDays = await AsyncStorage.getItem("halfDays");
      if (storedHolidays) {
        const parsedHolidays = JSON.parse(storedHolidays).map(
          (date) => new Date(date)
        );
        setHolidays(parsedHolidays);
      }
      if (storedHalfDays) {
        const parsedHalfDays = JSON.parse(storedHalfDays).map(
          (date) => new Date(date)
        );
        setHalfDays(parsedHalfDays);
      }
    } catch (error) {
      console.error("Failed to load days from AsyncStorage", error);
    }
  }, []);

  useEffect(() => {
    loadDays();
  }, [loadDays]);

  useEffect(() => {
    fetchData();
  }, [holidays, halfDays]);

  const fetchData = async () => {
    let API_KEY, WORKSPACE_ID;

    try {
      API_KEY = await AsyncStorage.getItem("togglApiKey");
      WORKSPACE_ID = await AsyncStorage.getItem("togglWorkspaceId");
    } catch (error) {
      console.error("Error retrieving settings from AsyncStorage:", error);
      setMessage("Failed to retrieve API key or workspace ID");
      return;
    }

    if (!API_KEY || !WORKSPACE_ID) {
      setMessage("API Key or Workspace ID is missing");
      return;
    }

    const testAuthentication = async () => {
      try {
        const auth = encode(`${API_KEY}:api_token`);
        const response = await axios.get(
          "https://api.track.toggl.com/api/v9/me",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Basic ${auth}`,
            },
          }
        );

        if (response.status === 200) {
          fetchTimeEntries(auth);
        } else {
          setMessage(`Authentication failed with status: ${response.status}`);
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          setMessage(
            `Error: ${error.response.status} - ${error.response.data}`
          );
        } else if (error instanceof Error) {
          setMessage(`Error: ${error.message}`);
        } else {
          setMessage("An unexpected error occurred");
        }
      }
    };

    const fetchTimeEntries = async (auth) => {
      try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const response = await axios.get(
          "https://api.track.toggl.com/api/v9/me/time_entries",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Basic ${auth}`,
            },
            params: {
              start_date: startOfMonth.toISOString(),
              end_date: endOfMonth.toISOString(),
            },
          }
        );

        if (response.status === 200) {
          const timeEntries = response.data;
          processTimeEntries(timeEntries);
        } else {
          setMessage(
            `Failed to fetch time entries with status: ${response.status}`
          );
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          setMessage(
            `Error: ${error.response.status} - ${error.response.data}`
          );
        } else if (error instanceof Error) {
          setMessage(`Error: ${error.message}`);
        } else {
          setMessage("An unexpected error occurred");
        }
      }
    };

    const processTimeEntries = (timeEntries) => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const filteredEntries = timeEntries.filter((entry) => {
        const entryDate = new Date(entry.start);
        return entryDate >= startOfMonth && entryDate <= now;
      });

      calculateTotalHours(filteredEntries);
    };

    const calculateTotalHours = (filteredEntries) => {
      const totalHours = filteredEntries.reduce(
        (acc, entry) => acc + entry.duration / 3600,
        0
      );
      setTotalHours(totalHours);
      calculateExpectedHours(totalHours);
    };

    const calculateExpectedHours = (totalHours) => {
      const now = new Date();
      const today = now.getDate();
      let expectedHours = 0;

      for (let day = 1; day <= today; day++) {
        const date = new Date(now.getFullYear(), now.getMonth(), day);
        const dayOfWeek = date.getDay();

        if (
          holidays.some(
            (holiday) => holiday.toDateString() === date.toDateString()
          )
        ) {
          continue;
        }

        if (
          halfDays.some(
            (halfDay) => halfDay.toDateString() === date.toDateString()
          )
        ) {
          expectedHours += 5;
        } else if (dayOfWeek >= 0 && dayOfWeek <= 4) {
          const dailyHours = dayOfWeek === 4 ? 8 : 9;
          expectedHours += dailyHours;
        }
      }

      setExpectedHours(expectedHours);
      setHourBalance(totalHours - expectedHours);
    };

    await testAuthentication();
  };

  const addHoliday = async (date) => {
    const updatedHolidays = [...holidays, date];
    setHolidays(updatedHolidays);
    await AsyncStorage.setItem("holidays", JSON.stringify(updatedHolidays));
  };

  const addHalfDay = async (date) => {
    const updatedHalfDays = [...halfDays, date];
    setHalfDays(updatedHalfDays);
    await AsyncStorage.setItem("halfDays", JSON.stringify(updatedHalfDays));
  };

  const removeHoliday = async (date) => {
    const updatedHolidays = holidays.filter(
      (holiday) => holiday.getTime() !== date.getTime()
    );
    setHolidays(updatedHolidays);
    await AsyncStorage.setItem("holidays", JSON.stringify(updatedHolidays));
  };

  const removeHalfDay = async (date) => {
    const updatedHalfDays = halfDays.filter(
      (halfDay) => halfDay.getTime() !== date.getTime()
    );
    setHalfDays(updatedHalfDays);
    await AsyncStorage.setItem("halfDays", JSON.stringify(updatedHalfDays));
  };

  return (
    <HoursContext.Provider
      value={{
        totalHours,
        expectedHours,
        hourBalance,
        holidays,
        halfDays,
        message,
        fetchData,
        addHoliday,
        addHalfDay,
        removeHoliday,
        removeHalfDay,
      }}
    >
      {children}
    </HoursContext.Provider>
  );
};

export { HoursProvider, HoursContext };
