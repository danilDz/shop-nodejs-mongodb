import User from "../models/user.js";

import bcrypt from "bcryptjs";

export const getLogin = (req, res, next) => {
        res.render("auth/login", {
            path: "/login",
            docTitle: "Login",
            errorMessage: req.flash('error')
        });
    },
    postLogin = (req, res, next) => {
        const email = req.body.email,
            password = req.body.password;
        User.findOne({ email: email })
            .then((user) => {
                if (!user) {
                    req.flash('error', 'Invalid email!');
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
                        req.flash('error', 'Invalid password!');
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
            errorMessage: req.flash('error')
        });
    },
    postSignup = (req, res, next) => {
        const email = req.body.email,
            password = req.body.password,
            confirmPassword = req.body.confirmPassword;
        User.findOne({ email: email })
            .then((user) => {
                if (user) {
                    req.flash('error', 'This email exists. Please, enter a different one.')
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
                        res.redirect("/login");
                    });
            })
            .catch((err) => console.log(err));
    };
