const express = require('express');
const path = require('path');
const mysql = require('mysql');

const app = express();
const PORT = process.env.PORT || 3000;

// MySQL database connection configuration
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'website_user',
    password: 'Surabaya!123',
    database: 'crossword_db'
});

// Connect to MySQL
connection.connect(err => {
    if (err) {
        console.error('Error connecting to database:', err.stack);
        return;
    }
    console.log('Connected to database as id', connection.threadId);
});

// Create the imported_crosswords table if it does not exist
const createTableQuery = `
    CREATE TABLE IF NOT EXISTS imported_crosswords (
    id INT AUTO_INCREMENT PRIMARY KEY,
    crosswordData TEXT,
    questions TEXT,
    answers TEXT,
    passage TEXT,
    generatedKey VARCHAR(255) UNIQUE
);
`;

const createTableQueryStudent = `
    CREATE TABLE IF NOT EXISTS crossword_leaderboard (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    is_done BOOLEAN NOT NULL DEFAULT FALSE,
    time_taken FLOAT DEFAULT 0.0,
    generatedKey VARCHAR(255),
    CONSTRAINT FK_generatedKey FOREIGN KEY (generatedKey)
        REFERENCES imported_crosswords(generatedKey)
);
`;
connection.query(createTableQuery, (error, results, fields) => {
    if (error) {
        console.error('Error creating table:', error);
        return;
    }
    console.log('Table created successfully or already exists.');
});

connection.query(createTableQueryStudent, (error, results, fields) => {
  if (error) {
      console.error('Error creating table:', error);
      return;
  }
  console.log('Table created successfully or already exists.');
});

// Middleware to parse URL-encoded bodies (from form submissions)
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the "css" and "js" directories
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/dist', express.static(path.join(__dirname, 'dist')));

// Serve the index.html file at the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/select_role.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'select_role.html'));
});

app.get('/user_input.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'user_input.html'));
});

app.get('/user_key_input.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'user_key_input.html'));
});

app.get('/display_question_answer.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'display_question_answer.html'));
});

app.get('/get_crosswords.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'get_crosswords.html'));
});

app.get('/leaderboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'leaderboard.html'));
});

// Route to handle POST requests for importing crossword data into MySQL
app.post('/display_question_answer', (req, res) => {
    const { crosswordData, questions, answers, passage, generatedKey } = req.body;

    console.log("Received crossword data:", crosswordData);
    console.log("Received questions:", questions);
    console.log("Received answers:", answers);
    console.log("Received passage:", passage);
    console.log("Received key:", generatedKey);

    const crosswordDataJson = JSON.stringify(crosswordData);
    const questionsJson = JSON.stringify(questions);
    const answersJson = JSON.stringify(answers);

    const dataToInsert = {
        crosswordData: crosswordDataJson,
        questions: questionsJson,
        answers: answersJson,
        passage: passage,
        generatedKey: generatedKey
    };

    console.log("Data to insert:", dataToInsert);

    connection.query('INSERT INTO imported_crosswords SET ?', dataToInsert, (error, results, fields) => {
        if (error) {
            console.error('Error inserting crossword data:', error);
            return res.status(500).json({ error: 'Failed to insert crossword data', mysqlError: error });
        }
        console.log('Inserted crossword data into MySQL successfully.');
        res.json({ message: 'Crossword data inserted into MySQL successfully' });
    });
});

app.get('/check-key/:key', (req, res) => {
  const key = req.params.key;

  // Query to check if key exists
  const sql = 'SELECT * FROM imported_crosswords WHERE generatedKey = ?';
  connection.query(sql, [key], (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      res.status(500).json({ error: 'Error querying database' });
      return;
    }

    if (results.length > 0) {
      // Key found, return data
      const crosswordData = results[0].crosswordData;
      const questions = results[0].questions;
      const answers = results[0].answers;
      const passage = results[0].passage;
      res.json({
        found: true,
        crosswordData: crosswordData,
        questions: questions,
        answers: answers,
        passage: passage
      });
    } else {
      // Key not found
      res.json({ found: false });
    }
  });
});

//make get request to get specific name
app.get('/check-name/:name/:key', (req, res) => {
  const name = req.params.name;
  const key = req.params.key;
  const sql = 'SELECT * FROM crossword_leaderboard WHERE name = ? AND generatedKey = ?';
  connection.query(sql, [name, key], (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      res.status(500).json({ error: 'Error querying database' });
      return;
    }

    if (results.length > 0) {
      const name = results[0].name;
      const key = results[0].key;
      const is_done = results[0].is_done;
      res.json({
        found: true,
        name: name,
        key: key,
        is_done: is_done
      });
    } else {
      // Name and/or key not found
      res.json({ found: false });
    }
  });
});


app.post('/save-name', (req, res) => {
  const { name, key } = req.body;

  // Log received data
  console.log('Received data:', { name, key });

  // Verify received data
  if (!name || !key) {
    console.error('Invalid data received');
    return res.status(400).json({ error: 'Invalid data received' });
  }

  // Save the name to the database
  const queryStoreName = 'INSERT INTO crossword_leaderboard (name, generatedKey) VALUES (?, ?)';
  connection.query(queryStoreName, [name, key], (err, results) => {
    if (err) {
      console.error('Error saving user name:', err);
      return res.status(500).json({ error: 'Failed to save user name', mysqlError: err });
    }

    res.json({ message: 'User name saved', id: results.insertId });
  });
});


app.get('/get-name/:name', (req, res) => {
  const name = req.params.name;

  const query = 'SELECT * FROM crossword_leaderboard WHERE name = ?';
  connection.query(query, [name], (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      res.status(500).json({ error: 'Error querying database' });
      return;
    }

    if (results.length > 0) {
      // Key found, return data
      const name = results[0].name;
      const key = results[0].key;
      res.json({
        found: true,
        name: name,
        key: key
      });
    } else {
      // Name not found
      res.json({ found: false });
    }
  });
});

app.get('/leaderboard/:key', (req, res) => {
  const key = req.params.key;

  // Query to check if key exists and order by time_taken with 0 time_taken at the bottom
  const sql = `
    SELECT * 
    FROM crossword_leaderboard 
    WHERE generatedKey = ? 
    ORDER BY CASE WHEN time_taken = 0 THEN 1 ELSE 0 END, time_taken;
  `;
  connection.query(sql, [key], (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      res.status(500).json({ error: 'Error querying database' });
      return;
    }

    if (results.length > 0) {
      const leaderboard = results.map(row => ({
        name: row.name,
        is_done: row.is_done,
        time_taken: row.time_taken
      }));
      res.json({
        found: true,
        leaderboard: leaderboard
      });
    } else {
      // Key not found
      res.json({ found: false });
    }
  });
});



app.post("/update-is-done", (req, res) => {
  const { key, name, time } = req.body;
  
  console.log("Received key:", key);
  console.log("Received name:", name);
  console.log("Received time:", time);

  // Query to update is_done
  const sql =
    "UPDATE crossword_leaderboard SET is_done = 1, time_taken = ? WHERE generatedKey = ? AND name = ?";
  connection.query(sql, [time, key, name], (err, result) => {
    if (err) {
      console.error("Error updating is_done:", err);
      res.status(500).json({ error: "Error updating is_done" });
      return;
    }

    res.json({ success: true });
  });
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
