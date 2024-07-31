//import packages
const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { check, validationResult } = require('express-validator');

// Configure application
const app = express();

// Middleware
app.use(express.static(__dirname));
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

// Create connection
const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'Jeneviv254.',
    database: 'plp_expenses'
});

// Connect to database
connection.connect((err) => {
    if (err) {
        console.error('Error occurred while connecting to the DB server:' + err.stack);
        return;
    }
    console.log('DB server connected successfully');
});

// Define route to registration form
app.get('/register', (request, response) => {
    response.sendFile(path.join(__dirname, 'register.html'));
});

// Define a User object - registration
const User = {
    tableName: 'users',
    createUser: function (newUser) {
        return new Promise((resolve, reject) => {
            db.query('INSERT INTO ' + this.tableName + ' SET ?', newUser, (error, results) => {
                if (error) reject(error);
                resolve(results);
            });
        });
    },
    getUserByEmail: function (email) {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM ' + this.tableName + ' WHERE email = ?', [email], (error, results) => {
                if (error) reject(error);
                resolve(results);
            });
        });
    },
    getUserByUsername: function (username) {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM ' + this.tableName + ' WHERE username = ?', [username], (error, results) => {
                if (error) reject(error);
                resolve(results);
            });
        });
    },
};

// Define registration route and logic
app.post('/register', [
    check('email').isEmail().withMessage('Provide valid email address.'),
    check('username').isAlphanumeric().withMessage('Invalid username. Provide alphanumeric values.'),
    check('email').custom(async (value) => {
        const exist = await User.getUserByEmail(value);
        if (exist.length > 0) {
            throw new Error('Email already exists');
        }
    }),
    check('username').custom(async (value) => {
        const exist = await User.getUserByUsername(value);
        if (exist.length > 0) {
            throw new Error('Username already in use.');
        }
    })
], async (request, response) => {
    // Check for validation errors
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        return response.status(400).json({ errors: errors.array() });
    }

    // Hashing password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(request.body.password, saltRounds);

    // Define a new user object
    const newUser = {
        full_name: request.body.full_name,
        email: request.body.email,
        username: request.body.username,
        password: hashedPassword
    };

    // Save new user in db
    try {
        await User.createUser(newUser);
        console.log('New user record saved!');
        response.status(201).send('Registration successful');
    } catch (error) {
        console.error('An error occurred while saving the record: ' + error.message);
        response.status(500).json({ error: error.message });
    }
});
//handle the login logic - authentication
 app.post('/api/user/login', (request, response) => {
     const { username, password } = request.body;

     connection.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
         if(err) throw err;
         if(results.length === 0){
             response.status(401).send('Invalid username or password.');
         } else {
             const user = results[0];
             //compare passwords
             bcrypt.compare(password, user.password, (err, isMatch) => {
                 if(err) throw err;
                 if(isMatch){
                     //storing user data to the session variable
                     request.session.user = user;
                     response.status(200).json({ message: 'Login successful' });
                 } else {
                     response.status(401).send('Invalid username or password.');
                 }
             });
         }
     });
 });

 //handle authorization
 const userAuthenticated = (request, response, next) => {
     if(request.session.user){
         next();
     } else {
         response.redirect('/login');
     }
 }

 //secure route
 app.get('/dashboard', userAuthenticated, (request, response) => {
     response.status(200).json({ message: 'You are viewing a secured route.'});
 });

 //destroy session
 app.get('/logout', (request, response) => {
     request.session.destroy();
 });


app.listen(5300, () => {
    console.log('Server is running on port 5300');
});
