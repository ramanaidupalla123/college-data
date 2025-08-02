const express = require('express');
const router = express.Router();
const connection = require('../db_config');

// Simple credentials
const validCollege = 'vit';
const validPassword = '123';

// Render login page
router.get('/login', (req, res) => {
  res.render('login');
});

// Handle login form submission
router.post('/login', (req, res) => {
  const { college, password } = req.body;

  if (college === validCollege && password === validPassword) {
    req.session.loggedIn = true;
    res.redirect('/show');
  } else {
    res.send('❌ Invalid college name or password');
  }
});

// 🔐 Middleware to protect routes
function isAuthenticated(req, res, next) {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect('/login');
  }
}

// Show all students (READ)
router.get('/show', isAuthenticated, (req, res) => {
  connection.query('SELECT * FROM student', (err, results) => {
    if (err) return res.send('Error fetching students');
    res.render('students', { students: results });
  });
});

// Show Add Form (CREATE)
router.get('/add', isAuthenticated, (req, res) => {
  res.render('add');
});

// Handle Add Form Submission
router.post('/insert', isAuthenticated, (req, res) => {
  const { name, branch } = req.body;
  const query = 'INSERT INTO student (username, branch) VALUES (?, ?)';
  connection.query(query, [name, branch], (err, result) => {
    if (err) {
      console.error('❌ Insert Error:', err);
      return res.send('Insert failed');
    }
    res.redirect('/show');
  });
});

// Show Edit Form (for UPDATE)
router.get('/edit/:id', isAuthenticated, (req, res) => {
  const { id } = req.params;
  connection.query('SELECT * FROM student WHERE id = ?', [id], (err, results) => {
    if (err || results.length === 0) return res.send('Student not found');
    res.render('edit', { student: results[0] });
  });
});

// Handle Update Submission
router.post('/update/:id', isAuthenticated, (req, res) => {
  const { id } = req.params;
  const { name, branch } = req.body;
  const query = 'UPDATE student SET username = ?, branch = ? WHERE id = ?';
  connection.query(query, [name, branch, id], (err, result) => {
    if (err) {
      console.error('❌ Update Error:', err);
      return res.send('Update failed');
    }
    res.redirect('/show');
  });
});

// DELETE Student
router.get('/delete/:id', isAuthenticated, (req, res) => {
  const { id } = req.params;
  connection.query('DELETE FROM student WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('❌ Delete Error:', err);
      return res.send('Delete failed');
    }
    res.redirect('/show');
  });
});

// Logout route
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

module.exports = router;
