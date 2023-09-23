import express from "express";

import {
    getAddProduct,
    postAddProduct,
    getProducts,
    getEditProduct,
    postEditProduct,
    deleteProduct,
} from "../controllers/adminController.js";

import isAuth from "../middleware/is-auth.js";

const router = express.Router();

router.get("/add-product", isAuth, getAddProduct);

router.post("/add-product", isAuth, postAddProduct);

router.get("/edit-product/:productId", isAuth, getEditProduct);

router.post("/edit-product", isAuth, postEditProduct);

router.post("/delete-product", isAuth, deleteProduct);

router.get("/products", isAuth, getProducts);

export default router;
