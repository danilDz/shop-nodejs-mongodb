import dotenv from "dotenv";
dotenv.config();

import crypto from "crypto";

import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import brevoTransport from "nodemailer-brevo-transport";

import User from "../models/user.js";

const transporter = nodemailer.createTransport(
    new brevoTransport({
        apiKey: process.env.BREVO_API_KEY,
    })
);

export const getLogin = (req, res, next) => {
        res.render("auth/login", {
            path: "/login",
            docTitle: "Login",
            errorMessage: req.flash("error"),
        });
    },
    postLogin = (req, res, next) => {
        const email = req.body.email,
            password = req.body.password;
        User.findOne({ email: email })
            .then((user) => {
                if (!user) {
                    req.flash("error", "Invalid email!");
                    return res.redirect("/login");
                }
                bcrypt
                    .compare(password, user.password)
                    .then((doMatch) => {
                        if (doMatch) {
                            req.session.isLoggedIn = true;
                            req.session.user = user;
                            return req.session.save((err) => {
                                res.redirect("/");
                            });
                        }
                        req.flash("error", "Invalid password!");
                        res.redirect("/login");
                    })
                    .catch((err) => {
                        console.log(err);
                        res.redirect("/login");
                    });
            })
            .catch((err) => console.log(err));
    },
    postLogout = (req, res, next) => {
        req.session.destroy((err) => {
            console.log(err);
            res.redirect("/");
        });
    },
    getSignup = (req, res, next) => {
        res.render("auth/signup", {
            path: "/signup",
            docTitle: "Signup",
            errorMessage: req.flash("error"),
        });
    },
    postSignup = (req, res, next) => {
        const email = req.body.email,
            password = req.body.password,
            confirmPassword = req.body.confirmPassword;
        User.findOne({ email: email })
            .then((user) => {
                if (user) {
                    req.flash(
                        "error",
                        "This email exists. Please, enter a different one."
                    );
                    return res.redirect("/signup");
                }
                return bcrypt
                    .hash(password, 12)
                    .then((hashedPassword) => {
                        const user = new User({
                            email: email,
                            password: hashedPassword,
                            cart: { items: [] },
                        });
                        return user.save();
                    })
                    .then((result) => {
                        return transporter.sendMail({
                            to: email,
                            from: "shop@test.com",
                            subject: "Signup succeeded",
                            html: "<h1>You successfully signed up!</h1>",
                        });
                    })
                    .then((result) => {
                        res.redirect("/login");
                    })
                    .catch((err) => console.log(err));
            })
            .catch((err) => console.log(err));
    },
    getReset = (req, res, next) => {
        res.render("auth/reset", {
            path: "/reset",
            docTitle: "Reset password",
            errorMessage: req.flash("error"),
        });
    },
    postReset = (req, res, next) => {
        crypto.randomBytes(32, (err, buffer) => {
            if (err) {
                console.log(err);
                return res.redirect("/reset");
            }
            const token = buffer.toString("hex");
            User.findOne({ email: req.body.email })
                .then((user) => {
                    if (!user) {
                        req.flash("error", "No account with that email found!");
                        return res.redirect("/reset");
                    }
                    user.resetToken = token;
                    user.resetTokenExp = Date.now() + 3600000;
                    return user.save();
                })
                .then((result) => {
                    res.redirect("/");
                    return transporter.sendMail({
                        to: req.body.email,
                        from: "shop@test.com",
                        subject: "Password reset",
                        html: `
                            <p>You requested a password reset</p>
                            <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
                        `,
                    });
                })
                .catch((err) => console.log(err));
        });
    },
    getNewPassword = (req, res, next) => {
        const token = req.params.token;
        User.findOne({ resetToken: token, resetTokenExp: { $gt: Date.now() } })
            .then((user) => {
                if (!user) {
                    req.flash("error", "Invalid token or token has expired!");
                    res.redirect("/reset");
                }
                res.render("auth/new-password", {
                    path: "/new-password",
                    docTitle: "New password",
                    errorMessage: req.flash("error"),
                    userId: user._id.toString(),
                    passwordToken: token,
                });
            })
            .catch((err) => console.log(err));
    },
    postNewPassword = (req, res, next) => {
        const password = req.body.password,
            userId = req.body.userId,
            passwordToken = req.body.passwordToken;

        let resetUser;

        User.findOne({
            resetToken: passwordToken,
            resetTokenExp: { $gt: Date.now() },
            _id: userId,
        })
            .then((user) => {
                if (!user) {
                    req.flash("error", "User with valid token not found!");
                    res.redirect("/reset");
                }
                resetUser = user;
                return bcrypt.hash(password, 12);
            })
            .then((hashedPassword) => {
                resetUser.password = hashedPassword;
                resetUser.resetToken = undefined;
                resetUser.resetTokenExp = undefined;
                return resetUser.save();
            })
            .then((result) => {
                res.redirect("/login");
            })
            .catch((err) => console.log(err));
    };
