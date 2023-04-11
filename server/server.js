const express = require("express");
const dotenv = require("dotenv");
const { data } = require("./data/data"); 
const ConnectDB = require("./Config/db");
const userRoutes = require("./Routes/userRoutes");
const { notFound, errorHandler } = require("./Middlewares/errorMiddleware");

dotenv.config()

ConnectDB()
const app = express();

app.use(express.json())
app.get("/", (req, res) => {
    res.send("API of chit chat is running")
})

app.use('/api/user', userRoutes)

app.use( notFound )
app.use( errorHandler )

const PORT = process.env.PORT || 5000
app.listen(PORT , console.log(`server started at ${PORT}`))

