import Product from "../models/product.js";

export const getAddProduct = (req, res, next) => {
        res.render("admin/edit-product", {
            docTitle: "Add product",
            path: "/admin/add-product",
            editing: false,
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
                });
            })
            .catch((err) => console.log(err));
    },
    postEditProduct = (req, res, next) => {
        Product.findById(req.body.productId)
            .then((product) => {
                if (product.userId.toString() !== req.user._id.toString()) return res.redirect("/");
                product.title = req.body.title;
                product.price = Number.parseFloat(req.body.price);
                product.imageURL = req.body.imageURL;
                product.description = req.body.description;
                return product.save().then((result) => {
                    res.redirect("/admin/products");
                });
            })
            .catch((err) => console.log(err));
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
            .catch((err) => console.log(err));
    },
    deleteProduct = (req, res, next) => {
        Product.deleteOne({ _id: req.body.productId, userId: req.user._id })
            .then((result) => {
                res.redirect("/admin/products");
            })
            .catch((err) => console.log(err));
    };
