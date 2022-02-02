require('dotenv').config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  setTokenStatusDb,
  createResetTokenDb,
  deleteResetTokenDb,
  isValidTokenDb,
} = require("../db/auth.db");
const {validateUser, validatefield} = require("../helpers/validateUser");
const { ErrorHandler } = require("../helpers/error");
const { changeUserPasswordDb } = require("../db/user.db");
const {
  getUserByEmailDb,
  createUserDb,
} = require("../db/user.db");

const mail = require("./mail.service"); // email 

const crypto = require("crypto");
const moment = require("moment");// date formats
const { logger } = require("../utils/logger");
let curDate = moment().format();

class AuthService {
  async signUp(user) {
    try {
      const { password, email, lastname, name,cellno ,street,
        surburb,
        city,
        province } = user;
      if (!email || !password || !lastname || !name || !cellno || !street ||!surburb ||!city ||!province) {
        throw new ErrorHandler(401, "all fields required");
      }

      if (validateUser(email, password)) {
        const message=validatefield(user);
        

        if(message) return { message };

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);  
        
        const userByEmail = await getUserByEmailDb(email);
        
        if (userByEmail) {
          const message="email taken already";
          return {message};
        }
      
        const newUser = await createUserDb({
          ...user,
          password: hashedPassword,
        });
       
        const {myuser,address}=newUser;

        

        const token = await this.signToken({
          id: myuser.user_id,
          roles: myuser.roles
        });
        
       
        const refreshToken = await this.signRefreshToken({
          id: myuser.user_id,
          roles: myuser.roles,
        });
        
        return {
          token,
          refreshToken,
          myuser,
          address
        };
      } else {
       
        throw new ErrorHandler(401, "Input validation error");
      }
    } catch (error) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
  }

  async login(email, password) {
    try {
      if (!validateUser(email, password)) {
        throw new ErrorHandler(403, "Invalid login");
      }

      const user = await getUserByEmailDb(email);

      if (!user) {
        throw new ErrorHandler(403, "Email or password incorrect.");
      }

      if (!user.password) {
        throw new ErrorHandler(403,"something went wrong");
      }

      const {
        password: dbPassword,
        user_id,
        roles,
        lastname,
        name,
      } = user;
      const isCorrectPassword = await bcrypt.compare(password, dbPassword);

      if (!isCorrectPassword) {
        throw new ErrorHandler(403, "Email or password incorrect.");
      }

      const token = await this.signToken({ id: user_id, roles});
      const refreshToken = await this.signRefreshToken({
        id: user_id,
        roles,
      });
      return {
        token,
        refreshToken,
        user: {
          user_id,
          lastname,
          name,
        },
      };
    } catch (error) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
  }

  async generateRefreshToken(data) {
    const payload = await this.verifyRefreshToken(data);

    const token = await this.signToken(payload);
    const refreshToken = await this.signRefreshToken(payload);

    return {
      token,
      refreshToken,
    };
  }

  async forgotPassword(email) {
    const user = await getUserByEmailDb(email);

    if (user) {
      try {
        await setTokenStatusDb(email);

        //Create a random reset token
        var fpSalt = crypto.randomBytes(64).toString("base64");

        //token expires after one hour
        var expireDate = moment().add(1, "h").format();

        await createResetTokenDb({ email, expireDate, fpSalt });

        await mail.forgotPasswordMail(fpSalt, email);
      } catch (error) {
        throw new ErrorHandler(error.statusCode, error.message);
      }
    } else {
      throw new ErrorHandler(400, "Email not found");
    }
  }

  async verifyResetToken(token, email) {
    try {
      await deleteResetTokenDb(curDate);
      const isTokenValid = await isValidTokenDb({
        token,
        email,
        curDate,
      });

      return isTokenValid;
    } catch (error) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
  }

  async resetPassword(password, password2, token, email) {
    const isValidPassword =
      typeof password === "string" && password.trim().length >= 6;

    if (password !== password2) {
      throw new ErrorHandler(400, "Password do not match.");
    }

    if (!isValidPassword) {
      throw new ErrorHandler(
        400,
        "Password length must be at least 6 characters"
      );
    }

    try {
      const isTokenValid = await isValidTokenDb({
        token,
        email,
        curDate,
      });

      if (!isTokenValid)
        throw new ErrorHandler(
          400,
          "Token not found. Please try the reset password process again."
        );

      await setTokenStatusDb(email);

      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);

      await changeUserPasswordDb(hashedPassword, email);
      await mail.resetPasswordMail(email);
    } catch (error) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
  }

  async signToken(data) {
    try {
      
      const token= jwt.sign(data,process.env.SECRET,{
        expiresIn:"1h",
      });
      return token||null;//jwt.sign(data, process.env.SECRET, { expiresIn: "60s" });

    } catch (error) {
      logger.error(error);
      throw new ErrorHandler(500, "An error occurred");
    }
  }

  async signRefreshToken(data) {
    try {
      return jwt.sign(data, process.env.REFRESH_SECRET, { expiresIn: "1h" });
    } catch (error) {
      logger.error(error);
      throw new ErrorHandler(500, error.message);
    }
  }

  async verifyRefreshToken(token) {
    try {
      const payload = jwt.verify(token, process.env.REFRESH_SECRET);
      return {
        id: payload.id,
        roles: payload.roles
      };
    } catch (error) {
      logger.error(error);
      throw new ErrorHandler(500, error.message);
    }
  }
}

module.exports = new AuthService();
