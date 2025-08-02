const express = require('express');
const app = express();
const path = require('path');
const logger = require('morgan');
const session = require('express-session');

const indexRouter = require('./routes/index');

// Logger & request body parsers
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Session middleware
app.use(session({
  secret: 'college-secret',   // secure secret in production
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 600000 }  // optional: 10 min session
}));

// ✅ Set view engine and views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ✅ Connect all routes
app.use('/', indexRouter);

// 🚫 404 fallback
app.use((req, res) => {
  res.status(404).send('Route not found');
});

// ✅ Start server
app.listen(3000, () => {
  console.log('✅ Server running on http://localhost:3000');
});
