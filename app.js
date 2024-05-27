const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const MongoStore = require("connect-mongo");
const router = require("./routes/index");
dotenv.config();
const app = express();
const PORT = process.env.PORT || 9001;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

app.listen(PORT, () => {
  console.log(`App is listening on Port ${PORT}`);
});

const pino = require("pino")({
  safe: true,
  name: "Node auth tuturiol",
});

app.use((req, res, next) => {
  const { path, method, headers } = req;
  pino.info({
    ipAddress: req.ip,
    request: { path, method, headers },
  });
  next();
});
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET, 
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: 'sessions',
      autoRemove: 'native' // Default
    })
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use("/api/v1", router);
