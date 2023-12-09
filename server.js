const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const Sqlite3 = require("sqlite3").verbose();

const app = express();

app.set('view engine', 'ejs'); // Set EJS as the view engine
app.set('views', path.join(__dirname, 'views')); // Assuming your views are in a 'views' directory

app.use(express.static(path.join(__dirname, 'mini_project_1')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Connecting to the database
console.log("[*] Connecting to the database");
const DbConn = new Sqlite3.Database("database.db", (error) => {
    if (error) {
        console.log("[!] Failed to connect to database");
    } else {
        console.log("[#] Connected to the database successfully");
        DbConn.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username VARCHAR(50), email VARCHAR(100), type VARCHAR(10), created_on DATE DEFAULT CURRENT_TIMESTAMP)", (err) => {
            if (err) {
                console.log("[!] Error creating table", err);
            } else {
                console.log("[#] 'users' table created successfully");
            }
        });
    }
});

// Serve index.html as the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'mini_project_1', 'index.html'));
});

// Handling form submission
app.post('/submit', (request, response) => {
    // Fetching the user sent details
    const { username, email, type } = request.body;

    // Inserting data into the 'users' table
    DbConn.run("INSERT INTO users (username, email, type) VALUES (?, ?, ?)", [username, email, type], (err) => {
        if (err) {
            return response.end("Failed to create the new mentor profile!")
        } else {
            return response.end("Created the new mentor profile successfully");
        }
    });
});

// Displaying data on the profile page
app.get('/profile', (req, res) => {
    // Fetching data from the 'users' table
    DbConn.all("SELECT * FROM users", (err, rows) => {
        if (err) {
            console.log("[!] Error fetching data:", err);
            res.status(500).send("Internal Server Error");
        } else {
            // Rendering the 'mentorprofiles.ejs' page with the fetched data
            res.render('mentorprofiles', { data: rows });
        }
    });
});

// Listening on the specified port
app.listen(3001, () => {
    const url = `http://localhost:3001`;
    console.log(`[#] Listening on port 3001}`);
    console.log(`[#] Access the application at: ${url}`);
});
