const express = require("express");
const {
  createTopSearch,
  pastTopSearchedData,
  deleteTopSearch,
} = require("../controllers/topSearchController");

const router = express.Router();

router.post("/createTopSearch", createTopSearch);
router.get("/pastTopSearchedData", pastTopSearchedData);
router.delete("/deleteTopSearch/:id", deleteTopSearch);

module.exports = router;
