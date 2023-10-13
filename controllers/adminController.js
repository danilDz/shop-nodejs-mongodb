import { validationResult } from "express-validator";
import Product from "../models/product.js";

export const getAddProduct = (req, res, next) => {
        res.render("admin/edit-product", {
            docTitle: "Add product",
            path: "/admin/edit-product",
            editing: false,
            errorMessage: req.flash("error"),
            product: { title: "", price: "", imageURL: "", description: "" },
            validationErrors: [],
        });
    },
    postAddProduct = (req, res, next) => {
        const title = req.body.title,
            price = Number.parseFloat(req.body.price),
            description = req.body.description,
            imageURL = req.body.imageURL;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log(errors.array());
            return res.status(422).render("admin/edit-product", {
                docTitle: "Add product",
                path: "/admin/edit-product",
                editing: false,
                errorMessage: errors.array()[0].msg,
                product: { title, price, imageURL, description },
                validationErrors: errors.array(),
            });
        }

        const product = new Product({
            title,
            price,
            imageURL,
            description,
            userId: req.user._id,
        });
        product
            .save()
            .then(() => {
                res.redirect("/products");
            })
            .catch((err) => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });
    },
    getEditProduct = (req, res, next) => {
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
                    errorMessage: req.flash("error"),
                    validationErrors: [],
                });
            })
            .catch((err) => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });
    },
    postEditProduct = (req, res, next) => {
        const title = req.body.title,
            price = Number.parseFloat(req.body.price),
            description = req.body.description,
            imageURL = req.body.imageURL,
            productId = req.body.productId;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log(errors.array());
            return res.status(422).render("admin/edit-product", {
                docTitle: "Edit product",
                path: "/admin/edit-product",
                editing: true,
                product: {
                    title,
                    description,
                    imageURL,
                    price,
                    _id: productId,
                },
                errorMessage: errors.array()[0].msg,
                validationErrors: errors.array(),
            });
        }

        Product.findById(req.body.productId)
            .then((product) => {
                if (product.userId.toString() !== req.user._id.toString())
                    return res.redirect("/");
                product.title = title;
                product.price = price;
                product.imageURL = imageURL;
                product.description = description;
                return product.save().then((result) => {
                    res.redirect("/admin/products");
                });
            })
            .catch((err) => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });
    },
    getProducts = (req, res, next) => {
        Product.find({ userId: req.user._id })
            .then((products) => {
                res.render("admin/products", {
                    prods: products,
                    docTitle: "Admin products",
                    path: "/admin/products",
                });
            })
            .catch((err) => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });
    },
    deleteProduct = (req, res, next) => {
        Product.deleteOne({ _id: req.body.productId, userId: req.user._id })
            .then((result) => {
                res.redirect("/admin/products");
            })
            .catch((err) => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });
    };
