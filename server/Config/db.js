const mongoose = require("mongoose")

const ConnectDB = async () => {
    try {
        const connect = await mongoose.connect(process.env.MONGO_DB, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
        })

        console.log(`MongoDB connected : ${connect.connection.host}`);
    }
    catch (error) {
        console.log(`Error: ${error.message}`);
        process.exit()
    }
}

module.exports = ConnectDB;