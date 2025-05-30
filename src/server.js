require("dotenv").config();

import express from "express";
import bodyParser from "body-parser";
import viewEngine from "./config/viewEngine";
import initWebRoutes from "./route/web";
import connectDB from "./config/connectDB";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";
import session from "express-session";
import configPassport from "./config/passport";

let app = express();

app.use(cors({ credentials: true, origin: "http://localhost:3000" }));

app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

viewEngine(app);

app.use(passport.initialize());
app.use(passport.session());

configPassport(app);
initWebRoutes(app);

connectDB();

let port = process.env.PORT || 8081;

app.listen(port, () => {
  console.log("Backend Node.js is running on the port : " + port);
});
