



const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

dotenv.config();

const app = express();
const PORT = 5000;

const CLIENT_ID = process.env.ZOOM_CLIENT_ID ;
const CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET ;
const REDIRECT_URI = process.env.REDIRECT_URI ;
const MONGODB_URL = process.env.MONGODB_URL ;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(bodyParser.json());

// MongoDB schema for storing the access token
const tokenSchema = new mongoose.Schema({
  accessToken: String,
  expiresAt: Date,
});

const Token = mongoose.model('Token', tokenSchema);

// Connect to MongoDB
mongoose.connect(MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Function to fetch a new access token
const fetchNewAccessToken = async (code = null) => {
  try {
    const params = code
      ? { grant_type: 'authorization_code', code, redirect_uri: REDIRECT_URI }
      : { grant_type: 'client_credentials' };

    const response = await axios.post('https://zoom.us/oauth/token', null, {
      params,
      auth: {
        username: CLIENT_ID,
        password: CLIENT_SECRET,
      },
    });

    const { access_token, expires_in } = response.data;
    const expiresAt = new Date(Date.now() + expires_in * 1000);

    const token = await Token.findOneAndUpdate(
      {},
      { accessToken: access_token, expiresAt },
      { upsert: true, new: true }
    );

    console.log('New access token fetched:', token);
    return token.accessToken;
  } catch (error) {
    console.error('Error fetching new access token:', error.message);
    throw new Error('Failed to fetch access token');
  }
};

// Middleware to check and renew the access token if necessary
const checkAndRenewAccessToken = async () => {
  try {
    const token = await Token.findOne();

    if (!token || new Date() >= token.expiresAt) {
      await fetchNewAccessToken();
    }
  } catch (error) {
    console.error('Error renewing access token:', error.message);
  }
};

// Schedule token renewal every hour
setInterval(checkAndRenewAccessToken, 60 * 60 * 1000);

// Fetch the token from the database
const getAccessTokenFromDB = async () => {
  try {
    const token = await Token.findOne();
    return token ? token.accessToken : null;
  } catch (error) {
    console.error('Error fetching access token from database:', error.message);
    throw new Error('Failed to fetch access token from database');
  }
};

app.get('/api/auth/zoom', (req, res) => {
  const zoomOAuthUrl = `https://zoom.us/oauth/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
  console.log(zoomOAuthUrl)
  
  res.redirect(zoomOAuthUrl);
});

app.get('/api/oauth/callback', async (req, res) => {
  const code = req.query.code;
  try {
    await fetchNewAccessToken(code);
    res.redirect('http://localhost:3000');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/create-meetings', async (req, res) => {
  const { topic, agenda, type, attendeereport } = req.body;

  try {
    const accessToken = await getAccessTokenFromDB();

    const response = await axios.post(
      'https://api.zoom.us/v2/users/me/meetings',
      {
        topic: topic || 'New Meeting',
        type: type || 1,
        agenda: agenda || 'Meeting Agenda',
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: false,
          mute_upon_entry: false,
          watermark: false,
          use_pmi: false,
          approval_type: 0,
          audio: 'both',
          auto_recording: 'none',
          enforce_login: false,
          enforce_login_domains: '',
          alternative_hosts: '',
          global_dial_in_countries: [],
          global_dial_in_numbers: [],
          contact_name: '',
          contact_email: '',
          meeting_authentication: false,
          language_interpretation: {
            enable: false,
            interpreters: [],
          },
          sign_language_interpretation: {
            enable: false,
            interpreters: [],
          },
          breakout_room: {
            enable: false,
            rooms: [],
          },
          email_in_attendee_report: attendeereport,
          registration_type: 1,
          approval_type: 0,
          waiting_room: false,
          focus_mode: false,
          participant_video: false,
          host_video: false,
          jbh_time: 0,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    res.status(500).json({ error: error.response ? error.response.data : error.message });
  }
});

app.get('/api/meetings/upcoming-meetings', async (req, res) => {
  try {
    // checkAndRenewAccessToken()
    const accessToken = await getAccessTokenFromDB();

    const response = await axios.get('https://api.zoom.us/v2/users/me/meetings', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const filteredMeetings = response.data.meetings.filter(
      (meeting) => meeting.host_id !== CLIENT_ID
    );
    res.json(filteredMeetings);
  } catch (error) {
    console.error('Error fetching meetings:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: error.response ? error.response.data : error.message });
  }
});

app.get('/api/meetings/previous-meetings', async (req, res) => {
  try {
    const accessToken = await getAccessTokenFromDB();

    const response = await axios.get('https://api.zoom.us/v2/users/me/meetings', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      params: {
        type: 'previous_meetings',
      },
    });

    const filteredMeetings = response.data.meetings.filter(
      (meeting) => meeting.host_id !== CLIENT_ID
    );
    res.json(filteredMeetings);
  } catch (error) {
    console.error('Error fetching meetings:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: error.response ? error.response.data : error.message });
  }
});

app.post('/api/meetings/ongoing', async (req, res) => {
  try {
    const accessToken = await getAccessTokenFromDB();

    const response = await axios.get('https://api.zoom.us/v2/users/me/meetings', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      params: {
        type: 'live',
      },
    });
    res.json(response.data.meetings);
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    res.status(500).json({ error: error.response ? error.response.data : error.message });
  }
});

app.get('/api/meetings/:meetingId', async (req, res) => {
  const { meetingId } = req.params;

  try {
    const accessToken = await getAccessTokenFromDB();

    const response = await axios.get(`https://api.zoom.us/v2/meetings/${meetingId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/meetings/join', async (req, res) => {
  const { meetingId, name, email } = req.body;

  try {
    const accessToken = await getAccessTokenFromDB();

    const response = await axios.post(
      `https://api.zoom.us/v2/meetings/${meetingId}/registrants`,
      {
        first_name: name.split(' ')[0],
        last_name: name.split(' ')[1] || '',
        email,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    res.status(500).json({ error: error.response ? error.response.data : error.message });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const accessToken = await getAccessTokenFromDB();

    const response = await axios.get('https://api.zoom.us/v2/users', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    res.json(response.data.users);
  } catch (error) {
    console.error('Error fetching users:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: error.response ? error.response.data : error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
