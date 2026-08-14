const mongoose = require("mongoose")

const getMongoUri = () => {
    const raw = process.env.MONGO_DB || "";
    return raw.trim().replace(/^["']|["']$/g, "");
}

const ConnectDB = async () => {
    const mongoUri = getMongoUri();

    if (!mongoUri) {
        console.error("MongoDB connection failed: MONGO_DB is not set.");
        process.exit(1);
    }

    try {
        const connect = await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
        })

        console.log(`MongoDB connected : ${connect.connection.host}`);
    }
    catch (error) {
        const message = error.message || String(error);
        console.error(`MongoDB connection failed: ${message}`);
        if (/bad auth|authentication failed/i.test(message)) {
            console.error(
                "Check the MONGO_DB value on Render: username/password, URL-encode special characters in the password, and confirm the Atlas database user exists."
            );
        }
        process.exit(1);
    }
}

module.exports = ConnectDB;