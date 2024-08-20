

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
      try {
        const ongoingResponse = await axios.post(`${API}/api/meetings/ongoing`);
        
        let ongoingMeetings = [];
        if (ongoingResponse.data.length > 0) {
          setJoinUrl(ongoingResponse.data[0].join_url); 
          setMeetingId(ongoingResponse.data[0].id); 
          ongoingMeetings = ongoingResponse.data; 
        } else {
          console.error("No ongoing meetings found.");
        }

        const futureResponse = await axios.get(`${API}/api/meetings/upcoming-meetings/`);
        
        let futureMeetings = futureResponse.data || [];

        const allMeetings = [...ongoingMeetings, ...futureMeetings];
        setMeetings(allMeetings); 
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

      await axios.post(`${API}/api/meetings/join-event`, {
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
};

export default JoinMeeting;
