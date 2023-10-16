import fs from "fs";
import path from "path";

import PDFDocument from "pdfkit";

import Product from "../models/product.js";
import Order from "../models/order.js";

const ITEMS_PER_PAGE = 2;

export const getProducts = (req, res, next) => {
        const page = +req.query.page || 1;
        let numberOfProducts;
        Product.find()
            .countDocuments()
            .then((numProducts) => {
                numberOfProducts = numProducts;
                return Product.find()
                    .skip((page - 1) * ITEMS_PER_PAGE)
                    .limit(ITEMS_PER_PAGE);
            })
            .then((products) => {
                res.render("shop/product-list", {
                    prods: products,
                    docTitle: "All products",
                    path: "/products",
                    currentPage: page,
                    hasNextPage: ITEMS_PER_PAGE * page < numberOfProducts,
                    hasPreviousPage: page > 1,
                    nextPage: page + 1,
                    previousPage: page - 1,
                    lastPage: Math.ceil(numberOfProducts / ITEMS_PER_PAGE),
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
        const page = +req.query.page || 1;
        let numberOfProducts;
        Product.find()
            .countDocuments()
            .then((numProducts) => {
                numberOfProducts = numProducts;
                return Product.find()
                    .skip((page - 1) * ITEMS_PER_PAGE)
                    .limit(ITEMS_PER_PAGE);
            })
            .then((products) => {
                res.render("shop/index", {
                    prods: products,
                    docTitle: "Shop",
                    path: "/",
                    currentPage: page,
                    hasNextPage: ITEMS_PER_PAGE * page < numberOfProducts,
                    hasPreviousPage: page > 1,
                    nextPage: page + 1,
                    previousPage: page - 1,
                    lastPage: Math.ceil(numberOfProducts / ITEMS_PER_PAGE),
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
    },
    getInvoice = (req, res, next) => {
        const orderId = req.params.orderId;

        Order.findById(orderId)
            .then((order) => {
                if (!order) return next(new Error("No order is found!"));
                if (order.user.userId.toString() !== req.user._id.toString())
                    return next(new Error("Unauthorized!"));

                const invoiceName = `invoice-${orderId}.pdf`,
                    invoicePath = path.join("data", "invoices", invoiceName);

                res.setHeader("Content-Type", "application/pdf");
                res.setHeader(
                    "Content-Disposition",
                    `attachment; filename="${invoiceName}"`
                );

                const pdfDoc = new PDFDocument();

                pdfDoc.pipe(fs.createWriteStream(invoicePath));
                pdfDoc.pipe(res);

                pdfDoc.fontSize(26).text("Invoice");
                pdfDoc.text("------------------------");
                let totalPrice = 0;
                order.items.forEach((prod) => {
                    totalPrice += prod.quantity * prod.product.price;
                    pdfDoc
                        .fontSize(14)
                        .text(
                            `${prod.product.title} - ${prod.quantity} x $${prod.product.price}`
                        );
                });
                pdfDoc.fontSize(26).text("------------------------");
                pdfDoc.fontSize(20).text(`Total price: $${totalPrice}`);

                pdfDoc.end();

                // fs.readFile(invoicePath, (err, data) => {
                //     if (err) {
                //         return next(err);
                //     }
                //     res.setHeader("Content-Type", "application/pdf");
                //     res.setHeader(
                //         "Content-Disposition",
                //         `attachment; filename="${invoiceName}"`
                //     );
                //     res.send(data);
                // });

                // const file = fs.createReadStream(invoicePath);
                // res.setHeader("Content-Type", "application/pdf");
                // res.setHeader(
                //     "Content-Disposition",
                //     `attachment; filename="${invoiceName}"`
                // );
                // file.pipe(res);
            })
            .catch((err) => {
                next(err);
            });
    };
