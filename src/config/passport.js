import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
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
                google_id: profile.id,
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
              google_id: profile.id,
              address: "",
              gender: "Nam",
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

  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: process.env.FACEBOOK_CALLBACK_URL,
        profileFields: [
          "id",
          "displayName",
          "emails",
          "photos",
          "gender",
          "first_name",
          "last_name",
        ],
        passReqToCallback: true,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          const facebook_id = profile.id;
          const email =
            profile.emails && profile.emails[0]
              ? profile.emails[0].value
              : null;
          const first_name =
            profile.first_name || profile.displayName.split(" ")[0] || "";
          const last_name =
            profile.last_name ||
            profile.displayName.split(" ").slice(1).join(" ") ||
            "";
          const avatar =
            profile.photos && profile.photos[0]
              ? profile.photos[0].value
              : null;

          let gender = null;
          if (profile.gender === "male") {
            gender = "Nam";
          } else if (profile.gender === "female") {
            gender = "Nữ";
          }

          let user = await db.User.findOne({
            where: { facebook_id: facebook_id },
          });

          if (user) {
            await db.User.update(
              {
                first_name: first_name || user.first_name,
                last_name: last_name || user.last_name,
                avatar: avatar || user.avatar,
                gender: gender !== null ? gender : user.gender,
              },
              { where: { facebook_id: facebook_id } }
            );
            let updatedUser = await db.User.findOne({
              where: { facebook_id: facebook_id },
            });
            return done(null, updatedUser);
          } else {
            if (email) {
              let existingUserByEmail = await db.User.findOne({
                where: { email: email },
              });
              if (existingUserByEmail) {
                await db.User.update(
                  {
                    facebook_id: facebook_id,
                    first_name: first_name || existingUserByEmail.first_name,
                    last_name: last_name || existingUserByEmail.last_name,
                    avatar: avatar || existingUserByEmail.avatar,
                    gender:
                      gender !== null ? gender : existingUserByEmail.gender,
                  },
                  { where: { email: email } }
                );
                let updatedUser = await db.User.findOne({
                  where: { email: email },
                });
                return done(null, updatedUser);
              }
            }

            let newPassword = Math.random().toString(36).substring(2, 15);
            let hashedPassword = await hashUserPassword(newPassword);

            const newUser = await db.User.create({
              email: email || `facebook_${facebook_id}@example.com`,
              password: hashedPassword,
              first_name: first_name,
              last_name: last_name,
              address: "",
              gender: gender,
              phone: "",
              avatar: avatar,
              role_id: 3,
              position_id: 1,
              facebook_id: facebook_id,
              isVerified: true,
            });
            return done(null, newUser);
          }
        } catch (error) {
          console.error("Lỗi trong FacebookStrategy:", error);
          return done(error, null);
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
