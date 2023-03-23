const express = require("express");
const mongoose = require("mongoose");
const routesUser = require('./routes/user');
const routesSauce = require('./routes/sauce');
const path = require("path");
const app = express();
app.use(express.json());
require('dotenv').config();

mongoose
  .connect(
    process.env.DATABASE_ACCESS,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

// =================== CORS ===================
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});
// =================== CORS ===================

app.use("/images", express.static(path.join(__dirname, "images")));
app.use('/api/auth', routesUser);
app.use('/api/sauces', routesSauce);


module.exports = app;
