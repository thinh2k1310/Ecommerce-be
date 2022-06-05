require('dotenv').config();
const express = require('express');
const chalk = require('chalk');
const historyApiFallback = require('connect-history-api-fallback');
const compression = require('compression');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const passport = require('passport');
const session = require('express-session');

const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;
const mongoURI = process.env.MONGO_URI;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(session({secret : 'nhom6'}));
app.use(passport.initialize());
app.use(passport.session());
// Connect to MongoDB
mongoose
  .connect(mongoURI, { useNewUrlParser: true })
  .then(() =>
    console.log(`${chalk.green('✓')} ${chalk.blue('MongoDB Connected!')}`)
  )
  .catch(err => console.log(err));

  require('./config/passport')(passport);
  
  app.use('/api', routes);
  
// if development
if (process.env.NODE_ENV !== 'production') {
  app.use(
    historyApiFallback({
      verbose: false
    })
  );
  // app.use(express.static(path.resolve(__dirname, '../dist')));
} else {
  app.use(compression());
  // app.use(express.static(path.resolve(__dirname, '../dist')));
  // app.get('*', (req, res) => {
  //   res.sendFile(path.resolve(__dirname, '../dist/index.html'));
  // });
}

app.listen(PORT, () => {
  console.log(
    `${chalk.green('✓')} ${chalk.blue(
      `Listening on port ${PORT}. Visit http://localhost:${PORT}/ in your browser.`
    )}`
  );
});
