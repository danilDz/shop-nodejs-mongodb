import dotenv from "dotenv";
dotenv.config();

import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import session from "express-session";
import mongoDbSession from "connect-mongodb-session";
import csurf from "csurf";
import flash from "connect-flash";

import path from "path";
import { fileURLToPath } from "url";

import adminRoutes from "./routes/admin.js";
import shopRoutes from "./routes/shop.js";
import authRoutes from "./routes/auth.js";
import { get500, pageNotFound } from "./controllers/errorController.js";

import User from "./models/user.js";

const __filename = fileURLToPath(import.meta.url),
    __dirname = path.dirname(__filename);

const app = express();

const MongoDBStore = mongoDbSession(session);
const store = new MongoDBStore({
    uri: process.env.CONNECTION_URI,
    collection: "sessions",
});
const csrfProtection = csurf();

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
    session({
        secret: "test secret",
        resave: false,
        saveUninitialized: false,
        store: store,
    })
);

app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use((req, res, next) => {
    if (!req.session.user) return next();
    User.findById(req.session.user._id)
        .then((user) => {
            if (!user) return next();
            req.user = user;
            next();
        })
        .catch((err) => {
            next(new Error(err));
        });
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get("/500", get500);

app.use(pageNotFound);

app.use((error, req, res, next) => {
    res.status(500).render("500", {
        docTitle: "Error!",
        path: "/500",
    });
});

mongoose
    .connect(process.env.CONNECTION_URI)
    .then((result) => {
        app.listen(3000);
    })
    .catch((err) => console.log(err));
