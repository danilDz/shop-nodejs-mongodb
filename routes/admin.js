import express from "express";
import { body } from "express-validator";

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

router.post(
    "/add-product",
    [
        body("title")
            .isLength({ min: 5 })
            .withMessage("Title must be at least 5 characters!")
            .trim(),
        body("price")
            .isFloat({ min: 0.01 })
            .withMessage("Price must be greater than 0!"),
        body("description")
            .isLength({ min: 10 })
            .withMessage("Description must be at least 10 characters!")
            .trim(),
    ],
    isAuth,
    postAddProduct
);

router.get("/edit-product/:productId", isAuth, getEditProduct);

router.post(
    "/edit-product",
    [
        body("title")
            .isLength({ min: 5 })
            .withMessage("Title must be at least 5 characters!")
            .trim(),
        body("price")
            .isFloat({ min: 0.01 })
            .withMessage("Price must be greater than 0!"),
        body("description")
            .isLength({ min: 10 })
            .withMessage("Description must be at least 10 characters!")
            .trim(),
    ],
    isAuth,
    postEditProduct
);

router.post("/delete-product", isAuth, deleteProduct);

router.get("/products", isAuth, getProducts);

export default router;