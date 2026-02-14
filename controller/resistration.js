import { Student } from "../models/studentModel.js";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponce.js";
import { asyncHandler } from "../utils/asyncHandler.js";

dotenv.config();

/* ---------------- OTP Utils ---------------- */
const generateOtp = () => Math.floor(1000 + Math.random() * 9000);

/* ---------------- Mail Transporter ---------------- */
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOtp = async ({ otp, name, email }) => {
  await transporter.sendMail({
    from: `"Registration Team" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your OTP Code",
    text: `Hello ${name}, your OTP is ${otp}. It is valid for 5 minutes.`,
    html: `
      <h2>Hello ${name} 👋</h2>
      <p>Your One-Time Password (OTP) is:</p>
      <h1 style="letter-spacing: 4px;">${otp}</h1>
      <p>This OTP is valid for <b>5 minutes</b>.</p>
    `,
  });

  return true;
};


const resisterStudent = asyncHandler(async (req, res) => {
  const {
    name,
    studentNo,
    email,
    gender,
    branch,
    phoneNo,
    residence,
    rollNumber,
  } = req.body;

  if (
    !name ||
    !studentNo ||
    !email ||
    !gender ||
    !branch ||
    !phoneNo ||
    !rollNumber ||
    !residence
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const userIp = req.headers["x-forwarded-for"] || req.ip;

  const registrationCount = await Student.countDocuments({ ip: userIp });
  if (registrationCount >= 2) {
    throw new ApiError(400, "Registration limit reached for this device");
  }

  const existingStudent = await Student.findOne({
    $or: [{ studentNo }, { email }],
  });

  if (existingStudent) {
    throw new ApiError(409, "Student already exists");
  }

  const otp = generateOtp();
  const otpExpiry = Date.now() + 5 * 60 * 1000;

  req.session.otp = otp;
  req.session.otpExpiry = otpExpiry;
  req.session.userData = {
    name,
    studentNo,
    email,
    gender,
    branch,
    phoneNo,
    residence,
    rollNumber,
    ip: userIp,
  };

  await sendOtp({ name, email, otp });

  return res.status(200).json(
    new ApiResponse(200, { email }, "OTP sent successfully")
  );
});


const verifyStudentRegistration = asyncHandler(async (req, res) => {
  const { otp } = req.body;

  if (!req.session.otp || !req.session.userData) {
    throw new ApiError(400, "OTP session expired. Please restart registration");
  }

  if (Date.now() > req.session.otpExpiry) {
    req.session.destroy();
    throw new ApiError(400, "OTP expired");
  }

  if (String(otp) !== String(req.session.otp)) {
    throw new ApiError(401, "Invalid OTP");
  }

  const student = await Student.create(req.session.userData);

  req.session.destroy();

  return res
    .status(201)
    .json(new ApiResponse(201, student, "Student registered successfully"));
});


const resendOTP = asyncHandler(async (req, res) => {
  if (!req.session.userData) {
    throw new ApiError(400, "Session expired. Restart registration");
  }

  const { name, email } = req.session.userData;

  const otp = generateOtp();
  const otpExpiry = Date.now() + 5 * 60 * 1000;

  req.session.otp = otp;
  req.session.otpExpiry = otpExpiry;

  await sendOtp({ name, email, otp });

  return res
    .status(200)
    .json(new ApiResponse(200, { email }, "OTP resent successfully"));
});

export {
  resisterStudent,
  verifyStudentRegistration,
  resendOTP,
};
