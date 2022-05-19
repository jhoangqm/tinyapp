const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const {
  generateRandomString,
  urlsForUser,
  emailExist,
  userIDEmail,
} = require('./helpers');

app.set('view engine', 'ejs');
// middleware
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: 'session',
    keys: ['monojhqm'],
    maxAge: 24 * 60 * 60 * 1000,
  })
);

/* --- Database --- */
const urlDatabase = {};
const userDatabase = {};

app.get('/', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

/* GET request with the rendered HTML of urls_index.ejs file. */
app.get('/urls', (req, res) => {
  let templateVars = {
    urls: urlsForUser(req.session.user_id, urlDatabase),
    user: userDatabase[req.session.user_id],
  };
  res.render('urls_index', templateVars);
});

/* GET request with the rendered HTML of urls_index.ejs file. 
if  the user is logged in, it will respond with the rendered HTML of urls_new.ejs 
otherwise if the user is not logged, redirects to 'login'*/
app.get('/urls/new', (req, res) => {
  let templateVars = {
    user: userDatabase[req.session.user_id],
  };
  if (!req.session.user_id) {
    res.redirect('/login');
  } else {
    res.render('urls_new', templateVars);
  }
});

/* GET request with the rendered HTML of urls_show.ejs file with the data specific to :shortURL parameter */
app.get('/urls/:shortURL', (req, res) => {
  let templateVars = {
    user: userDatabase[req.session.user_id],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    urlUserID: urlDatabase[req.params.shortURL].userID,
  };
  console.log(templateVars);
  res.render('urls_show', templateVars);
});

/* GET request with the corresponding long URL, from the urlDatabase */
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (longURL === undefined) {
    res.status(302);
  } else {
    res.redirect(longURL);
  }
});

/* GET request with rendered HTML of urls_registration */
app.get('/register', (req, res) => {
  let templateVars = {
    user: userDatabase[req.session.user_id],
  };
  res.render('urls_registration', templateVars);
});

/* GET request with rendered HTML page of urls_login*/
app.get('/login', (req, res) => {
  let templateVars = {
    user: userDatabase[req.session.user_id],
  };
  res.render('urls_login', templateVars);
});

/* POST request with a redirect to 'urls/${shortURL}', using the shortURL that was generated by the request */
app.post('/urls', (req, res) => {
  if (!userDatabase[req.session.user_id]) {
    res.status(403).send('Please log in first');
  }
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
  };
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

/* POST request by deleting :shortURL in database, redirects to main '/urls' page */
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.user_id;
  const userURLS = urlsForUser(userID, urlDatabase);
  if (Object.keys(userURLS).includes(shortURL)) {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  }
  res.status(401);
});

/* POST request by updating an existing short URL in the database, redirects to main '/urls page */
app.post('/urls/:id', (req, res) => {
  const shortURL = req.params.id;
  const userID = req.session.user_id;
  const userURLS = urlsForUser(userID, urlDatabase);
  if (Object.keys(userURLS).includes(shortURL)) {
    urlDatabase[shortURL].longURL = req.body.newURL;
    res.redirect('/urls');
  }
  res.status(401);
});

/* POST request by making a user input their username in the database which redirects to the main page */
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!emailExist(email, userDatabase)) {
    res.status(403).send('Invalid account, please try again');
  } else {
    let userID = userIDEmail(email, userDatabase);
    // bcrypt compareSync function will compare both passwords
    if (!bcrypt.compareSync(password, userDatabase[userID].password)) {
      res
        .status(403)
        .send(
          'The password you entered does not match with the associated email address'
        );
    } else {
      req.session.user_id = userID;
      res.redirect('/urls');
    }
  }
});

/* POST request by making user input an email and password and generates a unique userID as a cookie*/
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    res.status(400).send('Incorrect email and password, please try again');
  } else if (emailExist(email, userDatabase)) {
    res
      .status(400)
      .send('An account already exists with the email address provided');
  }
  const newUserID = generateRandomString();
  userDatabase[newUserID] = {
    id: newUserID,
    email: email,
    // this bcrypt will hash the password that is submitted via req.body.password
    password: bcrypt.hashSync(password, 10),
  };
  req.session.user_id = newUserID;
  console.log(userDatabase);
  res.redirect('/urls');
});

/* POST request by making the user click the logout button which will clear the cookie and make the user logout. Redirects to main page */
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}!`);
});
