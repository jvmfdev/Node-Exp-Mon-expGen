const express = require("express");
const Favorite = require("../models/favorites");
const Campsite = require("../models/campsite");
const authenticate = require("../authenticate");
const cors = require("./cors");
const { db } = require("../models/favorites");

const favoriteRouter = express.Router();

favoriteRouter
  .route("/")

  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))

  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({ user: req.user._id })
      .populate("user")
      .populate("campsite")
      .then((favorites) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(favorites);
      })
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .then((favorite) => {
        if (favorite) {
          req.body.forEach((campsiteId) => {
            Campsite.exists({ _id: campsiteId }, (err, result) => {
              if (result === true) {
                if (favorite.campsite.includes(campsiteId._id) === false) {
                  console.log(`New favorite added: Campsite ${campsiteId._id}`);
                  favorite.campsite.push(campsiteId._id);
                } else {
                  console.log(
                    `Campsite ${campsiteId._id} is already a favorite`
                  );
                }
              } else {
                console.log(`Campsite ${campsiteId._id} does not exist`);
              }
            });
          });
          favorite.save().then((favorite) => {
            favorite.save();
            console.log("Favorites document updated");
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(favorite);
          });
        } else {
          Favorite.create({ user: req.user._id })
            .then((favorite) => {
              req.body.forEach((campsiteId) => {
                Campsite.exists({ _id: campsiteId }, (err, result) => {
                  if (result === true) {
                    if (favorite.campsite.includes(campsiteId._id) === false) {
                      console.log(
                        `New favorite added: Campsite ${campsiteId._id}`
                      );
                      favorite.campsite.push(campsiteId._id);
                    } else {
                      console.log(
                        `Campsite ${campsiteId._id} is already a favorite`
                      );
                    }
                  } else {
                    console.log(`Campsite ${campsiteId._id} does not exist`);
                  }
                });
              });
              favorite.save().then((favorite) => {
                favorite.save();
                console.log("Favorites document updated");
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorite);
              });
            })
            .catch((err) => next(err));
        }
      })
      .catch((err) => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /favorites`);
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete({ user: req.user._id })
      .then((response) => {
        if (response) {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(response);
        } else {
          res.end(`You do not have any favorites to delete`);
        }
      })
      .catch((err) => next(err));
  });

favoriteRouter
  .route("/:campsiteId")

  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))

  .get(cors.cors, (req, res, next) => {
    res.statusCode = 403;
    res.end(
      `GET operation not supported on /favorites/${req.params.favoriteId}`
    );
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Campsite.exists({ _id: req.params.campsiteId }, (err, result) => {
      if (result === true) {
        Favorite.findOne({ user: req.user._id })
          .then((favorite) => {
            if (favorite) {
              if (favorite.campsite.includes(req.params.campsiteId) === false) {
                if (
                  db
                    .collection("campsites")
                    .findOne({ _id: req.params.campsiteId }) === false
                ) {
                  err = new Error(
                    `Campsite ${req.params.campsiteId} does not exist`
                  );
                  res.statusCode = 404;
                  return next(err);
                } else {
                  console.log(
                    `Campsite ${req.params.campsiteId} added to favorites`
                  );
                  favorite.campsite.push(req.params.campsiteId);
                  favorite.save().then((favorite) => {
                    console.log("Favorites document updated");
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(favorite);
                  });
                }
              } else {
                err = new Error(
                  `Campsite ${req.params.campsiteId} is already a favorite`
                );
                res.statusCode = 404;
                return next(err);
              }
            } else {
              Favorite.create({ user: req.user._id })
                .then((favorite) => {
                  favorite.campsite = req.params.campsiteId;
                  favorite.save().then((favorite) => {
                    console.log(
                      `Favorites document created and campsite ${req.params.campsiteId} added to favorites`
                    );
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(favorite);
                  });
                })
                .catch((err) => next(err));
            }
          })
          .catch((err) => next(err));
      } else {
        err = new Error(`Campsite ${req.params.campsiteId} does not exist`);
        res.statusCode = 404;
        return next(err);
      }
    });
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(
      `PUT operation not supported on /favorites/${req.params.favoriteId}`
    );
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .then((favorite) => {
        if (favorite) {
          if (favorite.campsite.includes(req.params.campsiteId) === true) {
            const indexOf = favorite.campsite.indexOf(req.params.campsiteId);
            favorite.campsite.splice(indexOf, 1);
            favorite.save().then((favorite) => {
              console.log(
                `Campsite ${req.params.campsiteId} removed from favorites`
              );
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(favorite);
            });
          } else {
            err = new Error(
              `Campsite ${req.params.campsiteId} is not a favorite`
            );
            res.statusCode = 404;
            return next(err);
          }
        } else {
          Favorite.create({ user: req.user._id })
            .then((favorite) => {
              favorite.campsite = req.params.campsiteId;
              favorite.save().then((favorite) => {
                console.log(
                  `Favorites document created and campsite ${req.params.campsiteId} added to favorites`
                );
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorite);
              });
            })
            .catch((err) => next(err));
        }
      })
      .catch((err) => next(err));
  });

module.exports = favoriteRouter;
