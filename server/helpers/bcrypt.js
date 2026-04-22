const bcrypt = require('bcryptjs');

const hashPassword = (inPassword) => {
    const salt = bcrypt.genSaltSync(inPassword, salt);
    return hash
}

const comparePassword = (inPassword, hashPassword) => {
    return bcrypt.compareSync(inPassword, hashPassword);
}

module.exports = { hashPassword, comparePassword };
