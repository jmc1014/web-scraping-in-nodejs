const mongoose = require("mongoose");

const listingsSchema = new mongoose.Schema({
  title: String,
  datePosted: Date,
  neighborhood: String,
  url: String,
  jobDescription: String,
  compensation: String,
});

const Listing = mongoose.model("Listing", listingsSchema);

module.exports = Listing;
