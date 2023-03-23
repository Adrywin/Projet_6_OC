const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const user = require('../models/user');
require('dotenv').config();

exports.signup = (req, res, next) => {
    console.log(req.body);
    bcrypt.hash(req.body.password, 10)
    .then(hash => {
      const sign = new user({
        email: req.body.email,
        password: hash   
      });
      sign
        .save()
        .then(() => res.status(201).json({ message: "Compte créer ! " }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
  };
exports.login = (req, res, next) => {
  user.findOne({email: req.body.email})
  .then(user => {
    if (user === null) {
      res.status(401).json({message: 'Paire identifiant/mot de passe incorrecte'});
    } else {
      bcrypt.compare(req.body.password, user.password)
      .then(valid => {
        if (!valid) {
          console.log("NON VALIDE");
          res.status(401).json({message: 'Paire identifiant/mot de passe incorrecte'});
        } else {
          console.log("VALIDE");
          res.status(200).json({
            userId: user._id,
            token: jwt.sign(
              { userId : user._id},
              process.env.TOKEN_KEY, // secret key pour encodage du token
              { expiresIn: '24h' }
            )
          });
        }
      })
      .catch(error => res.status(500).json({ error }));
    }
  })
  .catch(error => {
    res.status(500).json({ error });
  })
};