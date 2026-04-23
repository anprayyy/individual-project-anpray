const { CV, Experience, Payment } = require("../models");

// CV
const authorizationCV = async (req, res, next ) => {
    try {
        if (req.user.role === "Admin") return next();
        
        const cv = await CV.findByPk(req.params.id);
        if(!cv) throw { name: "NotFound", message: "CV Not Found" };
        
        if (cv.userId !== req.user.id) {
            throw { name: "Forbidden", message: `You're not authorized` };
        }

        next()
    } catch (err) {
        next(err)
    }
};

// Experience
const authorizationExperience = async (req, res, next) => {
    try {
        if (req.user.role === "Admin") return next();

        const exp = await Experience.findByPk(req.params.id);
        if (!exp) throw { name: "NotFound", message: "Experience Not Found" };

        const cv = await CV.findByPk(exp.cvId);

        if (cv.userId !== req.user.id) {
            throw { name: "Forbidden", message: `You're not authorized` };
        }

        next();
    } catch (err) {
        next(err)
    }
};

// Payment
const authorizationPayment = async (req, res, next) => {
    try {
        if (req.user.role === "Admin") return next();

        const payment = await Payment.findByPk(req.params.id);
        if (!payment) throw { name: "NotFound", message: "Payment Not Found" };

        if (payment.userId !== req.user.id) {
            throw { name: "Forbidden", message: `You're not authorized` };
        }

        next()
    } catch (err) {
        next(err)
    }
};

// Admin Only
const guardAdmin = (req, res, next) => {
    try {
        if (req.user.role === "Admin") return next();
        throw { name: "Forbidden", message: `You're not authorized` };
    } catch (err) {
        next(err)
    }
};

module.exports = { authorizationCV, authorizationExperience, authorizationPayment, guardAdmin };