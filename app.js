import dotenv from "dotenv";
dotenv.config();

import express from "express";
import bodyParser from "body-parser";
import multer from "multer";
import mongoose from "mongoose";
import session from "express-session";
import mongoDbSession from "connect-mongodb-session";
import csurf from "csurf";
import flash from "connect-flash";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import https from "https";

import path from "path";
import { fileURLToPath } from "url";

import adminRoutes from "./routes/admin.js";
import shopRoutes from "./routes/shop.js";
import authRoutes from "./routes/auth.js";
import { get500, pageNotFound } from "./controllers/errorController.js";

import User from "./models/user.js";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url),
    __dirname = path.dirname(__filename);

const app = express();

const MongoDBStore = mongoDbSession(session);
const store = new MongoDBStore({
    uri: process.env.CONNECTION_URI,
    collection: "sessions",
});
const csrfProtection = csurf();

// const privateKey = fs.readFileSync("server.key");
// const certificate = fs.readFileSync("server.cert");

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "images");
    },
    filename: (req, file, cb) => {
        cb(null, `${new Date().toISOString()}-${file.originalname}`);
    },
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg"
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

app.set("view engine", "ejs");
app.set("views", "views");

const accessLogStream = fs.createWriteStream(
    path.join(__dirname, "access.log"),
    { flags: "a" }
);

app.use(helmet());
app.use(compression());
app.use(morgan("combined", { stream: accessLogStream }));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(
    multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));

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
        // https
        //     .createServer({ key: privateKey, cert: certificate }, app)
        //     .listen(process.env.PORT || 3000);
        app.listen(process.env.PORT || 3000);
    })
    .catch((err) => console.log(err));
