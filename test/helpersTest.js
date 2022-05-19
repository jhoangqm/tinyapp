const { assert } = require('chai');

const {
  generateRandomString,
  emailExist,
  userIDEmail,
  // urlsForUser,
} = require('../helpers.js');

const testUsers = {
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

describe('getUserByEmail', function () {
  it('should return a user with valid email', function () {
    const user = userIDEmail('user@example.com', testUsers);
    const expectedUserID = 'userRandomID';
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
