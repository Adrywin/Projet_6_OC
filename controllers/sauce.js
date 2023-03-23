const { json } = require("stream/consumers");
const Sauce = require("../models/sauce");
const fs = require("fs");

// Create sauce
exports.createSauce = (req, res, next) => {
  const sauceBody = JSON.parse(req.body.sauce);
  delete sauceBody._id;
  const sauce = new Sauce({
    ...sauceBody,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: [],
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });
  console.log(req.file);
  sauce
    .save()
    .then(() => res.status(201).json({ message: "Sauce enregistrée !" }))
    .catch((error) => res.status(400).json({ error }));
};

// get TOUTES sauces
exports.getSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => {
      return res.status(200).json(sauces);
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

// get 1 sauce
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({
    _id: req.params.id,
  })
    .then((sauce) => {
      res.status(200).json(sauce);
    })
    .catch((error) => {
      res.status(404).json({
        error: error,
      });
    });
};

//DeleteSauce
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id }).then((sauce) => {
    // pas bon user
    if (sauce.userId != req.auth.userId) {
      res.status(401).json({ message: "Non autorisé" });
    }
    //bon user
    else {
      const filename = sauce.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => {
            res.status(200).json({
              message: "Deleted!",
            });
          })
          .catch((error) => {
            res.status(400).json({
              error: error,
            });
          });
      });
    }
  });

  /*Sauce.deleteOne({ _id: req.params.id })
    .then(() => {
      res.status(200).json({
        message: "Deleted!",
      });
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });*/
};

//Modifier la sauce
exports.modifySauce = (req, res, next) => {
  const sauceBody = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body }; // ??????????????

  //("Seul le propriaitaire peut modifier sa sauce") Suppression du userId pour raison de sécurité (pour éviter que qq créer un objet à son nom, puis le modifie pour l'assigner à quelqu'un d'autre)
  delete sauceBody._userId;
  Sauce.findOne({ _id: req.params.id }).then((sauce) => {
    // pas bon user
    if (sauce.userId != req.auth.userId) {
      res.status(401).json({ message: "Non autorisé" });
    }
    //bon user
    else {
      if (req.file) {
        //si ya un req.file alors on enlève l'ancienne image
        const filename = sauce.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Sauce.updateOne(
            { _id: req.params.id },
            { ...sauceBody, _id: req.params.id }
          )
            .then(() => res.status(200).json({ message: "Sauce modifié !" }))
            .catch(() => res.status(400).json({ error }));
        });
      } else {
        // sinon on injecte juste le nouveau sauceBody
        Sauce.updateOne(
          { _id: req.params.id },
          { ...sauceBody, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: "Sauce modifié !" }))
          .catch(() => res.status(400).json({ error }));
      }
    }
  });
};

// Like & Dislike
exports.likeDislikeSauce = (req, res, next) => {
  // Sauce.findOne({ _id: req.params.id }).then((sauce) => {
  //   sauce.likes = +1
  //   sauce.save()
  // })
  // 1 => l'user like
  if (req.body.like === 1) {
    Sauce.updateOne(
      { _id: req.params.id },
      {
        $inc: { likes: +1 },
        $push: { usersLiked: req.body.userId },
      }
    )
      .then(() => res.status(200).json({ message: "Liked !" }))
      .catch((error) => res.status(400).json({ error }));
  }
  // 0 => l'user annule le like/dislike
  else if (req.body.like === 0) {
    Sauce.findOne({ _id: req.params.id }).then((sauce) => {
      if (sauce.usersLiked.includes(req.body.userId)) {
        Sauce.updateOne(
          { _id: req.params.id },
          { $pull: { usersLiked: req.body.userId }, $inc: { likes: -1 } }
        )
          .then(() => res.status(200).json({ message: "like removed !" }))
          .catch((error) => res.status(400).json({ error }));
      } else if (sauce.usersDisliked.includes(req.body.userId)) {
        Sauce.updateOne(
          { _id: req.params.id },
          { $pull: { usersDisliked: req.body.userId }, $inc: { dislikes: -1 } }
        )
        .then(() => res.status(200).json({ message: "dislike removed !"}))
        .catch((error) => res.status(400).json({ error }));
      }
    })
    .catch((error) => res.status(400).json({ error }))
  }
  // -1 => l'user dislike
  else if (req.body.like === -1) {
    Sauce.updateOne(
      { _id: req.params.id },
      {
        $inc: { dislikes: +1 },
        $push: { usersDisliked: req.body.userId },
      }
    )
      .then(() => res.status(200).json({ message: "Disliked !" }))
      .catch((error) => res.status(400).json({ error }));
  }
};
