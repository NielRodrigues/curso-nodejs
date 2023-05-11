// eslint-disable-next-line import/no-extraneous-dependencies
import jwt from "jsonwebtoken";
import User from "../models/User";
import authCongig from "../../config/auth";

class SessionsControler {
  async create(request, response) {
    const { email, password } = request.body;

    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return response.status(401).json({ error: "User not found." });
    }

    if (!(await user.checkPassword(password))) {
      return response.status(401).json({ error: "Password not macth." });
    }

    const { id, name } = user;

    return response.json({
      user: { id, name, email },
      token: jwt.sign({ id }, authCongig.secret, {
        expiresIn: authCongig.expiresIn,
      }),
    });
  }
}

export default new SessionsControler();
