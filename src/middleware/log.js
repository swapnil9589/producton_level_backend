import fs from "fs";

let id = 1;
export const logfiles = (req, res, next) => {
  const dateandtime =
    id +
    ") " +
    new Date().toString().substring(0, 33) +
    " " +
    req.headers["user-agent"] +
    "   Origin-" +
    req.headers.host +
    req.originalUrl +
    "\n";
  fs.appendFile("./src/text.txt", dateandtime.toString(), "utf-8", () => {
    if (!req.headers.host.includes("localhost:3000")) {
      throw new Error("please check");
    }
  });
  id++;
  next();
};
