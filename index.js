const express = require ("express")
const mongoose = require ("mongoose")
const cors = require('cors')
const PORT = 8000;
const app = express();
require('dotenv').config();



app.use(express.json());
app.use (cors())

mongoose.connect("mongodb://localhost:27017/hospital_appointment_system",{
    useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

  //schema
  const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
},
    email: {
         type: String, 
        required: true
     },
    password: { 
        type: String,
        required: true },
  });
  
  const appointmentSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true
     },
    date: {
         type: Date, 
         required: true },
    description: { 
        type: String, 
        required: true },
  });
  
  const User = mongoose.model('User', userSchema);
  const Appointment = mongoose.model('Appointment', appointmentSchema);


  
  // Middleware for authentication
  const authenticate = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.send('Access denied. No token provided.');
  
    try {
      const decoded = jwt.verify(token,  process.env.JWT_SECRET); 
      req.user = decoded;
      next();
    } catch (err) {
      res.send('Invalid token.');
    }
  };

  // API

// Register user
app.post('/api/register', async (req, res) => {
    try {
      const { name, email, password } = req.body;
  
      const newUser = await User.findOne({ email });
      if (newUser) return res.send('User already exists.');
  
      const userPassword = await bcrypt.hash(password, 10);
      const user = new User({ name, email, password: userPassword });
      await user.save();
  
      res.send('User registered successfully.');
    } catch (error) {
      res.send(' server error.');
    }
  });
  
  // Authenticate user
  app.post('/api/login', async (req, res) => {
    try {
      const { email, password } = req.body;
  
      const user = await User.findOne({ email });
      if (!user) return res.send('Invalid email or password.');
  
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) return res.send('Invalid email or password.');
  
      const token = jwt.sign({ _id: user._id, email: user.email },  process.env.JWT_SECRET); 
      res.send({ token });
    } catch (err) {
      res.send(' server error.');
    }
  });
  
  // Book appointment
  app.post('/api/appointments', authenticate, async (req, res) => {
    try {
      const { date, description } = req.body;
  
      const appointment = new Appointment({
        userId: req.user._id,
        date,
        description,
      });
      await appointment.save();
  
      res.send('Appointment booked successfully.');
    } catch (error) {
      res.send(' server error.');
    }
  });

  // Get all appointments 
app.get('/api/appointments', authenticate, async (req, res) => {
    try {
      const appointments = await Appointment.find({ userId: req.user._id });
      res.send(appointments);
    } catch (err) {
      res.status(500).send('Internal server error.');
    }
  });
  
  // Cancel appointment
  app.delete('/api/appointments/:id', authenticate, async (req, res) => {
    try {
      const appointment = await Appointment.findOne({
        _id: req.params.id,
        userId: req.user._id,
      });
  
      if (!appointment) return res.send('Appointment not found.');
  
      await Appointment.deleteOne({ _id: req.params.id });
      res.send('Appointment canceled successfully.');
    } catch (err) {
      res.send('Internal server error.');
    }
  });

  
  app.listen(PORT,()=>{
    console.log(`server is running on port : ${PORT}`)
  })
  