export const getLoginPage = (req, res, next) => {
        const isLoggedIn = req.get("Cookie").split(";")[0].trim().split("=")[1];
        res.render("auth/login", {
            path: "/login",
            docTitle: "Login",
            isAuthenticated: isLoggedIn,
        });
    },
    postLogin = (req, res, next) => {
        res.setHeader("set-Cookie", "loggedIn=true");
        res.redirect("/");
    };
