import React, { useEffect, useState } from "react";
import axios from "axios";
import { Typography, Switch, Card, CardContent, Button, TextField, Box, Container , Grid , CircularProgress } from "@mui/material";

const IslamicTools = () => {
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [date, setDate] = useState(null);
  const [showIslamicDate, setShowIslamicDate] = useState(true);
  const [tasbeehCount, setTasbeehCount] = useState(0);
  const [zikr, setZikr] = useState("SubhanAllah");
  const [nextPrayer, setNextPrayer] = useState(null);
  const [calendar, setCalendar] = useState([]);
  const [ayah, setAyah] = useState(null);
  const [asmaAlHusna, setAsmaAlHusna] = useState([]);
  const [todayName, setTodayName] = useState(null);
  const [hadith, setHadith] = useState(null); // State to store the fetched Hadith
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state




  const notifyPrayerTime = () => {
    if (nextPrayer) {
      const notificationTime = new Date(nextPrayer.time).getTime() - 60000; // 1 minute before
      setTimeout(() => {
        new Notification(`It's time for ${nextPrayer.name} prayer!`);
      }, notificationTime - Date.now());
    }
  };

  useEffect(() => {
    notifyPrayerTime();
  }, [nextPrayer]);


  const KARACHI_COORDINATES = { latitude: 24.8607, longitude: 67.0011 };

useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await axios.get(
        `https://api.aladhan.com/v1/timings?latitude=${KARACHI_COORDINATES.latitude}&longitude=${KARACHI_COORDINATES.longitude}&method=1&school=1&timezonestring=Asia/Karachi`
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
        `https://api.aladhan.com/v1/hijriCalendarByCity?city=Karachi&country=Pakistan&month=${data.date.hijri.month.number}&year=${data.date.hijri.year}&adjustment=0`
      );
      setCalendar(calendarResponse.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  fetchData();
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

  const tasbeehReset = () => {
    setTasbeehCount(0);
    setZikr("SubhanAllah");
  };

  const fetchAsmaAlHusna = async () => {
    try {
      const response = await axios.get("https://api.aladhan.com/v1/asmaAlHusna");
      if (response.data && response.data.data) {
        setAsmaAlHusna(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching Asma Al-Husna:", error);
    }
  };

  // Fetch the Asma Al Husna names on initial load
  useEffect(() => {
    fetchAsmaAlHusna();
  }, []);

  useEffect(() => {
    if (asmaAlHusna.length > 0) {
      const todayIndex = new Date().getDate() % asmaAlHusna.length; // Cycle through names
      setTodayName(asmaAlHusna[todayIndex]);
    }
  }, [asmaAlHusna]);

  // Log today's name once it's updated
  useEffect(() => {
    if (todayName) {
      console.log(todayName); // Log the updated todayName
    }
  }, [todayName]);


  // Function to fetch Hadith from the API
  const fetchHadith = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://islamic-tools-backend-code-7zi4.vercel.app/hadiths');

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setHadith(data); // Store the Hadith in state
      setError(null); // Clear any previous error
    } catch (err) {
      setError('Error fetching Hadith. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Hadith on component mount
  useEffect(() => {
    fetchHadith();
  }, []);


  if (!prayerTimes || !date || !calendar ) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Typography variant="h6">Loading...</Typography>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      {/* Islamic Tools Header */}
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

      {/* Hijri Calendar */}
      <Card className="w-full max-w-md shadow-md mb-4">
        <CardContent>
          <Typography variant="h6" className="text-center mb-2">
            {date.hijri.month} {date.hijri.year}
          </Typography>
          <div className="grid grid-cols-7 gap-2">
            {calendar.length > 0 &&
              calendar.map((day, index) => (
                <div
                  key={index}
                  className={`text-center py-2 rounded ${
                    day.date.gregorian.day === date.gregorian.day
                      ? "bg-green-500 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  {day.date.hijri.day}
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Ayah of the Day */}
      <Card className="w-full max-w-md shadow-md mb-4">
        <CardContent>
          <Typography variant="h5" className="text-center mb-2">
            آج کی آیت
          </Typography>

          <Typography
            variant="body1"
            className="text-right mb-4 font-bold text-green-700"
            style={{ direction: "rtl" }}
          >
            {ayah?.text}
          </Typography>

          <Typography
            variant="body2"
            className="text-right mb-4 font-medium text-gray-700"
            style={{ direction: "rtl" }}
          >
            {ayah?.translation}
          </Typography>

          <Typography variant="body2" className="text-center text-gray-500">
            {ayah?.surah} - آیت {ayah?.number}
          </Typography>

          {/* Audio Player */}
          {ayah?.audioUrl && (
            <div className="mt-4">
              <audio controls className="w-full">
                <source src={ayah.audioUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
        </CardContent>
        <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      flexDirection="column" // Stack elements vertically
    >
      {todayName ? (
        <>
          <Typography variant="h4" align="center">
            {todayName.name}
          </Typography>
          <Typography variant="subtitle1" align="center" style={{ marginTop: "10px" }}>
            {todayName.en?.meaning || "Meaning not available"}
          </Typography>
        </>
      ) : (
        <Typography align="center">Loading today's name...</Typography>
      )}
    </Box>
 
      </Card>

      <Box
  display="flex"
  justifyContent="center"
  alignItems="center"
  flexDirection="column"
  width="100%"
  padding={2} // Add padding for spacing
>
  <Grid container spacing={2} justifyContent="center">
    {/* Loading state */}
    {loading && (
      <Grid item xs={12}>
        <CircularProgress />
        <Typography variant="h6" align="center" color="primary">
          Loading...
        </Typography>
      </Grid>
    )}

    {/* Error state */}
   
  </Grid>
</Box>


<Box
  display="flex"
  justifyContent="center"
  alignItems="center"
  flexDirection="column"
  width="100%"
  padding={2} // Add padding for spacing
>
  <Grid container spacing={2} justifyContent="center">
    {/* Loading state */}
    {loading && (
      <Grid item xs={12}>
        <CircularProgress />
        <Typography variant="h6" align="center" color="primary">
          Loading...
        </Typography>
      </Grid>
    )}

    {/* Error state */}
    {error && (
      <Grid item xs={12}>
        <Typography variant="h6" align="center" color="error">
          {error}
        </Typography>
      </Grid>
    )}

    {/* Display Hadith if available */}
    {hadith && (
      <Grid item xs={12} sm={10} md={8} lg={6}>
        <Card sx={{ maxWidth: "100%", margin: "auto" }}>
          <CardContent>
            <Typography variant="h5" component="div" gutterBottom>
              Hadith #{hadith.hadithNumber}
            </Typography>
            <Typography variant="h6" component="div" gutterBottom>
              Book: {hadith.bookSlug}
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              <strong>Status:</strong> {hadith.status}
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              <strong>Chapter:</strong> {hadith.chapterId}
            </Typography>
            <Box
              sx={{
                maxHeight: "200px", // Limit height
                overflowY: "auto", // Scrollable if content is large
              }}
            >
              <Typography variant="body2" color="textSecondary" paragraph>
                <strong>Urdu:</strong> {hadith.hadithUrdu}
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                <strong>Arabic:</strong> {hadith.hadithArabic}
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                <strong>Hadith Narrator (Urdu):</strong> {hadith.urduNarrator}
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                <strong>Hadith Narrator (English):</strong> {hadith.englishNarrator}
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                <strong>Heading:</strong> {hadith.headingEnglish}
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                <strong>English:</strong> {hadith.hadithEnglish}
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              sx={{ marginTop: 2 }}
              onClick={fetchHadith}
            >
              Next Hadith
            </Button>
          </CardContent>
        </Card>
      </Grid>
    )}
  </Grid>
</Box>

    </div>
  );
};

export default IslamicTools;
