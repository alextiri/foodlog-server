const jwt = require("jsonwebtoken");

const verifyJWT = (token) => {
  let jwtSecretKey = process.env.JWT_SECRET_KEY;

  try {
    const verified = jwt.verify(token, jwtSecretKey);
    return verified.userId;
  } catch (error) {
    return null;
  }
};

module.exports = { verifyJWT };
