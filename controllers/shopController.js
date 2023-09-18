import Product from "../models/product.js";
import Order from "../models/order.js";

export const getProducts = (req, res, next) => {
        const isLoggedIn = req.session.isLoggedIn;
        Product.find()
            .then((products) => {
                res.render("shop/product-list", {
                    prods: products,
                    docTitle: "All products",
                    path: "/products",
                    isAuthenticated: isLoggedIn,
                });
            })
            .catch((err) => console.log(err));
    },
    getProduct = (req, res, next) => {
        const productId = req.params.productId;
        const isLoggedIn = req.session.isLoggedIn;
        Product.findById(productId)
            .then((product) => {
                res.render("shop/product-detail", {
                    product: product,
                    docTitle: "Product detail",
                    path: "/products",
                    isAuthenticated: isLoggedIn,
                });
            })
            .catch((err) => console.log(err));
    },
    getIndex = (req, res, next) => {
        const isLoggedIn = req.session.isLoggedIn;
        Product.find()
            .then((products) => {
                res.render("shop/index", {
                    prods: products,
                    docTitle: "Shop",
                    path: "/",
                    isAuthenticated: isLoggedIn,
                });
            })
            .catch((err) => console.log(err));
    },
    getCart = (req, res, next) => {
        const isLoggedIn = req.session.isLoggedIn;
        req.user
            .populate("cart.items.productId")
            .then((user) => {
                const products = user.cart.items;
                res.render("shop/cart", {
                    path: "/cart",
                    docTitle: "Cart",
                    products: products,
                    isAuthenticated: isLoggedIn,
                });
            })
            .catch((err) => console.log(err));
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
            .catch((err) => console.log(err));
    },
    cartDeleteItem = (req, res, next) => {
        const prodId = req.body.productId;
        req.user
            .removeFromCart(prodId)
            .then((result) => {
                console.log(result);
                res.redirect("/cart");
            })
            .catch((err) => console.log(err));
    },
    getOrders = (req, res, next) => {
        const isLoggedIn = req.session.isLoggedIn;
        Order.find({ "user.userId": req.user._id })
            .then((orders) => {
                res.render("shop/orders", {
                    path: "/orders",
                    docTitle: "Orders",
                    orders: orders,
                    isAuthenticated: isLoggedIn,
                });
            })
            .catch((err) => console.log(err));
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
                        name: req.user.name,
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
            .catch((err) => console.log(err));
    };
