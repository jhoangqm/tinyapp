const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');
const res = require('express/lib/response');
const cookieParser = require('cookie-parser');

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

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

/* Keeps track of all LONG URLs INPUT and their created short URLS. */
const urlDatabase = {
  b2xVn2: 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
};

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

/* Responds to '/urls' GET request with the rendered HTML of urls_index.ejs file. */
app.get('/urls', (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies['username'],
  };
  res.render('urls_index', templateVars);
});

/* Responds to '/urls' GET request with the rendered HTML of urls_index.ejs file. */
app.get('/urls/new', (req, res) => {
  let templateVars = {
    username: req.cookies['username'],
  };
  res.render('urls_new', templateVars);
});

/* Responds to '/urls/:shortURL' GET request with the rendered HTML of urls_show.ejs file with the data specific to :shortURL parameter */
app.get('/urls/:shortURL', (req, res) => {
  let templateVars = {
    username: req.cookies['username'],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };
  res.render('urls_show', templateVars);
});

/* Responds to '/u/:shortURL' GET request with the corresponding long URL, from the urlDatabase */
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (longURL === undefined) {
    res.send(302);
  } else {
    res.redirect(longURL);
  }
});

/* Responds to '/urls' POST request with a redirect to 'urls/${shortURL}', using the shortURL that was generated by the request */
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
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

app.post('/login', (req, res) => {
  const username = req.body.username;
  res.cookie('username', `${username}`);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}!`);
});
