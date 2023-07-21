const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    default: 0,
  },
},{collection:'transaction'});

const User = mongoose.model("mongodbsiem", UserSchema);

module.exports = User;