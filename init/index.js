const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("Connected to db");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Listing.deleteMany({});

  const transformedData = initData.data.map((obj) => ({
    ...obj,
    owner: "6987f2fc98e464e704a225b1", // default owner
  }));

  await Listing.insertMany(transformedData);
  console.log("Database reinitialized successfully");

  mongoose.connection.close();
};

initDB();
