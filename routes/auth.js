import express from "express";

import { getLoginPage, postLogin } from "../controllers/authController.js";

const router = express.Router();

router.get('/login', getLoginPage);
router.post('/login', postLogin);

export default router;