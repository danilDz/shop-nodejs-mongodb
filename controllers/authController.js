import User from "../models/user.js";

import bcrypt from "bcryptjs";

export const getLogin = (req, res, next) => {
        const isLoggedIn = req.session.isLoggedIn;
        res.render("auth/login", {
            path: "/login",
            docTitle: "Login",
            isAuthenticated: isLoggedIn,
        });
    },
    postLogin = (req, res, next) => {
        const email = req.body.email,
            password = req.body.password;
        User.findOne({ email: email })
            .then((user) => {
                if (!user) {
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
            isAuthenticated: false,
        });
    },
    postSignup = (req, res, next) => {
        const email = req.body.email,
            password = req.body.password,
            confirmPassword = req.body.confirmPassword;
        User.findOne({ email: email })
            .then((user) => {
                if (user) return res.redirect("/signup");
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
                        res.redirect("/login");
                    });
            })
            .catch((err) => console.log(err));
    };
