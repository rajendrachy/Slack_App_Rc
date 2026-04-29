import { ENV } from "../src/config/env.js";
import mongoose from "mongoose";
import { StreamChat } from "stream-chat";

async function testConnections() {
    console.log("Testing connections...");
    
    // Test DB
    try {
        console.log("Testing MongoDB connection...");
        await mongoose.connect(ENV.MONGO_URI);
        console.log("✅ MongoDB connected.");
        await mongoose.disconnect();
    } catch (err) {
        console.error("❌ MongoDB connection failed:", err.message);
    }

    // Test Stream Chat
    try {
        console.log("Testing Stream Chat connection...");
        const serverClient = StreamChat.getInstance(ENV.STREAM_API_KEY, ENV.STREAM_API_SECRET);
        // Just try to list some users or something basic
        await serverClient.queryUsers({ id: { $in: ['test'] } });
        console.log("✅ Stream Chat connection successful.");
    } catch (err) {
        console.error("❌ Stream Chat connection failed:", err.message);
    }

    process.exit(0);
}

testConnections();
