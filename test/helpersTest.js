const { assert } = require('chai');

const {
  generateRandomString,
  emailExist,
  userIDEmail,
  urlsForUser,
} = require('../helpers.js');

const testUsers = {
  user1RandomID: {
    id: 'user1RandomID',
    email: 'user1@example.com',
    password: 'purple-monkey-dinosaur',
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk',
  },
};

const testUrlDatabase = {
  bfjqot: {
    longUrl: 'http://www.lighthouselabs.ca',
    userID: 'user1RandomID',
  },
  htlams: {
    longUrl: 'http://www.google.com',
    userID: 'user1RandomID',
  },
  asdrht: {
    longUrl: 'http://www.youtube.com',
    userID: 'user2RandomID',
  },
};

describe('userIDEmail', function () {
  it('should return a user with valid email', function () {
    const user = userIDEmail('user1@example.com', testUsers);
    const expectedUserID = 'user1RandomID';
    assert.equal(user, expectedUserID);
  });
  it('should return undefined when the user does not exist', function () {
    const user = userIDEmail('us@ple.com', testUsers);
    const expectedUserID = undefined;
    assert.equal(user, expectedUserID);
  });
});

describe('generateRandomString', function () {
  it('should return a random string with six characters', function () {
    const stringLength = generateRandomString().length;
    const expectedOutput = 6;
    assert.equal(stringLength, expectedOutput);
  });

  it('should not return similar string as their unique', function () {
    const firstString = generateRandomString();
    const secondString = generateRandomString();
    assert.notEqual(firstString, secondString);
  });
});

describe('emailExist', function () {
  it('should return true if email exists in the database', function () {
    const email = emailExist('user1@example.com', testUsers);
    const expectedOutput = true;
    assert.equal(email, expectedOutput);
  });
  it('should return false if the email does not exist in the database', function () {
    const email = emailExist('abc@abc.com', testUsers);
    const expectedOutput = false;
    assert.equal(email, expectedOutput);
  });
});

describe('urlsForUsers', function () {
  it('should return an object of urls that belongs to the specific userID', function () {
    const Urls = urlsForUser('user1RandomID', testUrlDatabase);
    const expectedOutput = {
      bfjqot: {
        longUrl: 'http://www.lighthouselabs.ca',
        userID: 'user1RandomID',
      },
      htlams: {
        longUrl: 'http://www.google.com',
        userID: 'user1RandomID',
      },
    };
    assert.deepEqual(Urls, expectedOutput);
  });
  it('should return an empty object if no urls is associated with the userID', function () {
    const Urls = urlsForUser('rofl', testUrlDatabase);
    const expectedOutput = {};
    assert.deepEqual(Urls, expectedOutput);
  });
});
