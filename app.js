const connection = require('./config/connectionconfig')

const express = require('express');
const cors = require('cors')


const app = express();

app.use(cors({
    origin: 'http://localhost:3000', // Allow only this origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
    credentials: true // Allow cookies and credentials
}));

app.use(express.json()); 

app.listen(4000, () => {
    console.log("server started");
});


app.use((req, res, next) => {
   // console.log('CORS Headers:', res.getHeaders());
    next();
});


app.get("/notes",(req,res)=>{
    const { title } = req.query;
    let query='';
    let params = [];
  if (title !== undefined) {
     query = `
         SELECT * FROM notesmanager
         WHERE title LIKE ? 
         ORDER BY id DESC;`;
         params.push(`%${title}%`);
         
  } 
  else{
     query = 'SELECT * FROM  notesmanager ORDER BY id DESC';
  }
    connection.query(query,params,(err, results) => {
        if (err) {
          res.status(500).send('Error fetching notes');
          return;
        }
        res.status(200).json( results );
      });
});

app.get("/notes/:id",(req,res)=>{
    const {id} = req.params;
    const query = "SELECT * FROM notesmanager WHERE id = ?";
    
    connection.query(query, [id], (err, result) => {
        if (err) {
            console.error("Error fetching note:", err);
            return res.status(500).send("Internal server error");
        }
        
        if (result.length === 0) {
            return res.status(404).send("Note not found");
        }
        res.status(200).json(result[0]); 
    });
})

app.post("/notes", (req, res) => {
    const { title, description, category } = req.body;
     if (!title || !description) {
        return res.status(400).send("Title and description are required.");
    }

    const noteCategory = category || "Others";

    const query = `
        INSERT INTO notesmanager (title, description, category) 
        VALUES (?, ?, ?)
    `;
    connection.query(query, [title, description, noteCategory], (err, results) => {
        if (err) {
            console.error("Error executing query:", err);
            res.status(500).send("Error creating note.");
            return;
        }
        res.status(201).json({ message: "Note created successfully", noteId: results.insertId });
    });
});


app.put("/notes/:id", (req, res) => {
    const { id } = req.params;
    const { title, description, category } = req.body;

    if (!title || !description) {
        return res.status(400).send("Title and description are required.");
    }

    console.log("from react node put request","------------==============")
    const query = `
        UPDATE notesmanager 
        SET title = ?, description = ?, category = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
    `;
    const values = [title, description, category || "Others", id];

    connection.query(query, values, (err, result) => {
        if (err) {
            console.error("Error updating note:", err);
            return res.status(500).send("Error updating note.");
        }

        if (result.affectedRows === 0) {
            return res.status(404).send("Note not found.");
        }

        res.status(200).send("Note updated successfully.");
    });
});

app.put("/notes/toggle/:id", (req, res) => {
    const { id } = req.params;
  
    // Step 1: Get the current `is_checked` value of the note
    const query = "SELECT is_checked FROM notesmanager WHERE id = ?";
    connection.query(query, [id], (err, result) => {
      if (err) {
        console.error("Error fetching note:", err);
        return res.status(500).send("Error fetching note.");
      }
  
      if (result.length === 0) {
        return res.status(404).send("Note not found.");
      }
  
      // Step 2: Toggle the `is_checked` value
      const currentCheckedStatus = result[0].is_checked;
      const newCheckedStatus = currentCheckedStatus === 1 ? 0 : 1; // Toggle the value (1 -> 0 or 0 -> 1)
  
      // Step 3: Update the `is_checked` value in the database
      const updateQuery = "UPDATE notesmanager SET is_checked = ? WHERE id = ?";
      connection.query(updateQuery, [newCheckedStatus, id], (err, updateResult) => {
        if (err) {
          console.error("Error updating note:", err);
          return res.status(500).send("Error updating note.");
        }
  
        if (updateResult.affectedRows === 0) {
          return res.status(404).send("Note not found.");
        }
  
        // Step 4: Fetch the updated note to send back the full object (including new `is_checked` value)
        const getUpdatedNoteQuery = "SELECT * FROM notesmanager WHERE id = ?";
        connection.query(getUpdatedNoteQuery, [id], (err, updatedResult) => {
          if (err) {
            console.error("Error fetching updated note:", err);
            return res.status(500).send("Error fetching updated note.");
          }
  
          // Step 5: Send the updated note as the response
          res.status(200).json(updatedResult[0]); // Return the updated note object
        });
      });
    });
  });



app.delete("/notes/:id", (req, res) => {
    const { id } = req.params;
    const query = "DELETE FROM notesmanager WHERE id = ?";
    
    connection.query(query, [id], (err, result) => {
        if (err) {
            console.error("Error deleting note:", err);
            return res.status(500).send("Error deleting note.");
        }

        if (result.affectedRows === 0) {
            return res.status(404).send("Note not found.");
        }

        res.status(200).send("Note deleted successfully.");
    });
});