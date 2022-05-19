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

/* Object of userURLS that matches the userID in the urlDatabase*/
function urlsForUser(id, urlDatabase) {
  const userURLS = {};
  for (const URL in urlDatabase) {
    if (urlDatabase[URL].userID === id) {
      userURLS[URL] = urlDatabase[URL];
    }
  }
  return userURLS;
}

/* this function will verify if the email already exists in the userDatabase */
function emailExist(email, userDatabase) {
  for (const user in userDatabase) {
    if (userDatabase[user].email === email) {
      return userDatabase[user].id;
    }
  }
  return false;
}

module.exports = {
  generateRandomString,
  urlsForUser,
  emailExist,
};
