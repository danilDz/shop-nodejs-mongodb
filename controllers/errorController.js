export const pageNotFound = (req, res, next) => {
    res.status(404).render("404", {
        docTitle: "Page not found!",
        path: "/404",
    });
};

export const get500 = (req, res, next) => {
    res.status(500).render("500", {
        docTitle: "Error!",
        path: "/500",
    });
};
