import mongoose from "mongoose";

export default async function mongoConnect() {

    try{
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to MongoDB");
    } catch(e){
        console.error(`Failed to connect to MongoDB: ${e.message}`);
        process.exit(1);
    }
}