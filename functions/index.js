import functions from "firebase-functions";
import cors from "cors";
import express from "express";
import jwt from "jsonwebtoken";
import secretkey from "./secret.js";

const users = [
  { id: 1, email: "admin@b.com", password: "abc123" },
  { id: 2, email: "user1@b.com", password: "use123" },
  { id: 3, email: "test1@b.com", password: "tst123" },
];

const app = express();
app.use(cors());
app.use(express.json());

app.get("/public", (req, res) => {
  res.send("Welcome!"); // anyone can see this
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  // check it email/password exists in the DB
  // if so, send back a token
  let user = users.find(
    (user) => user.email === email && user.password === password
  );
  if (!user) {
    res.status(401).send("Invalid credentials");
    return;
  }
  user.password = undefined; // this removes password from user object that will return no front end
  // now we can create and sign a token with a secret token
  const token = jwt.sign(user, secretkey, { expiresIn: "1h" });
  res.send(token);
});

app.get("/private", (req, res) => {
  // requires a valid token to enter here
  const token = req.headers.authorization || "";
  if (!token) {
    res.status(401).send("You must be logger in to see this");
    return;
  }
  // checks signature, all fields match and if is expired
  jwt.verify(token, secretkey, (err, decoded) => {
    if (err) {
      res.status(401).send("You must be logged in to see this");
      return;
    }
    //here we know the token is valid
    res.send(`Welcome ${decoded.email}`);
  });
});

export const api = functions.https.onRequest(app);

// to test, on postman, a get request to private requires a HEADER called AUTHORIZATION
// there we post the token and get the result
