import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema(
  {
    name: String,
    designation: String,
    specialization: String,
    image: String,
  },
  { timestamps: true }
);

const Teacher = mongoose.model("Teacher", teacherSchema);

export default Teacher;