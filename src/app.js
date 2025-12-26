console.clear();
import express from "express";
import cors from "cors";
import { userrouters } from "./Routes/user.routes.js";
import { logfiles } from "./middleware/log.js";
import cookie from "cookie-parser";
import { home } from "./Routes/homePage.js";


const app = express();

app.use(express.json({ limit: "64kb" }));
app.use(cookie());
app.use(express.urlencoded({ limit: "64kb" }));
app.use(cookie());
app.use(
  cors({
    origin: process.env.ORIGIN,
    credentials: true,
  })
);
app.get("/", home);
app.use("/users", logfiles, userrouters);

export { app };
