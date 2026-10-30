
const express = require('express');

const app = express();
const PORT = 3000;

app.use(express.json());

const users = [];


// 1. GLOBAL MIDDLEWARE - WORKING HOURS

function workingHours(req, res, next) {
    const currentHour = new Date().getHours();

    if (currentHour < 10 || currentHour >= 18) {
        return res.status(403).json({
            message: 'Server works only from 10:00 to 18:00'
        });
    }

    next();
}

app.use(workingHours);


// 2. MIDDLEWARE - VALIDATE USER

function validateUser(req, res, next) {
    const { name, email, age } = req.body;

    if (!name || !email || !age) {
        return res.status(400).json({
            message: 'All fields are required!'
        });
    }

    if (typeof name !== 'string' || typeof email !== 'string') {
        return res.status(400).json({
            message: 'Name and email must be strings!'
        });
    }

    if (typeof age !== 'number' || age <= 0) {
        return res.status(400).json({
            message: 'Age must be a positive number!'
        });
    }

    next();
}


// 3. MIDDLEWARE - REQUEST LOGGER

function requestLogger(req, res, next) {
    const startTime = Date.now();

    const device = req.headers['user-agent'] || 'Unknown device';

    res.on('finish', () => {
        console.log({
            method: req.method,
            responseTime: `${Date.now() - startTime} ms`,
            device: device
        });
    });

    next();
}


// CREATE USER

app.post('/users', validateUser, (req, res) => {
    const { name, email, age } = req.body;

    const newUser = {
        id: users.length + 1,
        name,
        email,
        age
    };

    users.push(newUser);

    res.status(201).json({
        message: 'User created successfully!',
        user: newUser
    });
});


// GET ALL USERS

app.get('/users', (req, res) => {
    res.json(users);
});


// GET USER BY ID

app.get('/users/:id', (req, res) => {
    const id = Number(req.params.id);

    const user = users.find(user => user.id === id);

    if (!user) {
        return res.status(404).json({
            message: 'User not found!'
        });
    }

    res.json(user);
});


// DELETE USER (ADDITIONAL FEATURE)

app.delete('/users/:id', (req, res) => {
    const id = Number(req.params.id);

    const userIndex = users.findIndex(user => user.id === id);

    if (userIndex === -1) {
        return res.status(404).json({
            message: 'User not found!'
        });
    }

    users.splice(userIndex, 1);

    res.json({
        message: 'User deleted successfully!'
    });
});


// PRODUCTS ENDPOINT WITH LOGGER

app.get('/products', requestLogger, (req, res) => {
    res.json({
        products: [
            { id: 1, name: 'Laptop', price: 1500 },
            { id: 2, name: 'Phone', price: 900 }
        ]
    });
});


// START SERVER

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
