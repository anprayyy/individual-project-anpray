const crypto = require("crypto");
const axios = require("axios");
const { comparePassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");
const { User } = require("../models");

class AuthController {
  static async register(req, res, next) {
    try {
      const { email, password, name } = req.body;
      const data = await User.create({
        email: email,
        password: password,
        name: name,
      });

      const result = data.toJSON();
      delete result.password;
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email) {
        throw { name: "BadRequest", message: "Email is required" };
      }

      if (!password) {
        throw { name: "BadRequest", message: "Password is required" };
      }

      const user = await User.findOne({
        where: {
          email,
        },
      });

      if (!user)
        throw { name: "Unauthorized", message: "Invalid Email/password" };

      const checkPassword = comparePassword(password, user.password);

      if (!checkPassword)
        throw { name: "Unauthorized", message: "Invalid Email/password" };

      const access_token = signToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });
      console.log(access_token);

      res.status(200).json({
        access_token: access_token,
      });
    } catch (err) {
      next(err);
    }
  }

  static async githubLogin(req, res, next) {
    try {
      const clientId = process.env.GITHUB_CLIENT_ID;
      const redirectUri =
        process.env.GITHUB_CALLBACK_URL ||
        "http://localhost:3000/auth/github/callback";

      if (!clientId) {
        throw { name: "BadRequest", message: "GitHub client ID missing" };
      }

      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        scope: "user:email",
      });

      res.redirect(
        `https://github.com/login/oauth/authorize?${params.toString()}`,
      );
    } catch (err) {
      next(err);
    }
  }

  static async githubCallback(req, res, next) {
    try {
      const { code } = req.query;
      if (!code) {
        throw { name: "BadRequest", message: "GitHub code missing" };
      }

      const clientId = process.env.GITHUB_CLIENT_ID;
      const clientSecret = process.env.GITHUB_CLIENT_SECRET;
      const redirectUri =
        process.env.GITHUB_CALLBACK_URL ||
        "http://localhost:3000/auth/github/callback";

      if (!clientId || !clientSecret) {
        throw { name: "BadRequest", message: "GitHub OAuth env missing" };
      }

      const tokenRes = await axios.post(
        "https://github.com/login/oauth/access_token",
        {
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: redirectUri,
        },
        {
          headers: { Accept: "application/json" },
        },
      );

      const accessToken = tokenRes.data?.access_token;
      if (!accessToken) {
        throw { name: "Unauthorized", message: "GitHub token failed" };
      }

      const userRes = await axios.get("https://api.github.com/user", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const emailsRes = await axios.get("https://api.github.com/user/emails", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const emails = Array.isArray(emailsRes.data) ? emailsRes.data : [];
      const primaryEmail = emails.find((item) => item.primary && item.verified);
      const email =
        primaryEmail?.email || userRes.data?.email || emails[0]?.email;

      if (!email) {
        throw { name: "BadRequest", message: "GitHub email not found" };
      }

      const displayName =
        userRes.data?.name || userRes.data?.login || "GitHub User";

      const [user] = await User.findOrCreate({
        where: { email },
        defaults: {
          email,
          name: displayName,
          password: crypto.randomBytes(16).toString("hex"),
        },
      });

      const access_token = signToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
      res.redirect(`${clientUrl}/login?token=${access_token}`);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AuthController;
