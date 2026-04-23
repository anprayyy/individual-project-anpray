const { User, CV, Experience, Payment } = require("../models");

class PaymentController {
  static async createPayment(req, res, next) {
    try {
      const { amount } = req.body;

      const payment = await Payment.create({
        userId: req.user.id,
        transactionId: "TRX-" + Date.now(),
        amount,
        status: "PENDING",
      });

      res.status(201).json(payment);
    } catch (err) {
      next(err);
    }
  }
  static async getMyPayments(req, res, next) {
    try {
      const payments = await Payment.findAll({
        where: { userId: req.user.id },
        order: [["createdAt", "DESC"]],
      });

      res.status(200).json(payments);
    } catch (err) {
      next(err);
    }
  }
  static async updatePaymentStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const payment = await Payment.findByPk(id);
      if (!payment) throw { name: "NotFound", message: "Payment Not Found" };

      await payment.update({ status });

      res.status(200).json(payment);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = PaymentController;
