import React, { useEffect, useState } from "react";
import axios from "axios";
import { Typography, Switch, Card, CardContent, Button, TextField } from "@mui/material";

const IslamicTools = () => {
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [date, setDate] = useState(null);
  const [showIslamicDate, setShowIslamicDate] = useState(true);
  const [tasbeehCount, setTasbeehCount] = useState(0);
  const [zikr, setZikr] = useState("SubhanAllah");
  const [qiblaDirection, setQiblaDirection] = useState(null);
  const [deviceDirection, setDeviceDirection] = useState(0);
  const [nextPrayer, setNextPrayer] = useState(null);
  const [calendar, setCalendar] = useState(null);
  const [userLocation, setUserLocation] = useState({ latitude: null, longitude: null });

  useEffect(() => {
    // Fetch initial data
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `https://api.aladhan.com/v1/timings?latitude=24.8607&longitude=67.0011`
        );
        const data = response.data.data;
        setPrayerTimes(data.timings);
        setDate({
          gregorian: {
            day: data.date.gregorian.day,
            month: data.date.gregorian.month.en,
            year: data.date.gregorian.year,
          },
          hijri: {
            day: data.date.hijri.day,
            month: data.date.hijri.month.en,
            year: data.date.hijri.year,
          },
        });

        const calendarResponse = await axios.get(
          `https://api.aladhan.com/v1/hijriCalendarByCity?city=Karachi&country=Pakistan&month=${data.date.hijri.month.number}&year=${data.date.hijri.year}`
        );
        setCalendar(calendarResponse.data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }

    // Listen for device orientation changes
    if (window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", (event) => {
        setDeviceDirection(event.alpha || 0);
      });
    }
  }, []);

  useEffect(() => {
    // Fetch Qibla direction based on user's location
    if (userLocation.latitude && userLocation.longitude) {
      const fetchQibla = async () => {
        try {
          const response = await axios.get(
            `https://api.aladhan.com/v1/qibla/${userLocation.latitude}/${userLocation.longitude}`
          );
          setQiblaDirection(response.data.data.direction);
        } catch (error) {
          console.error("Error fetching Qibla direction:", error);
        }
      };
      fetchQibla();
    }
  }, [userLocation]);

  const tasbeehReset = () => {
    setTasbeehCount(0);
    setZikr("SubhanAllah");
  };

  const qiblaRelativeDirection = (qiblaDirection - deviceDirection + 360) % 360;

  if (!prayerTimes || !date || qiblaDirection === null || !calendar) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Typography variant="h6">Loading...</Typography>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <Card className="w-full max-w-md shadow-md mb-4">
        <CardContent>
          <Typography variant="h5" className="text-center mb-4">
            Islamic Tools
          </Typography>

          {/* Date Toggle */}
          <div className="flex flex-col items-center mb-4">
            <Typography variant="body1" className="mb-2">
              {showIslamicDate ? "Islamic Date" : "Gregorian Date"}:
            </Typography>
            <Typography variant="h6" className="font-bold">
              {showIslamicDate
                ? `${date.hijri.day} ${date.hijri.month} ${date.hijri.year}`
                : `${date.gregorian.day} ${date.gregorian.month} ${date.gregorian.year}`}
            </Typography>
            <Switch
              checked={showIslamicDate}
              onChange={() => setShowIslamicDate(!showIslamicDate)}
              className="mt-2"
            />
          </div>

          {/* Qibla Compass */}
          <div className="flex flex-col items-center mb-4">
            <Typography variant="body1" className="mb-2 font-semibold">
              Qibla Direction
            </Typography>
            <div
              className="h-40 w-40 rounded-full border-4 border-green-500 flex items-center justify-center relative bg-white shadow-lg"
              style={{
                transform: `rotate(${qiblaRelativeDirection}deg)`,
              }}
            >
              <div
                className="h-2 w-12 bg-red-500 absolute top-1/2 transform -translate-y-1/2"
                style={{
                  transformOrigin: "center",
                }}
              ></div>
              <div className="h-6 w-6 bg-green-500 rounded-full"></div>
            </div>
            <Typography variant="body2" className="text-gray-600 mt-2">
              Rotate your device until the red pointer aligns with the green circle to find the Qibla.
            </Typography>
          </div>

          {/* Tasbeeh Counter */}
          <div className="flex flex-col items-center mb-4">
            <TextField
              label="Zikr"
              value={zikr}
              onChange={(e) => setZikr(e.target.value)}
              variant="outlined"
              className="mb-2"
            />
            <Typography variant="h4" className="font-bold text-green-600 mb-2">
              {tasbeehCount}
            </Typography>
            <div className="flex gap-2">
              <Button
                variant="contained"
                color="primary"
                onClick={() => setTasbeehCount(tasbeehCount + 1)}
              >
                +1
              </Button>
              <Button variant="outlined" color="secondary" onClick={tasbeehReset}>
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IslamicTools;
