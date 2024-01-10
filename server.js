const express = require('express');
const multer = require('multer');
const storage = multer.memoryStorage(); // Use memory storage for simplicity; adjust as needed
const upload = multer({ storage: storage });
const bodyParser = require('body-parser');
const Sqlite3 = require("sqlite3").verbose();

// Creating the express.js app object
const app = express();

app.set('view engine', 'ejs'); // Set EJS as the view engine
app.use(express.static("static")); // Setting up the static directory for usage as serving JS, CSS, media file
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connecting to the database
console.log("[*] Connecting to the database");
const DbConn = new Sqlite3.Database("database.db", (error) => {
    if (error) {
        console.log("[!] Failed to connect to database");
    } else {
        console.log("[#] Connected to the database successfully");
        DbConn.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT,username VARCHAR(50), email VARCHAR(100), type VARCHAR(10), created_on DATE DEFAULT CURRENT_TIMESTAMP,profilePhoto BLOB)", (err) => {
            if (err) {
                console.log("[!] Error creating table", err);
            } else {
                console.log("[#] 'users' table created successfully");
            }
        });
    }
});

// Defining the HTTP GET endpoints
// Serve index.html as the main page
app.get('/', (request, response) => {
    response.render("index");
});
app.get("/about", (request, response) => {
    response.render("about");
});
app.get("/form", (request, response) => {
     response.render("form");
 });
app.get("/mentorship_oppur", (request, response) => {
    response.render("mentorship_oppur");
});
app.get('/profile', (req, res) => {
    // Fetching data from the 'users' table
    DbConn.all("SELECT * FROM users", (err, rows) => {
        if (err) {
            console.log("[!] Error fetching data:", err);
            res.status(500).send("Internal Server Error");
        } else {
            // Rendering the 'mentorprofiles.ejs' page with the fetched data
            
            res.render('mentorprofiles', { data : rows });
        }
    });
});
app.get("/resources", (request, response) => {
    response.render("resources");
});



// Handling form submission
app.post('/submit', upload.single('profilePhoto'), (request, response) => {
    // Fetching the user sent details
    const { username, email, type } = request.body;

    // Access the uploaded file from request.file
    const profilePhoto = request.file;

    // Inserting data into the 'users' table
    DbConn.run("INSERT INTO users (username, email, type, profilePhoto) VALUES (?, ?, ?, ?)", [username, email, type, profilePhoto ? profilePhoto.buffer : null], (err) => {
        if (err) {
            console.log(err);
            return response.end("Failed to create the new mentor profile!");
        } else {
            return response.end("Created the new mentor profile successfully");
        }
    });
});


// Listening on the specified port
app.listen(3001, () => {
    const url = `http://localhost:3001`;
    console.log(`[#] Listening on port 3001`);
    console.log(`[#] Access the application at: ${url}`);
});
