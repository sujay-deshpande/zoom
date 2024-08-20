

'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = "http://localhost:5000";

const JoinMeeting = () => {
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
        console.log("meetings:", allMeetings);
        setMeetings(allMeetings); 
      } catch (error) {
        console.error("Error fetching meetings:", error);
      }
    };

    fetchOngoingMeetings();
  }, []);

  return (
    <div style={styles.container}>
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
