import mongoose from "mongoose";

const userCollection = "users";

const userSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    email: String,
    age: Number,
    password: String,
});

const usersModel = mongoose.model(userCollection, userSchema);

export default usersModel;
