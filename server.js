const express = require("express");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { Sequelize, DataTypes, where } = require("sequelize");
const bodyparser = require("body-parser");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const models = require("./models");
const app = express();
const verify = require("./utils/jwt");
const pagination = require("./utils/pagination");

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
    expiresAt: Date.now() + 8 * 60 * 60 * 1000,
    userId: user.id,
  };
  const token = jwt.sign(data, jwtSecretKey);
  res.json(token);
});

app.post("/foodentry", async (req, res) => {
  const name = req.body.name;
  const weight = req.body.weight;
  const calories = req.body.calories;
  const proteins = req.body.proteins;
  const fats = req.body.fats;
  const carbs = req.body.carbs;
  const timestamp = req.body.timestamp ?? Date.now();
  let tokenHeaderKey = process.env.TOKEN_HEADER_KEY;
  const userId = verify.verifyJWT(req.header(tokenHeaderKey));
  const newFoodEntry = await models.FoodEntry.create({
    userId: userId,
    name: name,
    weight: weight,
    calories: calories,
    proteins: proteins,
    fats: fats,
    carbs: carbs,
    timestamp: timestamp,
  });
  res.json(newFoodEntry);
});

app.delete("/foodentry/:id", async (req, res) => {
  const id = req.params.id;
  let tokenHeaderKey = process.env.TOKEN_HEADER_KEY;
  const userId = verify.verifyJWT(req.header(tokenHeaderKey));

  if (userId === null) {
    return res.status(401).json({ message: "Not authorized" });
  }
  const deletedFoodEntry = await models.FoodEntry.findOne({
    where: { id: id },
  });

  if (userId !== deletedFoodEntry.userId) {
    return res.status(401).json({ message: "Not authorized" });
  }

  await models.FoodEntry.destroy({ where: { id: id } });

  res.json({ message: "Entry deleted" });
});

app.patch("/foodentry/:id", async (req, res) => {
  const id = req.params.id;
  const name = req.body.name;
  const weight = req.body.weight;
  const calories = req.body.calories;
  const proteins = req.body.proteins;
  const fats = req.body.fats;
  const carbs = req.body.carbs;
  const timestamp = req.body.timestamp ?? Date.now();
  let tokenHeaderKey = process.env.TOKEN_HEADER_KEY;
  const userId = verify.verifyJWT(req.header(tokenHeaderKey));

  if (userId === null) {
    return res.status(401).json({ message: "Not authorized" });
  }

  const updatedFoodEntry = await models.FoodEntry.findOne({
    where: { id: id },
  });

  if (userId !== updatedFoodEntry.userId) {
    return res.status(401).json({ message: "Not authorized" });
  }

  await models.FoodEntry.update(
    {
      name: name,
      weight: weight,
      calories: calories,
      proteins: proteins,
      fats: fats,
      carbs: carbs,
      timestamp: timestamp,
    },
    { where: { id: id } },
  );
  res.json({ message: "Entry updated" });
});

app.get("/foodentry/:id", async (req, res) => {
  const id = req.params["id"];
  let tokenHeaderKey = process.env.TOKEN_HEADER_KEY;
  const userId = verify.verifyJWT(req.header(tokenHeaderKey));

  if (userId === null) {
    return res.status(401).json({ message: "Not authorized" });
  }

  const foodEntry = await models.FoodEntry.findOne({ where: { id: id } });

  if (userId !== foodEntry.userId) {
    return res.status(401).json({ message: "Not authorized" });
  }

  res.json(foodEntry);
});

app.get("/foodentries", async (req, res) => {
  let tokenHeaderKey = process.env.TOKEN_HEADER_KEY;
  const pageSize = req.query.pageSize;
  const pageOffset = req.query.pageOffset;
  const userId = verify.verifyJWT(req.header(tokenHeaderKey));

  if (userId === null) {
    return res.status(401).json({ message: "Not authorized" });
  }

  const validation = pagination.parsePagination(pageSize, pageOffset);
  if (typeof validation === "string") {
    return res.status(401).json({ message: validation });
  }

  const foodEntries = await models.FoodEntry.findAll({
    where: { userId: userId },
    limit: validation.limit,
    offset: validation.offset,
  });

  res.json(foodEntries);
});
