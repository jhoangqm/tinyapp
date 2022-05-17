const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');
const res = require('express/lib/response');
const cookieParser = require('cookie-parser');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

//Function that will generate a random string "unique" shortURL
// Found a nice one liner on the internet
// return Math.random().toString(36).replace(/[^a-z0-9]+/g, '').substring(0, 6);
function generateRandomString() {
  let randomString = '';
  const charSet =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const setLength = charSet.length;
  for (let i = 0; i <= 6; i++) {
    randomString += charSet.charAt(Math.floor(Math.random() * setLength));
  }
  return randomString;
}

/* this function will verify if the email already exists in the userDatabase */
function checkIfUserAlreadyExists(email) {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user].id;
    }
  }
  return false;
}

/* Keeps track of all LONG URLs INPUT and their created short URLS. */
const urlDatabase = {
  b2xVn2: { longURL: 'http://www.lighthouselabs.ca', userID: 'userRandomID' },
  '9sm5xK': { longURL: 'http://www.google.com', userID: 'userRandomID' },
};

/* Store and access the users in the app */
const users = {
  userRandomID: {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur',
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk',
  },
};

app.get('/', (req, res) => {
  res.redirect('/urls');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

/* Responds to '/urls' GET request with the rendered HTML of urls_index.ejs file. */
app.get('/urls', (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: users[req.cookies['user_id']],
  };
  res.render('urls_index', templateVars);
});

/* Responds to '/urls' GET request with the rendered HTML of urls_index.ejs file. 
if  the user is logged in, it will respond with the rendered HTML of urls_new.ejs 
otherwise if the user is not logged, redirects to 'login'*/
app.get('/urls/new', (req, res) => {
  let templateVars = {
    user: users[req.cookies['user_id']],
  };
  if (!req.cookies['user_id']) {
    res.redirect('/login');
  } else {
    res.render('urls_new', templateVars);
  }
});

/* Responds to '/urls/:shortURL' GET request with the rendered HTML of urls_show.ejs file with the data specific to :shortURL parameter */
app.get('/urls/:shortURL', (req, res) => {
  let templateVars = {
    user: users[req.cookies['user_id']],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
  };
  res.render('urls_show', templateVars);
});

/* Responds to '/u/:shortURL' GET request with the corresponding long URL, from the urlDatabase */
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (longURL === undefined) {
    res.send(302);
  } else {
    res.redirect(longURL);
  }
});

/* Responds to /register GET request with rendered HTML of urls_registration */
app.get('/register', (req, res) => {
  let templateVars = {
    user: users[req.cookies['user_id']],
  };
  res.render('urls_registration', templateVars);
});

/* Responds to /login GET request with rendered HTML page of urls_login*/
app.get('/login', (req, res) => {
  let templateVars = {
    user: users[req.cookies['user_id']],
  };
  res.render('urls_login', templateVars);
});

/* Responds to '/urls' POST request with a redirect to 'urls/${shortURL}', using the shortURL that was generated by the request */
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.cookies['user_id'],
  };
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

/* Responds to '/urls/:shortURL/delete' POST request by deleting :shortURL in database, redirects to main '/urls' page */
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

/* Responds to '/urls/:id' POST request by updating an existing short URL in the database, redirects to main '/urls page */
app.post('/urls/:id', (req, res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.newURL;
  res.redirect('/urls');
});

/* Responds to '/login' POST request by making a user input their username in the database which redirects to the main page */
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!checkIfUserAlreadyExists(email)) {
    res.send(403, 'Invalid account, please try again');
  } else {
    let userID = checkIfUserAlreadyExists(email);
    if (users[userID].password !== password) {
      res.send(
        403,
        'The password you entered does not match with the associated email address'
      );
    } else {
      res.cookie('user_id', userID);
      res.redirect('/urls');
    }
  }
});

/* Responds to '/register' POST request by making user input an email and password and generates a unique userID as a cookie*/
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    res.send(400, 'Incorrect email and password, please try again');
  } else if (checkIfUserAlreadyExists(email)) {
    res.send(400, 'An account already exists with the email address provided');
  }

  const newUserID = generateRandomString();
  users[newUserID] = {
    id: newUserID,
    email: email,
    password: password,
  };
  res.cookie('user_id', newUserID);
  console.log(users);
  res.redirect('/urls');
});
/* Responds to '/logout' POST request by making the user click the logout button which will clear the cookie and make the user logout. Redirects to main page */
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}!`);
});
