// src/app.js
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

// Test Route
app.get("/", (req, res) => {
  res.json({ message: "Hello from Todo Backend 👋" });
});

module.exports = app;
