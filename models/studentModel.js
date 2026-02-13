import mongoose, { Schema } from "mongoose";

const studentSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique:true,
      minlength: [2, "Name must be at least 3 characters long"],
      maxlength: 50,
      match: [
      /^[A-Za-z\s]+$/,
      "Name must contain only letters and spaces",
  ],
    },

    studentNo: {
      type: String,
      required: true,
      unique:true,
      match: [
        /^{25,24}\d{5,8}$/,
        "Student number must start with 25 and be 7–10 digits long",
      ],
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      unique:true,
      match: [
        /^[a-zA-Z0-9._%+-]+@akgec\.ac\.in$/,
        "Email must be a valid AKGEC email (ending with @akgec.ac.in)",
      ],
    },

    gender: {
      type: String,
      required: true,
      lowercase: true,
      enum: {
        values: ["male", "female", "other"],
        message: "Gender must be male, female, or other",
      },
    },

    branch: {
      type: String,
      required: true,
      enum: {
        values: [
          "CSE",
          "CSE(AI&ML)",
          "AIML",
          "CSE(DS)",
          "CS",
          "CS(H)",
          "CSIT",
          "IT",
          "EN",
          "ME",
          "Civil",
        ],
        message: "Provide a valid branch",
      },
    },

    phoneNo: {
      type: String,
      required: true,
      match: [
        /^[6-9]\d{9}$/,
        "Phone number must be a valid 10-digit Indian mobile number",
      ],
    },

    residence: {
      type: String,
      required: true,
      enum: {
        values: ["DayScholar", "Hostler"],
        message: "Provide residence (DayScholar or Hostler)",
      },
    },

    unstopId: {
      type: String,
      required: true,
      trim: true,
      minlength: [3, "Unstop ID must be at least 3 characters long"],
      match: [
        /^[a-zA-Z0-9]+$/,
        "Unstop ID must contain only letters and numbers",
      ],
    },
  },
  { timestamps: true }
);

export const Student = mongoose.model("Student", studentSchema);