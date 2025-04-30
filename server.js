const express = require("express");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { Sequelize, DataTypes } = require("sequelize");
const bodyparser = require("body-parser");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const models = require("./models");
const app = express();

app.use(cors());
app.use(bodyparser.json());

dotenv.config();

let PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is up and running on ${PORT} ...`);
});

const sequelize = new Sequelize("postgres:localhost/foodlog");
(async () => {
  await sequelize.authenticate();
  console.log("Connection has been established successfully.");
})();

app.post("/signup", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const salt = await bcrypt.genSalt(saltRounds);
  const hash = await bcrypt.hash(password, salt);
  const newUser = await models.User.create({ email: email, password: hash });
  res.json(newUser);
});

app.post("/signin", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = await models.User.findOne({ where: { email: email } });

  if (user === null) {
    return res.status(404).json({ message: "Not found" });
  }
  const userCheck = await bcrypt.compare(password, user.password);
  if (userCheck === false) {
    return res.status(404).json({ message: "Password not found" });
  }

  let jwtSecretKey = process.env.JWT_SECRET_KEY;
  let data = {
    time: Date(),
    userId: user.id,
  };
  const token = jwt.sign(data, jwtSecretKey);
  res.json(token);
});

// app.get("/signin", (req, res) => {
//   let tokenHeaderKey = process.env.TOKEN_HEADER_KEY;
//   let jwtSecretKey = process.env.JWT_SECRET_KEY;
//   try {
//     const token = req.header(tokenHeaderKey);

//     const verified = jwt.verify(token, jwtSecretKey);
//     if (verified) {
//       return res.json("Successfully Verified");
//     } else {
//       return res.status(401).send(error);
//     }
//   } catch (error) {
//     return res.status(401).send(error);
//   }
// });

app.get("/user", (req, res) => {
  res.json("This is your user information");
});
