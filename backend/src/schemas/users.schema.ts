import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  creationDate: { type: Date, default: Date.now, required: true },
});

const userModel = mongoose.model("users", userSchema, "users");

export default userModel;