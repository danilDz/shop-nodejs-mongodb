import dotenv from "dotenv";
dotenv.config();

import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import session from "express-session";
import mongoDbSession from "connect-mongodb-session";

import path from "path";
import { fileURLToPath } from "url";

import adminRoutes from "./routes/admin.js";
import shopRoutes from "./routes/shop.js";
import authRoutes from "./routes/auth.js";
import { pageNotFound } from "./controllers/404.js";

import User from "./models/user.js";

const __filename = fileURLToPath(import.meta.url),
    __dirname = path.dirname(__filename);

const app = express();

const MongoDBStore = mongoDbSession(session);
const store = new MongoDBStore({
    uri: process.env.CONNECTION_URI,
    collection: "sessions",
});

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
app.use((req, res, next) => {
    if (!req.session.user) return next();
    User.findById(req.session.user._id)
        .then((user) => {
            req.user = user;
            next();
        })
        .catch((err) => console.log(err));
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(pageNotFound);

mongoose
    .connect(process.env.CONNECTION_URI)
    .then((result) => {
        User.findOne().then((user) => {
            if (!user) {
                const user = new User({
                    name: "daniil",
                    email: "test@example.com",
                    cart: {
                        items: [],
                    },
                });
                user.save();
            }
        });
        app.listen(3000);
    })
    .catch((err) => console.log(err));
