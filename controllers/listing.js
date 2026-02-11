const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

module.exports.index = async (req, res) => {
  const searchQuery = (req.query.q || "").trim();
  let allListing;

  if (searchQuery) {
    const safeQuery = escapeRegex(searchQuery);
    const queryRegex = new RegExp(safeQuery, "i");
    allListing = await Listing.find({
      $or: [
        { title: queryRegex },
        { description: queryRegex },
        { location: queryRegex },
        { country: queryRegex },
        { category: queryRegex },
      ],
    });
  } else {
    allListing = await Listing.find();
  }

  if (searchQuery && allListing.length === 0) {
    req.flash("error", "No listings match your search.");
  }

  res.render("listings/index.ejs", { allListing, searchQuery });
};

module.exports.filterByCategory = async (req, res) => {
  const { categoryName } = req.params;
  const allListing = await Listing.find({ category: categoryName });
  if(!allListing.length){
    req.flash("error", "No listing found for the selected category!");
    return res.redirect("/listings");
  }
  res.render("listings/index.ejs", { allListing });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested for does not Exist!");
    return res.redirect("/listings"); // ensure only one response is sent
  }
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res) => {
let response= await geocodingClient.forwardGeocode({
  query: req.body.listing.location,
  limit: 1,
})
  .send();

  if (req.body.listing.category) {
    req.body.listing.category = Array.isArray(req.body.listing.category)
      ? req.body.listing.category
      : [req.body.listing.category];
  }

  let url = req.file.path;
  let filename = req.file.filename;
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };
  newListing.geometry=response.body.features[0].geometry; 
  await newListing.save();
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not Exist!");
    return res.redirect("/listings"); // ensure only one response is sent
  }
  let originalImageUrl=listing.image.url;
  originalImageUrl=originalImageUrl.replace("/upload/","/upload/w_250,c_fit/")
  console.log("Original URL:", listing.image?.url);

  res.render("listings/edit.ejs", { listing,originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;

  if (req.body.listing.category) {
    req.body.listing.category = Array.isArray(req.body.listing.category)
      ? req.body.listing.category
      : [req.body.listing.category];
  }

  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if (typeof req.file != "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }

  req.flash("succeess", "Listing updated");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};
