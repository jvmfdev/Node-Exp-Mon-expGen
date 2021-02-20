const mongoose = require("mongoose");
const Schema = mongoose.Schema;

require("mongoose-currency").loadType(mongoose);

const favoritesSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    campsite: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Campsite",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Favorite = mongoose.model("Favorite", favoritesSchema);

module.exports = Favorite;
