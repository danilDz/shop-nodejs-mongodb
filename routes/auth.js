import express from "express";
import { body } from "express-validator";

import {
    getLogin,
    postLogin,
    postLogout,
    getSignup,
    postSignup,
    getReset,
    postReset,
    getNewPassword,
    postNewPassword,
} from "../controllers/authController.js";

import User from "../models/user.js";

const router = express.Router();

router.get("/login", getLogin);

router.post(
    "/login",
    [
        body("email").isEmail().withMessage("Please enter a valid email!"),
        body(
            "password",
            "Please enter a password using only numbers and text and at least 5 characters"
        )
            .isLength({ min: 5 })
            .isAlphanumeric(),
    ],
    postLogin
);

router.get("/signup", getSignup);

router.post(
    "/signup",
    [
        body("email")
            .isEmail()
            .withMessage("Please enter a valid email!")
            .custom((value, { req }) => {
                return User.findOne({ email: value }).then((user) => {
                    if (user) {
                        return Promise.reject(
                            "This email exists. Please, enter a different one."
                        );
                    }
                });
            }),
        body(
            "password",
            "Please enter a password using only numbers and text and at least 5 characters"
        )
            .isLength({ min: 5 })
            .isAlphanumeric(),
        body("confirmPassword").custom((value, { req }) => {
            if (value !== req.body.password)
                throw new Error("Passwords have to match!");
            return true;
        }),
    ],
    postSignup
);

router.post("/logout", postLogout);

router.get("/reset", getReset);

router.post("/reset", postReset);

router.get("/reset/:token", getNewPassword);

router.post("/new-password", postNewPassword);

export default router;
