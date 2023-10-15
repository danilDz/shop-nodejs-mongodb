import express from "express";

import {
    getIndex,
    getProducts,
    getCart,
    postCart,
    getOrders,
    getProduct,
    cartDeleteItem,
    postOrder,
    getInvoice,
} from "../controllers/shopController.js";

import isAuth from "../middleware/is-auth.js";

const router = express.Router();

router.get("/", getIndex);

router.get("/cart", isAuth, getCart);

router.post("/cart", isAuth, postCart);

router.post("/cart-delete-item", isAuth, cartDeleteItem);

router.get("/products", getProducts);

router.get("/products/:productId", getProduct);

router.get("/orders", isAuth, getOrders);

router.post("/create-order", isAuth, postOrder);

router.get("/orders/:orderId", isAuth, getInvoice);

export default router;
