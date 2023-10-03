import mongoose from "mongoose";

const userCollection = "users";

const userSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    email: { type: String, unique: true },
    age: Number,
    password: String,
    role: { type: String, default: "user" },
    cart: { type: mongoose.Schema.Types.ObjectId, ref: "carts" },
});

userSchema.pre("find", function (next) {
    this.populate("carts._id");
    next();
});

const usersModel = mongoose.model(userCollection, userSchema);

export default usersModel;
