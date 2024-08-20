'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = "http://localhost:5000";

const JoinMeeting = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [meetingId, setMeetingId] = useState('');
  const [joinUrl, setJoinUrl] = useState('');
  const [meetings, setMeetings] = useState([]);

    useEffect(() => {
    const fetchOngoingMeetings = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.error("No access token found in localStorage");
        return;
      }

      try {
        const ongoingResponse = await axios.post(`${API}/api/meetings/ongoing`, {
          access_token: token, 
        });

        let ongoingMeetings = [];
        if (ongoingResponse.data.length > 0) {
          setJoinUrl(ongoingResponse.data[0].join_url); 
          setMeetingId(ongoingResponse.data[0].id); 
          ongoingMeetings = ongoingResponse.data; // Store all ongoing meetings
        } else {
          console.error("No ongoing meetings found.");
        }

        const futureResponse = await axios.get(`${API}/api/meetings/upcoming-meetings/`, {
          params: {
            access_token: token,
          }
        });

        let futureMeetings = futureResponse.data || [];

        // Merge ongoing and future meetings
        const allMeetings = [...ongoingMeetings, ...futureMeetings];
        setMeetings(allMeetings); // Update meetings state with both ongoing and future meetings

      } catch (error) {
        console.error("Error fetching meetings:", error);
      }
    };

    fetchOngoingMeetings();
  }, []);
  const handleJoin = async () => {
    if (!joinUrl) {
      alert('Join URL is missing!');
      return;
    }

    try {
      window.open(joinUrl, '_blank');

      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        alert('Access token is missing!');
        return;
      }

      await axios.post(`${API}/api/meetings/join-event`, {
        access_token: accessToken,
        meetingId,
        name,
        email,
      });

      alert('You have joined the meeting!');
    } catch (error) {
      console.error(error);
      alert('Failed to join the meeting.');
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Join Meeting</h1>
      <div style={styles.form}>
        <input
          type="text"
          placeholder="Meeting ID"
          value={meetingId}
          onChange={(e) => setMeetingId(e.target.value)}
          style={styles.input}
        />
        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={styles.input}
        />
        <input
          type="email"
          placeholder="Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />
        <button onClick={handleJoin} style={styles.button}>Join Meeting</button>
      </div>

      {meetings.length > 0 && (
        <div style={styles.tableContainer}>
          <h2 style={styles.tableTitle}>Live and Upcoming Meetings</h2>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Meeting ID</th>
                <th>Title</th>
                <th>Start Time</th>
                <th>Join URL</th>
              </tr>
            </thead>
            <tbody>
              {meetings.map(meeting => (
                <tr key={meeting.id}>
                  <td>{meeting.id}</td>
                  <td>{meeting.title}</td>
                  <td>{new Date(meeting.start_time).toLocaleString()}</td>
                  <td>
                    <a href={meeting.join_url} target="_blank" rel="noopener noreferrer">
                      Join
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    backgroundColor: '#f0f0f0',
    minHeight: '100vh',
  },
  title: {
    fontSize: '2rem',
    marginBottom: '20px',
    color: '#333',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '400px',
  },
  input: {
    width: '100%',
    padding: '10px',
    margin: '10px 0',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '1rem',
  },
  button: {
    padding: '10px 20px',
    borderRadius: '4px',
    backgroundColor: '#007BFF',
    color: '#fff',
    fontSize: '1rem',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
    marginTop: '10px',
  },
  tableContainer: {
    marginTop: '20px',
    width: '100%',
    maxWidth: '600px',
  },
  tableTitle: {
    fontSize: '1.5rem',
    marginBottom: '10px',
    color: '#333',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '10px',
    borderBottom: '1px solid #ccc',
  },
  td: {
    padding: '10px',
    borderBottom: '1px solid #ccc',
  },
};

export default JoinMeeting;
