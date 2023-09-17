import Product from "../models/product.js";

export const getAddProduct = (req, res, next) => {
        const isLoggedIn = req.get("Cookie").split(";")[0].trim().split("=")[1];
        res.render("admin/edit-product", {
            docTitle: "Add product",
            path: "/admin/add-product",
            editing: false,
            isAuthenticated: isLoggedIn,
        });
    },
    postAddProduct = (req, res, next) => {
        const product = new Product({
            title: req.body.title,
            price: Number.parseFloat(req.body.price),
            imageURL: req.body.imageURL,
            description: req.body.description,
            userId: req.user._id,
        });
        product
            .save()
            .then(() => {
                res.redirect("/products");
            })
            .catch((err) => console.log(err));
    },
    getEditProduct = (req, res, next) => {
        const isLoggedIn = req.get("Cookie").split(";")[0].trim().split("=")[1];
        const editMode = req.query.edit,
            prodId = req.params.productId;
        if (!editMode) return res.redirect("/");
        Product.findById(prodId)
            .then((product) => {
                if (!product) return res.redirect("/");
                res.render("admin/edit-product", {
                    docTitle: "Edit product",
                    path: "/admin/edit-product",
                    editing: editMode,
                    product: product,
                    isAuthenticated: isLoggedIn,
                });
            })
            .catch((err) => console.log(err));
    },
    postEditProduct = (req, res, next) => {
        Product.findById(req.body.productId)
            .then((product) => {
                product.title = req.body.title;
                product.price = Number.parseFloat(req.body.price);
                product.imageURL = req.body.imageURL;
                product.description = req.body.description;
                return product.save();
            })
            .then((result) => {
                res.redirect("/admin/products");
            })
            .catch((err) => console.log(err));
    },
    getProducts = (req, res, next) => {
        const isLoggedIn = req.get("Cookie").split(";")[0].trim().split("=")[1];
        Product.find()
            .then((products) => {
                res.render("admin/products", {
                    prods: products,
                    docTitle: "Admin products",
                    path: "/admin/products",
                    isAuthenticated: isLoggedIn,
                });
            })
            .catch((err) => console.log(err));
    },
    deleteProduct = (req, res, next) => {
        Product.findByIdAndDelete(req.body.productId)
            .then((result) => {
                res.redirect("/admin/products");
            })
            .catch((err) => console.log(err));
    };
