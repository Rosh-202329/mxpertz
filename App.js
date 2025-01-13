import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [description, setDescription] = useState('');

  const registerUser = async () => {
    try {
      await axios.post('http://localhost:5000/api/register', { name, email, password });
      alert('User registered successfully');
    } catch (error) {
      alert(error.response?.data || 'Error registering user');
    }
  };

  const loginUser = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/login', { email, password });
      setToken(response.data.token);
      alert('Login successful');
    } catch (error) {
      alert(error.response?.data || 'Error logging in');
    }
  };

  const bookAppointment = async () => {
    try {
      await axios.post(
        'http://localhost:5000/api/appointments',
        { date: appointmentDate, description },
        { headers: { Authorization: token } }
      );
      alert('Appointment booked successfully');
      fetchAppointments();
    } catch (error) {
      alert(error.response?.data || 'Error booking appointment');
    }
  };

  const cancelAppointment = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/appointments/${id}`, {
        headers: { Authorization: token },
      });
      alert('Appointment canceled successfully');
      fetchAppointments();
    } catch (error) {
      alert(error.response?.data || 'Error canceling appointment');
    }
  };

  

  const fetchAppointments = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/appointments', {
        headers: { Authorization: token },
      });
      setAppointments(response.data);
    } catch (error) {
      alert('Error fetching appointments');
    }
  };

  return (
    <div>
      <h1>Hospital Appointment System</h1>

      <div>
        <h2>Register</h2>
        <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button onClick={registerUser}>Register</button>
      </div>

      <div>
        <h2>Login</h2>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button onClick={loginUser}>Login</button>
      </div>

      <div>
        <h2>Book Appointment</h2>
        <input
          type="datetime-local"
          value={appointmentDate}
          onChange={(e) => setAppointmentDate(e.target.value)}
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button onClick={bookAppointment}>Book</button>
      </div>

      <div>
        <h2>Appointments</h2>
        <button onClick={fetchAppointments}>Refresh Appointments</button>
        <ul>
          {appointments.map((appointment) => (
            <li key={appointment._id}>
              {appointment.date} - {appointment.description}
              <button onClick={() => cancelAppointment(appointment._id)}>Cancel</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;

