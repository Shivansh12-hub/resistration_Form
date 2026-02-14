import { Router } from "express";
// const { registerStudent, verifyStudentRegistration } = require("../controller/student.controller");

import { resisterStudent, resendOTP,  verifyStudentRegistration } from "../controller/resistration.js";


const router=Router();

router.route("/register").post(  resisterStudent);

router.route("/verify").post( verifyStudentRegistration);

// router.route("/verify-captcha").post(verifyCaptcha);

router.route("/resend-otp").get( resendOTP);

export default router