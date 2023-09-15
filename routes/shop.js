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
} from "../controllers/shopController.js";

const router = express.Router();

router.get("/", getIndex);

router.get("/cart", getCart);

router.post("/cart", postCart);

router.post("/cart-delete-item", cartDeleteItem);

router.get("/products", getProducts);

router.get("/products/:productId", getProduct);

router.get("/orders", getOrders);

router.post("/create-order", postOrder);

export default router;
