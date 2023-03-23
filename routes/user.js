const express = require("express");
const router = express.Router();
const userCtrl = require("../controllers/user");


router.post("/signup", userCtrl.signup); //create user
router.post("/login", userCtrl.login); //login user
module.exports = router;
