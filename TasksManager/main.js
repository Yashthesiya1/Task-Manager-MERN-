const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const { log, error } = require('console');
const fs = require('fs');
const { Server } = require('https');
const database = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'taskmanager'
});
database.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL successfully');
});

const publicpath = path.join(__dirname);
app.use(bodyParser.urlencoded({ extended: true }))
app.get('/index.html', (req, res) =>
    res.sendFile(path.join(publicpath, 'index.html')));
app.post('/submit', (req, res) => {
    console.log('Received POST request to /submit');
    const { task } = req.body;
    database.query('INSERT INTO task (name) VALUES(?)', [task], (err) => {
        if (err) {
            console.log('Err from user data', err);
        }
        else {
            console.log('Data Add in database ');
        }
        console.log('Submit values', { task });
        res.redirect('/index.html');
    });
});
app.get('/tasks', (req, res) => {
    database.query('SELECT * FROM task', (err, data) => {
        if (err) {
            console.error('Error in fetching data', err)
            res.status(500).send('Error Fetching data in serverside');
        }
        else {
            res.json(data);
        }

    })
})

app.get('/edituser/:id', (req, res) => {
    const taskId = req.params.id;
    // console.log(taskId);
    database.query('SELECT * FROM task WHERE id = ?', [taskId], (err, data) => {
        if (err) {
            console.error('Error in fetching data', err);
            return res.status(500).send('Error Fetching data in serverside');
        }

        if (!data) {
            return res.status(404).send('Task Not Found');
        }
        let recordid = 0;
        let recordname = '';
        // const task = data[0]; // Assuming you only expect one task with the given ID
        data.forEach(element => {
            recordid = element.id;
            recordname = element.name;
        });
        // console.log(disp);
        fs.readFile('editform.html', 'utf-8', (err, content) => {
            if (err) {
                console.error('Error reading editform.html:', err);
                return res.status(500).send('Error reading editform.html');
            }
            console.log(recordid);
            let updatedcontent = content.replace('<% task.id %>', recordid)
                .replace('<% task.name %>', recordname);

            // Send the updated form to the client
            res.send(updatedcontent);
        });
    });
});

app.post('/edituser', (req, res) => {
    const { id, task } = req.body;
    console.log(req.body);
    console.log(id);
    // console.log(id,task);
    database.query('UPDATE task SET name=? WHERE id=?', [task, id], function (err) {
        if (err) {
            console.error('Error updating user:', err);
            res.status(500).send('Server errorrrrrrrrrrrrrrrrrr');
            return;
        }
        else {
            console.log('Update Data ');
        }
        res.redirect('/index.html');
    })
})
app.get('/deleteuser/:id', (req, res) => {
    const taskId = req.params.id;
    database.query('DELETE FROM task WHERE id=?', [taskId], (err) => {
        if (err) {
            console.error('Error deleting task:', err);
            res.status(500).send('Error deleting task');
        } else {
            console.log('Task deleted successfully');
            // Redirect after the deletion operation
            res.redirect('/index.html');
        }
    });
});


app.listen(port, () => console.log(`Example app listening on port ${port}!`))