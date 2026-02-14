import { Router } from "express";
import { slow } from "../middleware/express-slowDown.js";
// import { limiter } from "./middleware/rateLimiter.js";

import { resisterStudent, resendOTP,  verifyStudentRegistration, verifyCaptcha } from "../controller/resistration.js";


const router=Router();

router.route("/register").post(slow,resisterStudent);

router.route("/verify").post( slow,verifyStudentRegistration);

router.route("/resend-otp").post(resendOTP);
router.route("/verifyCaptcha").post(verifyCaptcha);

export default router