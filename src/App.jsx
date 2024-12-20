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
  

  const KARACHI_COORDINATES = { latitude: 24.8607, longitude: 67.0011 };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `https://api.aladhan.com/v1/timings?latitude=${KARACHI_COORDINATES.latitude}&longitude=${KARACHI_COORDINATES.longitude}`
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

    const fetchQibla = async () => {
      try {
        const response = await axios.get(
          `https://api.aladhan.com/v1/qibla/${KARACHI_COORDINATES.latitude}/${KARACHI_COORDINATES.longitude}`
        );
        setQiblaDirection(response.data.data.direction);
      } catch (error) {
        console.error("Error fetching Qibla direction:", error);
      }
    };

    fetchData();
    fetchQibla();
  }, []);

  useEffect(() => {
    if (!prayerTimes) return;

    const calculateNextPrayer = () => {
      const now = new Date();
      const times = Object.entries(prayerTimes).map(([key, value]) => ({
        name: key,
        time: new Date(`${now.toDateString()} ${value}`),
      }));
      const upcoming = times.find(({ time }) => time > now) || times[0];
      const countdownInSeconds = Math.max(0, Math.floor((upcoming.time - now) / 1000));
    
      const hours = Math.floor(countdownInSeconds / 3600);
      const minutes = Math.floor((countdownInSeconds % 3600) / 60);
      const seconds = countdownInSeconds % 60;
    
      setNextPrayer({
        ...upcoming,
        countdown: `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      });
    };
    

    const interval = setInterval(() => {
      calculateNextPrayer();
    }, 1000);

    return () => clearInterval(interval);
  }, [prayerTimes]);

  useEffect(() => {
    if (window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", (event) => {
        setDeviceDirection(event.alpha || 0);
      });
    }
  }, []);

  const tasbeehReset = () => {
    setTasbeehCount(0);
    setZikr("SubhanAllah");
  };

  if (!prayerTimes || !date || qiblaDirection === null || !calendar) {
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

          {qiblaDirection !== null && (
  <div className="flex flex-col items-center mb-4">
    <Typography variant="body1" className="mb-2 font-semibold">
      {qiblaDirection !== null ? "Here is the Qibla" : "Fetching Qibla..."}
    </Typography>

    {/* Qibla Compass */}
    <div
      className="h-40 w-40 rounded-full border-4 border-green-500 flex items-center justify-center relative bg-white shadow-lg"
      style={{
        transform: `rotate(${qiblaRelativeDirection}deg)`,
      }}
    >
      {/* Compass Needle */}
      <div
        className="h-2 w-12 bg-red-500 absolute top-1/2 transform -translate-y-1/2"
        style={{
          transformOrigin: "center",
          transform: `rotate(${qiblaRelativeDirection}deg)`,
        }}
      ></div>

      {/* Inner Circle to Represent Qibla Center */}
      <div className="h-6 w-6 bg-green-500 rounded-full"></div>
    </div>
  </div>
)}


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

          {/* Prayer Countdown */}
     {/* Prayer Countdown */}
<div className="flex flex-col items-center mb-4">
  <Typography variant="body1" className="mb-2">
    Next Prayer: {nextPrayer?.name}
  </Typography>
  <Typography variant="h6" className="font-bold">
    Time Left: {nextPrayer?.countdown || "00:00:00"}
  </Typography>
</div>

        </CardContent>
      </Card>

      {/* Hijri Month Calendar */}
      <Card className="w-full max-w-md shadow-md">
        <CardContent>
          <Typography variant="h6" className="text-center mb-2">
            {date.hijri.month} {date.hijri.year}
          </Typography>
          <div className="grid grid-cols-7 gap-2">
            {calendar.map((day, index) => (
              <div
                key={index}
                className={`text-center py-2 rounded ${
                  day.date.gregorian.day === date.gregorian.day ? "bg-green-500 text-white" : "bg-gray-200"
                }`}
              >
                {day.date.hijri.day}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IslamicTools;
