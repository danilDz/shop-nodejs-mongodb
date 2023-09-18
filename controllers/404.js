export const pageNotFound = (req, res, next) => {
    const isLoggedIn = req.session.isLoggedIn;
    res.status(404).render("404", {
        docTitle: "Page not found!",
        path: "/404",
        isAuthenticated: isLoggedIn,
    });
};
