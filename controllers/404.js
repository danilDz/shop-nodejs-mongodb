export const pageNotFound = (req, res, next) => {
    const isLoggedIn = req.get("Cookie").split(";")[0].trim().split("=")[1];
    res.status(404).render("404", {
        docTitle: "Page not found!",
        path: "/404",
        isAuthenticated: isLoggedIn,
    });
};
