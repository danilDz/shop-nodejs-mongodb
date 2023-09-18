import User from "../models/user.js";

export const getLoginPage = (req, res, next) => {
        const isLoggedIn = req.session.isLoggedIn;
        res.render("auth/login", {
            path: "/login",
            docTitle: "Login",
            isAuthenticated: isLoggedIn,
        });
    },
    postLogin = (req, res, next) => {
        User.findById("65035a8a36761ad3abe8add4")
            .then((user) => {
                req.session.isLoggedIn = true;
                req.session.user = user;
                return req.session.save((err) => {
                    res.redirect("/");
                });
            })
            .catch((err) => console.log(err));
    },
    postLogout = (req, res, next) => {
        req.session.destroy((err) => {
            console.log(err);
            res.redirect("/");
        });
    };
