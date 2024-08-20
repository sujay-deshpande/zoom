


'use client';
import axios from 'axios';
import { useState, useEffect } from 'react';

export default function Home() {
  const API_LINK = 'http://localhost:5000';
  const [meetingData, setMeetingData] = useState(null);
  const [topic, setTopic] = useState('');
  const [agenda, setAgenda] = useState('');
  const [scheduleType, setScheduleType] = useState('now');
  const [emailInAttendeeReport, setEmailInAttendeeReport] = useState(false);
  const [invitees, setInvitees] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [joinEvents, setJoinEvents] = useState([]);
  const [leaveEvents, setLeaveEvents] = useState([]);

  const handleZoomAuth = () => {
    window.location.href = `${API_LINK}/api/auth/zoom`;
  };

  const createMeeting = async () => {
    try {

      const response = await axios.post(`${API_LINK}/api/create-meetings`, {
        topic,
        agenda,
        type: scheduleType === 'now' ? 1 : 2,
        email_in_attendee_report: emailInAttendeeReport,
        invitees: invitees.split(',').map(email => email.trim()),
        start_time: scheduleType === 'later' ? meetingTime : undefined
      });
      setMeetingData(response.data);
    } catch (error) {
      console.error('Error creating meeting:', error);
    }
  };

  const handleCreateMeeting = () => {
    // if(!localStorage.getItem("access_token")){
    //   handleZoomAuth();
    // }
    createMeeting();
  };

  const fetchJoinEvents = async (meetingId) => {
    try {
      const response = await axios.get(`${API_LINK}/api/meetings/${meetingId}/participants/joined-people`);
      setJoinEvents(response.data.participants || []);
    } catch (error) {
      console.error('Error fetching join events:', error);
    }
  };

  const fetchLeaveEvents = async (meetingId) => {
    try {
      const response = await axios.get(`${API_LINK}/api/meetings/${meetingId}/participants/left`);
      setLeaveEvents(response.data.participants || []);
    } catch (error) {
      console.error('Error fetching leave events:', error);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Create Zoom Meeting</h1>
      <form style={styles.form} onSubmit={(e) => {
        e.preventDefault();
        handleCreateMeeting();
      }}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Meeting Name:</label>
          <input 
            style={styles.input} 
            type="text" 
            value={topic} 
            onChange={(e) => setTopic(e.target.value)} 
            required 
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Agenda:</label>
          <input 
            style={styles.input} 
            type="text" 
            value={agenda} 
            onChange={(e) => setAgenda(e.target.value)} 
            required 
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Schedule Meeting:</label>
          <label style={styles.radioLabel}>
            <input 
              style={styles.radioInput} 
              type="radio" 
              name="scheduleType" 
              value="now" 
              checked={scheduleType === 'now'} 
              onChange={(e) => setScheduleType(e.target.value)} 
            />
            Now
          </label>
          <label style={styles.radioLabel}>
            <input 
              style={styles.radioInput} 
              type="radio" 
              name="scheduleType" 
              value="later" 
              checked={scheduleType === 'later'} 
              onChange={(e) => setScheduleType(e.target.value)} 
            />
            Later
          </label>
        </div>
        {scheduleType === 'later' && (
          <div style={styles.formGroup}>
            <label style={styles.label}>Select Date and Time:</label>
            <input 
              style={styles.input} 
              type="datetime-local" 
              value={meetingTime} 
              onChange={(e) => setMeetingTime(e.target.value)} 
              required 
            />
          </div>
        )}
        <div style={styles.formGroup}>
          <label style={styles.label}>Email in Attendee Report:</label>
          <label style={styles.checkboxLabel}>
            <input 
              style={styles.checkboxInput} 
              type="checkbox" 
              checked={emailInAttendeeReport} 
              onChange={(e) => setEmailInAttendeeReport(e.target.checked)} 
            />
            Include
          </label>
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Meeting Invitees (comma-separated emails):</label>
          <input 
            style={styles.input} 
            type="text" 
            value={invitees} 
            onChange={(e) => setInvitees(e.target.value)} 
          />
        </div>
        <button style={styles.button} type="submit">Create Meeting</button>
      </form>

      {meetingData && (
        <div style={styles.meetingDetails}>
          <h2 style={styles.subtitle}>Meeting Created</h2>
          <p>Meeting ID: {meetingData.id}</p>
          <p>Topic: {meetingData.topic}</p>
          <p>Start Time: {meetingData.start_time}</p>
          <p>Join URL: <a href={meetingData.join_url} target="_blank" rel="noopener noreferrer">{meetingData.join_url}</a></p>
          <button style={styles.button} onClick={() => fetchJoinEvents(meetingData.id)}>Fetch Join Events</button>
          <button style={styles.button} onClick={() => fetchLeaveEvents(meetingData.id)}>Fetch Leave Events</button>

          <h3 style={styles.subtitle}>Join Events</h3>
          <ul style={styles.list}>
            {joinEvents.map((event, index) => (
              <li key={index}>Name: {event.name}, Join Time: {event.joinedAt}</li>
            ))}
          </ul>

          <h3 style={styles.subtitle}>Leave Events</h3>
          <ul style={styles.list}>
            {leaveEvents.map((event, index) => (
              <li key={index}>Name: {event.name}, Leave Time: {event.leave_time}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '600px',
    margin: 'auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: '24px',
    marginBottom: '20px',
    color: '#333',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  formGroup: {
    marginBottom: '15px',
  },
  label: {
    marginBottom: '5px',
    fontSize: '16px',
    color: '#555',
  },
  input: {
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    width: '100%',
    boxSizing: 'border-box',
  },
  radioLabel: {
    marginRight: '10px',
    fontSize: '16px',
    color: '#555',
  },
  radioInput: {
    marginRight: '5px',
  },
  checkboxLabel: {
    fontSize: '16px',
    color: '#555',
  },
  checkboxInput: {
    marginRight: '5px',
  },
  button: {
    padding: '10px 15px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '10px',
  },
  meetingDetails: {
    marginTop: '30px',
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
  },
  subtitle: {
    fontSize: '20px',
    marginBottom: '10px',
    color: '#333',
  },
  list: {
    paddingLeft: '20px',
    listStyleType: 'disc',
  }
};
