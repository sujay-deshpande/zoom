const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const CryptoJS = require('crypto-js');

dotenv.config();

const app = express();
const PORT = 5000;

const CLIENT_ID = process.env.ZOOM_CLIENT_ID || 'VOzi_4ZhStSP8e3uErHfQw';
const CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET || '968a86y61EsvR5oFO3uwpiCQ2mM3Opwf';
const REDIRECT_URI = process.env.REDIRECT_URI || 'http://localhost:5000/api/oauth/callback';

app.use(cors({
  origin: 'http://localhost:3000',
}));

app.use(bodyParser.json());

app.get('/api/auth/zoom', (req, res) => {
  const zoomOAuthUrl = `https://zoom.us/oauth/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
  console.log(zoomOAuthUrl);
  res.redirect(zoomOAuthUrl);
});

app.get('/api/oauth/callback', async (req, res) => {
  const code = req.query.code;
  console.log(code);
  try {
    const response = await axios.post('https://zoom.us/oauth/token', null, {
      params: {
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
      },
      auth: {
        username: CLIENT_ID,
        password: CLIENT_SECRET,
      },
    });

    const { access_token } = response.data;
    console.log(access_token);
    res.redirect(`http://localhost:3000?access_token=${access_token}`);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// meeting creation
app.post('/api/create-meetings', async (req, res) => {
  const { access_token, topic, agenda, type, attendeereport } = req.body;
  console.log("\nIn api/meetings", access_token);
  
  try {
    const response = await axios.post('https://api.zoom.us/v2/users/me/meetings', {
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
          interpreters: []
        },
        sign_language_interpretation: {
          enable: false,
          interpreters: []
        },
        breakout_room: {
          enable: false,
          rooms: []
        },
        email_in_attendee_report: attendeereport,
        registration_type: 1,
        approval_type: 0,
        waiting_room: false,
        focus_mode: false,
        participant_video: false,
        host_video: false,
        jbh_time: 0
      }
    }, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(response.data);
    res.json(response.data);
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    res.status(500).json({ error: error.response ? error.response.data : error.message });
  }
});

// meeting list
app.get('/api/meetings/upcoming-meetings', async (req, res) => {
  const { access_token } = req.query;

  if (!access_token) {
    return res.status(400).json({ error: 'Access token is required' });
  }
  
  try {
    const response = await axios.get('https://api.zoom.us/v2/users/me/meetings', {
        headers: {
            Authorization: `Bearer ${access_token}`,
            'Content-Type': 'application/json'
        }
    });
    console.log(response)

    if (response.data.meetings) {
        const filteredMeetings = response.data.meetings.filter(meeting => meeting.host_id !== 'VOzi_4ZhStSP8e3uErHfQw');
        res.json(filteredMeetings);
    } else {
        res.json([]); 
    }
} catch (error) {
    console.error('Error fetching meetings:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: error.response ? error.response.data : error.message });
}

});


app.get('/api/meetings/previous-meetings', async (req, res) => {
    const { access_token } = req.query;

    if (!access_token) {
        return res.status(400).json({ error: 'Access token is required' });
    }
    
    try {
        const response = await axios.get('https://api.zoom.us/v2/users/me/meetings', {
            headers: {
                Authorization: `Bearer ${access_token}`,
                'Content-Type': 'application/json'
            },
            params: {
                type: 'previous_meetings',
            },
        });

        console.log('Zoom API Response:', response.data); 

        if (response.data.meetings) {
            const filteredMeetings = response.data.meetings.filter(meeting => meeting.host_id !== 'VOzi_4ZhStSP8e3uErHfQw');
            res.json(filteredMeetings);
        } else {
            res.json([]); 
        }
    } catch (error) {
        console.error('Error fetching meetings:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: error.response ? error.response.data : error.message });
    }
});




// ongoing live meeting info
app.post('/api/meetings/ongoing', async (req, res) => {
  const { access_token } = req.body;
  console.log("in /api/meetings/ongoing", req.query, access_token);
  try {
    const response = await axios.get('https://api.zoom.us/v2/users/me/meetings', {
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      params: {
        type: 'live',
      },
    });
    console.log(response.data.meetings);
    res.json(response.data.meetings);
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    res.status(500).json({ error: error.response ? error.response.data : error.message });
  }
});


// meeting information
app.get('/api/meetings/:meetingId', async (req, res) => {
  const { meetingId,access_token } = req.params;

  try {
      const response = await axios.get(`https://api.zoom.us/v2/meetings/${meetingId}`, {
          headers: {
              'Authorization': `Bearer ${access_token}`,
              'Content-Type': 'application/json'
          }
      });

      res.json(response.data);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// Api to join the meeting
app.post('/api/meetings/join', async (req, res) => {
  const { meetingId, name, email, access_token } = req.body;
  console.log(meetingId, name, email, access_token);
  
  try {
    const response = await axios.post(`https://api.zoom.us/v2/meetings/${meetingId}/registrants`, {
      first_name: name.split(' ')[0],
      last_name: name.split(' ')[1] || '',
      email,
    }, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
    });
    console.log(response.data);
    res.json(response.data);
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    res.status(500).json({ error: error.response ? error.response.data : error.message });
  }
});

//Joined

app.get('/api/meetings/:meetingId/participants/joined', async (req, res) => {
  const { meetingId } = req.params;
  const { access_token } = req.query;
  
  try {
    const response = await axios.get(`https://api.zoom.us/v2/metrics/meetings/${meetingId}/participants`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
    });
    
    const joinedParticipants = response.data.participants.filter(participant => participant.join_time);
    res.json({ message: 'Participants who joined', participants: joinedParticipants });
  } catch (error) {
    console.error('Error fetching participants:', error);
    res.status(500).json({ message: 'Error fetching participants' });
  }
});

app.get('/api/meetings/:meetingId/participants/joined-people', (req, res) => {
  const { meetingId } = req.params;

  if (!meetingId) {
    return res.status(400).json({ error: 'Meeting ID is missing!' });
  }

  let events = [];
  if (fs.existsSync('events.json')) {
    const data = fs.readFileSync('events.json', 'utf-8');
    events = JSON.parse(data);
  }

  const joinedPeople = events.filter(event => event.meetingId === meetingId);
  return res.json({ participants: joinedPeople });
});

//Left people

app.get('/api/meetings/:meetingId/participants/left', async (req, res) => {
  const { meetingId } = req.params;
  const { access_token } = req.query;
  
  try {
    const response = await axios.get(`https://api.zoom.us/v2/metrics/meetings/${meetingId}/participants`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
    });
    
    const leftParticipants = response.data.participants.filter(participant => participant.leave_time);
    res.json({ message: 'Participants who left', participants: leftParticipants });
  } catch (error) {
    console.error('Error fetching participants:', error);
    res.status(500).json({ message: 'Error fetching participants' });
  }
});


app.post('/api/meetings/join-event', (req, res) => {
  const { meetingId, name, email, access_token } = req.body;

  if (!access_token) {
    return res.status(400).json({ error: 'Access token is missing!' });
  }

  const currentTime = new Date().toISOString();

  const uniqueString = `${meetingId}-${name}-${email}-${currentTime}`;

  const userId = CryptoJS.SHA256(uniqueString).toString();

  const newEvent = {
    userId,
    meetingId,
    name,
    email,
    joinedAt: currentTime
  };

  let events = [];
  if (fs.existsSync('events.json')) {
    const data = fs.readFileSync('events.json', 'utf-8');
    events = JSON.parse(data);
  }

  events.push(newEvent);

  fs.writeFileSync('events.json', JSON.stringify(events, null, 2));

  return res.json({ message: 'You have joined the meeting!', event: newEvent });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
