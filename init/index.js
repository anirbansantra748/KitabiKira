const mongoose = require("mongoose")
const data = require("./data")
const store = require("../models/bookSchema")
const mongo_url = "mongodb://127.0.0.1:27017/BOOKSTORE";

main()
  .then(() => {
    console.log("mongoose started");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(mongo_url);
}

const initDB = async () => {
  await store.deleteMany({});
  data.data = data.data.map((obj) => ({
    ...obj,
    owner: "65ddbb23342f3555b1c43b90",
  }));
  await store.insertMany(data.data);
  console.log("data was initialized");
};


initDB();