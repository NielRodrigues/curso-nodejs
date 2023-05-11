// eslint-disable-next-line import/no-extraneous-dependencies
import jwt from "jsonwebtoken";
import { promisify } from "util";

import authCongig from "../../config/auth";

export default async (request, response, next) => {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    return response.status(401).json({ error: "Token was not provider." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = await promisify(jwt.verify)(token, authCongig.secret);

    request.userId = decoded.id;

    return next();
  } catch (error) {
    return response.status(401).json({ error: "Token invalid." });
  }
};
