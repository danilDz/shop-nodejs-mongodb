import { validationResult } from "express-validator";
import Product from "../models/product.js";
import { deleteFile } from "../util/file.js";

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
            image = req.file;

        if (!image) {
            return res.status(422).render("admin/edit-product", {
                docTitle: "Add product",
                path: "/admin/edit-product",
                editing: false,
                errorMessage: "Attached file is not an image!",
                product: { title, price, description },
                validationErrors: [],
            });
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log(errors.array());
            return res.status(422).render("admin/edit-product", {
                docTitle: "Add product",
                path: "/admin/edit-product",
                editing: false,
                errorMessage: errors.array()[0].msg,
                product: { title, price, description },
                validationErrors: errors.array(),
            });
        }

        const imageURL = image.path;
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
            image = req.file,
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
                if (image) {
                    deleteFile(product.imageURL);
                    product.imageURL = image.path;
                }
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
        Product.findById(req.params.productId)
            .then((product) => {
                if (!product) return next(new Error("Product not found!"));
                deleteFile(product.imageURL);
                return Product.deleteOne({
                    _id: req.params.productId,
                    userId: req.user._id,
                });
            })
            .then((result) => {
                res.status(200).json({message: "Success!"});
            })
            .catch((err) => {
                res.status(500).json({message: "Deleting product failed!"});
            });
    };
