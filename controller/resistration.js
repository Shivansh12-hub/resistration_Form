import { Student } from "../models/student.js";
import {sendOtp, resendOtp} from "../utils/nodemailer.js"

const resisterStudent = asyncHandler(async (req, res) => {
    try {
        const { name,
            studentNo,
            email,
            gender,
            branch,
            phoneNo,
            residence
        } = req.body;
        const exixtingStudent = await Student.findOne({ 
            $or:[
            {studentNo},
            {email}
            ]
        });
        if (exixtingStudent) {
            throw new ApiError((400, "Student already exist "))
        }
        if (!name ||
            !studentNo ||
            !email ||
            !gender ||
            !branch ||
            !phoneNo ||
            !residence) {
            throw new ApiError(400, "all feilds are required");
        }
        
        
    
        const sendmail = await sendOtp({
            name: name,
            email: email,
            studentNo:studentNo
        });

    const resistration = await Student.create({
            name,
            studentNo,
            email,
            gender,
            branch,
            phoneNo,
            residence
        });
    
        if (!resistration) {
            throw new ApiError(200, "failed to store user details");
        }
    
        return res
            .status(200)
            .json(new ApiRespoce(200, { resistration }, "responce is successfully saved "));
    } catch (error) {
        console.error(error);
    }
    
})

