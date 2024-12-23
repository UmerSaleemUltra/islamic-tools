import React, { useState, useEffect } from 'react';
import { Container, Card, CardContent, Typography, Grid, Button, CircularProgress } from '@mui/material';

const App = () => {
  const [hadith, setHadith] = useState(null); // State to store the fetched Hadith
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state

  // Function to fetch Hadith from the API
  const fetchHadith = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/hadiths');

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

  return (
    <Container>
      <Grid container spacing={2} justifyContent="center" style={{ marginTop: '20px' }}>
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
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="div" gutterBottom>
                  Hadith #{hadith.hadithNumber}
                </Typography>
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
                </Typography>
            
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default App;
