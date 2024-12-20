import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Typography,
  Switch,
  Card,
  CardContent,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";

const IslamicTools = () => {
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [date, setDate] = useState(null);
  const [showIslamicDate, setShowIslamicDate] = useState(true);
  const [customZikrList, setCustomZikrList] = useState(["SubhanAllah", "Alhamdulillah", "Allahu Akbar"]);
  const [newZikr, setNewZikr] = useState("");
  const [qiblaDirection, setQiblaDirection] = useState(null);
  const [deviceDirection, setDeviceDirection] = useState(0);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    const fetchLocationAndData = async () => {
      try {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            setUserLocation({ latitude, longitude });

            const qiblaResponse = await axios.get(
              `https://api.aladhan.com/v1/qibla/${latitude}/${longitude}`
            );
            setQiblaDirection(qiblaResponse.data.data.direction);
          },
          (error) => {
            console.error("Error getting location:", error);
          }
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchLocationAndData();
  }, []);

  useEffect(() => {
    const handleDeviceOrientation = (event) => {
      if (event.alpha !== null) {
        setDeviceDirection(event.alpha);
      }
    };

    if (window.DeviceOrientationEvent) {
      if (typeof DeviceOrientationEvent.requestPermission === "function") {
        DeviceOrientationEvent.requestPermission()
          .then((response) => {
            if (response === "granted") {
              window.addEventListener("deviceorientation", handleDeviceOrientation);
            }
          })
          .catch(console.error);
      } else {
        window.addEventListener("deviceorientation", handleDeviceOrientation);
      }
    }

    return () => window.removeEventListener("deviceorientation", handleDeviceOrientation);
  }, []);

  const addZikr = () => {
    if (newZikr.trim()) {
      setCustomZikrList([...customZikrList, newZikr]);
      setNewZikr("");
    }
  };

  const removeZikr = (index) => {
    const updatedList = [...customZikrList];
    updatedList.splice(index, 1);
    setCustomZikrList(updatedList);
  };

  if (qiblaDirection === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Typography variant="h6">Loading...</Typography>
      </div>
    );
  }

  const qiblaRelativeDirection = (qiblaDirection - deviceDirection + 360) % 360;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <Card className="w-full max-w-md shadow-md mb-4">
        <CardContent>
          <Typography variant="h5" className="text-center mb-4">
            Islamic Tools
          </Typography>
          {/* Qibla Compass */}
          <div className="flex flex-col items-center mb-4">
            <Typography variant="body1" className="mb-2">
              Qibla Direction:
            </Typography>
            <div
              className="h-40 w-40 rounded-full border-4 border-green-500 flex items-center justify-center relative bg-white shadow-lg"
              style={{
                transform: `rotate(${qiblaRelativeDirection}deg)`,
              }}
            >
              <div className="h-6 w-6 bg-green-500 rounded-full"></div>
            </div>
          </div>
          {/* Custom Zikr List */}
          <div className="mb-4">
            <Typography variant="h6" className="font-bold mb-2">Zikr List:</Typography>
            <List>
              {customZikrList.map((zikr, index) => (
                <ListItem key={index} className="flex justify-between">
                  <ListItemText primary={zikr} />
                  <IconButton onClick={() => removeZikr(index)}>
                    <Delete />
                  </IconButton>
                </ListItem>
              ))}
            </List>
            <div className="flex items-center mt-2">
              <TextField
                label="Add Zikr"
                value={newZikr}
                onChange={(e) => setNewZikr(e.target.value)}
                variant="outlined"
                size="small"
              />
              <Button variant="contained" color="primary" onClick={addZikr} className="ml-2">
                <Add />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IslamicTools;
