require("dotenv").config();
import express from "express";
import bodyParser from "body-parser";
import viewEngine from "./config/viewEngine";
import initWebRoutes from "./route/web";
import connectDB from "./config/connectDB";
import cors from "cors";

let app = express();

app.use(cors({ credentials: true, origin: "http://localhost:3000" }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

viewEngine(app);
initWebRoutes(app);

connectDB();

let port = process.env.PORT || 6060;

app.listen(port, () => {
  console.log("Backend Node.js is running on the port : " + port);
});
