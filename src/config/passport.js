import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import db from "../models/index";
import bcrypt from "bcryptjs";

const salt = bcrypt.genSaltSync(10);

let hashUserPassword = (password) => {
  return new Promise(async (resolve, reject) => {
    try {
      let hashPassword = await bcrypt.hashSync(password, salt);
      resolve(hashPassword);
    } catch (e) {
      reject(e);
    }
  });
};

let configPassport = (app) => {
  app.use(passport.initialize());

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        scope: ["profile", "email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let email =
            profile.emails && profile.emails.length > 0
              ? profile.emails[0].value
              : null;

          if (!email) {
            return done(
              new Error("Email không tìm thấy trong tài khoản Google!"),
              null
            );
          }

          let user = await db.User.findOne({
            where: { email: email },
          });

          if (user) {
            await db.User.update(
              {
                first_name: profile.name.givenName || user.first_name,
                last_name: profile.name.familyName || user.last_name,
                avatar:
                  profile.photos && profile.photos.length > 0
                    ? profile.photos[0].value
                    : user.avatar,
                googleId: profile.id,
              },
              { where: { email: email } }
            );
            let updatedUser = await db.User.findOne({
              where: { email: email },
            });
            return done(null, updatedUser);
          } else {
            let newPassword = Math.random().toString(36).substring(2, 15);
            let hashedPassword = await hashUserPassword(newPassword);

            let newUser = await db.User.create({
              email: email,
              password: hashedPassword,
              first_name: profile.name.givenName || "",
              last_name: profile.name.familyName || "",
              avatar:
                profile.photos && profile.photos.length > 0
                  ? profile.photos[0].value
                  : null,
              role_id: 3,
              googleId: profile.id,
              address: "",
              gender: "Nam", // <-- ĐÃ SỬA THÀNH 'Nam' hoặc 'Nữ'
              phone: "",
              position_id: 1,
            });
            return done(null, newUser);
          }
        } catch (e) {
          console.error("Lỗi trong hàm callback của Google Strategy:", e);
          return done(e, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.user_id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      let user = await db.User.findByPk(id);
      done(null, user);
    } catch (error) {
      console.error("Lỗi deserialize user (Passport):", error);
      done(error, null);
    }
  });
};

module.exports = configPassport;
