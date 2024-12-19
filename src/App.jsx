import React, { useState, useEffect } from 'react';
import moment from 'moment-hijri';
import { Box, Typography, Button, Card, CardContent } from '@mui/material';
import axios from 'axios';

const IslamicCalendar = () => {
  const [currentDate, setCurrentDate] = useState('');
  const [hijriDate, setHijriDate] = useState('');
  const [currentDay, setCurrentDay] = useState('');
  const [isGregorian, setIsGregorian] = useState(true);
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [qiblaDirection, setQiblaDirection] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState('');

  // Fetch Prayer Times, Qibla direction, and Hadiths
  useEffect(() => {
    // Fetch Prayer Times from Aladhan API (Mecca as default)
    axios
      .get('https://api.aladhan.com/v1/timingsByCity?city=Mecca&country=SA&method=2')
      .then((response) => setPrayerTimes(response.data.data.timings))
      .catch((error) => console.error('Error fetching prayer times:', error));

    // Fetch Qibla Direction using Geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        axios
          .get(`https://api.qiblalocator.com/v1/direction?latitude=${latitude}&longitude=${longitude}`)
          .then((response) => setQiblaDirection(response.data.qiblaDirection))
          .catch((error) => {
            console.error('Error fetching Qibla direction:', error);
            setQiblaDirection('Unable to fetch Qibla direction');
          });
      });
    }

    // Set Gregorian and Hijri Dates
    const gregorianDate = moment();
    const hijri = gregorianDate.format('iD iMMMM iYYYY');
    const day = gregorianDate.format('dddd');

    setCurrentDate(gregorianDate.format('MMMM D, YYYY'));
    setHijriDate(hijri);
    setCurrentDay(day);
  }, []);

  // Toggle between Gregorian and Hijri Calendar
  const toggleCalendar = () => {
    setIsGregorian(!isGregorian);
  };

  return (
    <Box className="p-6 bg-gray-100 rounded-lg shadow-lg max-w-4xl mx-auto">
      <Typography variant="h4" gutterBottom align="center" className="text-2xl font-semibold text-gray-800">
        Islamic Calendar & Tools
      </Typography>

      {/* Current Date Section */}
      <Card className="mb-4 bg-white p-4 rounded-lg shadow-md">
        <CardContent>
          <Typography variant="h6" gutterBottom align="center" className="text-lg font-medium text-gray-700">
            <strong>Current Day:</strong> {currentDay}
          </Typography>
          <Typography variant="h6" gutterBottom align="center" className="text-lg font-medium text-gray-700">
            <strong>{isGregorian ? 'Gregorian Date' : 'Hijri Date'}:</strong> {isGregorian ? currentDate : hijriDate}
          </Typography>
        </CardContent>
      </Card>

      {/* Toggle Button */}
      <div className="text-center mb-4">
        <Button
          variant="outlined"
          color="primary"
          onClick={toggleCalendar}
          className="w-full sm:w-auto py-2 px-4 text-lg font-medium"
        >
          Switch to {isGregorian ? 'Hijri' : 'Gregorian'} Calendar
        </Button>
      </div>

      {/* Prayer Times Section */}
      {prayerTimes && (
        <Card className="mb-4 bg-white p-4 rounded-lg shadow-md">
          <CardContent>
            <Typography variant="h6" gutterBottom align="center" className="text-lg font-medium text-gray-700">
              <strong>Prayer Times</strong>
            </Typography>
            <ul className="list-disc pl-5 text-gray-700">
              {Object.keys(prayerTimes).map((prayer) => (
                <li key={prayer} className="text-sm">
                  <strong>{prayer}: </strong>{prayerTimes[prayer]}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Qibla Direction */}
      {qiblaDirection && (
        <Card className="mb-4 bg-white p-4 rounded-lg shadow-md">
          <CardContent>
            <Typography variant="h6" gutterBottom align="center" className="text-lg font-medium text-gray-700">
              <strong>Qibla Direction</strong>
            </Typography>
            <Typography variant="body1" align="center" className="text-sm text-gray-700">
              The Qibla is {qiblaDirection}° from North.
            </Typography>
          </CardContent>
        </Card>
      )}

    </Box>
  );
};

export default IslamicCalendar;
