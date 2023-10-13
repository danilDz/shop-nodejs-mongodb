import Product from "../models/product.js";
import Order from "../models/order.js";

export const getProducts = (req, res, next) => {
        Product.find()
            .then((products) => {
                res.render("shop/product-list", {
                    prods: products,
                    docTitle: "All products",
                    path: "/products",
                });
            })
            .catch((err) => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });
    },
    getProduct = (req, res, next) => {
        const productId = req.params.productId;
        Product.findById(productId)
            .then((product) => {
                res.render("shop/product-detail", {
                    product: product,
                    docTitle: "Product detail",
                    path: "/products",
                });
            })
            .catch((err) => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });
    },
    getIndex = (req, res, next) => {
        Product.find()
            .then((products) => {
                res.render("shop/index", {
                    prods: products,
                    docTitle: "Shop",
                    path: "/",
                });
            })
            .catch((err) => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });
    },
    getCart = (req, res, next) => {
        req.user
            .populate("cart.items.productId")
            .then((user) => {
                const products = user.cart.items;
                res.render("shop/cart", {
                    path: "/cart",
                    docTitle: "Cart",
                    products: products,
                });
            })
            .catch((err) => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });
    },
    postCart = (req, res, next) => {
        const productId = req.body.productId;
        Product.findById(productId)
            .then((product) => {
                return req.user.addToCart(product);
            })
            .then((result) => {
                res.redirect("/cart");
            })
            .catch((err) => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });
    },
    cartDeleteItem = (req, res, next) => {
        const prodId = req.body.productId;
        req.user
            .removeFromCart(prodId)
            .then((result) => {
                console.log(result);
                res.redirect("/cart");
            })
            .catch((err) => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });
    },
    getOrders = (req, res, next) => {
        Order.find({ "user.userId": req.user._id })
            .then((orders) => {
                res.render("shop/orders", {
                    path: "/orders",
                    docTitle: "Orders",
                    orders: orders,
                });
            })
            .catch((err) => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });
    },
    postOrder = (req, res, next) => {
        req.user
            .populate("cart.items.productId")
            .then((user) => {
                const products = user.cart.items.map((item) => {
                    return {
                        quantity: item.quantity,
                        product: { ...item.productId._doc },
                    };
                });
                const order = new Order({
                    user: {
                        userId: req.user._id,
                        email: req.user.email,
                    },
                    items: products,
                });
                return order.save();
            })
            .then((result) => {
                return req.user.clearCart();
            })
            .then((result) => {
                res.redirect("/orders");
            })
            .catch((err) => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });
    };
