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

      res.status(200).json({
        access_token: access_token,
      });
    } catch (err) {
      next(err);
    }
  }

  static async googleLogin(req, res, next) {
    try {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const redirectUri = process.env.GOOGLE_CALLBACK_URL;

      if (!clientId || !redirectUri) {
        throw {
          name: "BadRequest",
          message: "Google client ID or callback URL missing",
        };
      }

      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: "openid email profile",
        access_type: "offline",
      });

      res.redirect(
        `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
      );
    } catch (err) {
      next(err);
    }
  }

  static async googleCallback(req, res, next) {
    try {
      const { code } = req.query;
      if (!code) {
        throw { name: "BadRequest", message: "Google code missing" };
      }

      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const redirectUri = process.env.GOOGLE_CALLBACK_URL;

      if (!clientId || !clientSecret || !redirectUri) {
        throw { name: "BadRequest", message: "Google OAuth env missing" };
      }

      const tokenRes = await axios.post("https://oauth2.googleapis.com/token", {
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      });

      const accessToken = tokenRes.data?.access_token;
      if (!accessToken) {
        throw { name: "Unauthorized", message: "Google token failed" };
      }

      const userRes = await axios.get(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      const email = userRes.data?.email;
      const displayName = userRes.data?.name || "Google User";

      if (!email) {
        throw { name: "BadRequest", message: "Google email not found" };
      }

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

      const clientUrl = process.env.CLIENT_URL;
      if (!clientUrl) {
        throw { name: "BadRequest", message: "Client URL missing" };
      }
      res.cookie("oauth_token", app_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.redirect(`${clientUrl}/oauth-callback`);
    } catch (err) {
      next(err);
    }
  }

  static async googleVerify(req, res, next) {
    try {
      const { token } = req.body;

      if (!token) {
        throw { name: "BadRequest", message: "Google token missing" };
      }

      const clientId = process.env.GOOGLE_CLIENT_ID;
      if (!clientId) {
        throw { name: "BadRequest", message: "Google client ID missing" };
      }


      let userInfo = null;

      try {
        // Try verifying as ID token first
        const response = await axios.get(
          `https://www.googleapis.com/oauth2/v1/tokeninfo?id_token=${token}`,
        );

        userInfo = response.data;

        // Validate audience for ID token
        if (userInfo.audience !== clientId) {
          console.log(
            "ID token audience mismatch. Expected:",
            clientId,
            "Got:",
            userInfo.audience,
          );
          userInfo = null;
        }
      } catch (idTokenError) {
        console.log("ID token verification failed, trying access token...");

        // If ID token fails, try as access token
        try {
          const accessTokenResponse = await axios.get(
            `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`,
          );

          console.log(
            "Access token verification response:",
            accessTokenResponse.data,
          );

          // For access token, get user info from userinfo endpoint
          const userInfoResponse = await axios.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          console.log("User info fetched:", userInfoResponse.data);
          userInfo = userInfoResponse.data;
        } catch (accessTokenError) {
          console.error("Both ID and access token verification failed:");
          console.error(
            "ID token error:",
            idTokenError.response?.data || idTokenError.message,
          );
          console.error(
            "Access token error:",
            accessTokenError.response?.data || accessTokenError.message,
          );

          throw {
            name: "Unauthorized",
            message:
              accessTokenError.response?.data?.error_description ||
              "Invalid Google token",
          };
        }
      }

      if (!userInfo) {
        throw {
          name: "Unauthorized",
          message: "Unable to verify Google token",
        };
      }

      const email = userInfo.email || userInfo.verified_email;
      const displayName = userInfo.name || "Google User";

      if (!email) {
        throw { name: "BadRequest", message: "Google email not found" };
      }

      // Find or create user
      const [user] = await User.findOrCreate({
        where: { email },
        defaults: {
          email,
          name: displayName,
          password: crypto.randomBytes(16).toString("hex"),
        },
      });

      // Generate JWT token for app
      const access_token = signToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      res.status(200).json({
        access_token: access_token,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AuthController;
