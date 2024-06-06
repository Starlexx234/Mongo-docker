const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(session({
    secret: 'yourSecret',
    resave: false,
    saveUninitialized: true,
}));

// Set mongoose strictQuery option
mongoose.set('strictQuery', true);

// Placeholder for MongoDB connection
let db;

// Schemas and Models
const employeeSchema = new mongoose.Schema({
    name: String,
    position: String,
    department: String,
});
const Employee = mongoose.model('Employee', employeeSchema);
mongoose.connect('mongodb://mongo:27017/CompanyDB');

// Login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Connect to MongoDB
    mongoose.connect(`mongodb://mongo:27017/CompanyDB`)
    .then(() => {
        db = mongoose.connection;
        req.session.loggedIn = true;
        res.json({ success: true, message: 'Login successful' });
    })
    .catch(err => {
        console.error('Error connecting to MongoDB:', err);
        res.status(401).json({ success: false, message: 'Failed to connect to MongoDB. Invalid username or password.' });
    });
});

app.post('/logout', (req, res) => {
    req.session.destroy();
    mongoose.connection.close();
    res.json({ message: 'Logged out successfully' });
});

// Middleware to check if user is logged in
function isLoggedIn(req, res, next) {
    if (req.session.loggedIn) {
        next();
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
}

// Routes for employees
app.get('/employees', isLoggedIn, (req, res) => {
    Employee.find({}, (err, employees) => {
        if (err) return res.status(500).send(err);
        res.json(employees);
    });
});

app.post('/employees', isLoggedIn, (req, res) => {
    const { name, position, department } = req.body;
    const newEmployee = new Employee({ name, position, department });
    newEmployee.save((err, employee) => {
        if (err) return res.status(500).send(err);
        res.json(employee);
    });
});

app.delete('/employees/:id', isLoggedIn, (req, res) => {
    Employee.findByIdAndDelete(req.params.id, (err) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'Employee deleted' });
    });
});

app.put('/employees/:id', isLoggedIn, (req, res) => {
    const { name, position, department } = req.body;
    Employee.findByIdAndUpdate(req.params.id, { name, position, department }, { new: true }, (err, employee) => {
        if (err) return res.status(500).send(err);
        res.json(employee);
    });
});

// Report routes
app.get('/report/departmentCount', isLoggedIn, (req, res) => {
    Employee.aggregate([
        { $group: { _id: '$department', count: { $sum: 1 } } }
    ]).then(result => res.json(result)).catch(err => res.status(500).send(err));
});

app.get('/report/positionCount', isLoggedIn, (req, res) => {
    Employee.aggregate([
        { $group: { _id: '$position', count: { $sum: 1 } } }
    ]).then(result => res.json(result)).catch(err => res.status(500).send(err));
});

app.get('/report/employeesByDepartment', isLoggedIn, (req, res) => {
    const { department } = req.query;
    Employee.find({ department }, (err, employees) => {
        if (err) return res.status(500).send(err);
        res.json(employees);
    });
});

// Serve static files
app.use(express.static('public'));

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
