const { User, CV, Experience, Payment } = require("../models");

class ExperienceController {
  static async createExperience(req, res, next) {
    try {
      const { company, position, startDate, endDate, description, cvId } =
        req.body;

      // cek CV ada atau tidak
      const cv = await CV.findByPk(cvId);
      if (!cv) throw { name: "NotFound", message: "CV Not Found" };

      const experience = await Experience.create({
        company,
        position,
        startDate,
        endDate,
        description,
        cvId,
      });

      res.status(201).json(experience);
    } catch (err) {
      next(err);
    }
  }
  static async getExperienceByCV(req, res, next) {
    try {
      const { cvId } = req.params;

      const experiences = await Experience.findAll({
        where: { cvId: cvId },
        order: [["startDate", "DESC"]],
      });

      res.status(200).json(experiences);
    } catch (err) {
      next(err);
    }
  }
  static async updateExperience(req, res, next) {
    try {
      const { id } = req.params;

      const experience = await Experience.findByPk(id);
      if (!experience)
        throw { name: "NotFound", message: "Experience Not Found" };

      const { company, position, startDate, endDate, description } = req.body;

      await experience.update({
        company,
        position,
        startDate,
        endDate,
        description,
      });

      res.status(200).json(experience);
    } catch (err) {
      next(err);
    }
  }
  static async deleteExperience(req, res, next) {
    try {
      const { id } = req.params;

      const experience = await Experience.findByPk(id);
      if (!experience)
        throw { name: "NotFound", message: "Experience Not Found" };

      await experience.destroy();

      res.status(200).json({ message: "Experience deleted" });
    } catch (err) {
      next(err);
    }
  }
  static async bulkCreate(req, res, next) {
    try {
      const { cvId, experiences } = req.body;

      await Experience.destroy({ where: { cvId } });

      const data = experiences.map((exp) => ({
        ...exp,
        cvId,
      }));

      if (data.length > 0) {
        await Experience.bulkCreate(data);
      }

      res.status(201).json({ message: "Experiences created" });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ExperienceController;
