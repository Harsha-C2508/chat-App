const jwt = require("jsonwebtoken");

const tokenCreate = (id) => {
    return jwt.sign({id}, process.env.JWT_TOKEN, {
        expiresIn: "60d"
    })
};

module.exports = tokenCreate