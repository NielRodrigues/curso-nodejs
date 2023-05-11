// eslint-disable-next-line import/no-extraneous-dependencies
import * as Yup from "yup";
import { Op } from "sequelize";
// eslint-disable-next-line import/no-extraneous-dependencies
import { parseISO } from "date-fns";

import User from "../models/User";

import Queue from "../../lib/Queue";
import DummyJob from "../jobs/DummyJob";
import WelcomeEmailJob from "../jobs/WelcomeEmailJob";

class UsersControllers {
  async index(request, response) {
    const {
      name,
      email,
      createdBefore,
      createdAfter,
      updatedBefore,
      updatedAfter,
      sort,
    } = request.query;

    const page = request.query.page || 1;
    const limit = request.query.limit || 25;

    let where = {};
    let order = [];

    if (name) {
      where = {
        ...where,
        name: {
          [Op.iLike]: name,
        },
      };
    }

    if (email) {
      where = {
        ...where,
        email: {
          [Op.iLike]: email,
        },
      };
    }

    if (createdBefore) {
      where = {
        ...where,
        createdAt: {
          [Op.gte]: parseISO(createdBefore),
        },
      };
    }

    if (createdAfter) {
      where = {
        ...where,
        createdAt: {
          [Op.lte]: parseISO(createdAfter),
        },
      };
    }

    if (updatedBefore) {
      where = {
        ...where,
        updatedAt: {
          [Op.gte]: parseISO(updatedBefore),
        },
      };
    }

    if (updatedAfter) {
      where = {
        ...where,
        updatedAt: {
          [Op.lte]: parseISO(updatedAfter),
        },
      };
    }

    if (sort) {
      order = sort.split(",").map((item) => item.split(":"));
    }

    const data = await User.findAll({
      attributes: { exclude: ["password", "password_hash"] },
      where,
      order,
      limit,
      offset: limit * page - limit,
    });

    console.log({ userId: request.userId });
    console.log(User.findByPk(request.userId));

    return response.json(data);
  }

  async show(request, response) {
    const user = await User.findByPk(request.params.id, {
      attributes: { exclude: ["password", "password_hash"] },
    });

    if (!user) {
      return response.status(404).json({});
    }

    return response.json(user);
  }

  async create(request, response) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().email().required(),
      password_hash: Yup.string().required().min(8),
      passwordConfirmation: Yup.string().when("password", (password, field) =>
        password ? field.required().oneOf([Yup.ref("password")]) : field
      ),
    });

    if (!(await schema.isValid(request.body))) {
      return response.status(400).json({ error: "Error on validate shema." });
    }

    const { id, name, email, file_id, createdAt, updatedAt } =
      await User.create(request.body);

    await Queue.add(DummyJob.key, { message: "Hello Dummy." });
    await Queue.add(WelcomeEmailJob.key, { name, email });

    return response
      .status(201)
      .json({ id, name, email, file_id, createdAt, updatedAt });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string().min(8),
      password: Yup.string()
        .min(8)
        .when("oldPassword", (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      passwordConfirmation: Yup.string().when("password", (password, field) =>
        password ? field.required().oneOf([Yup.ref("password")]) : field
      ),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: "Error on validate schema." });
    }

    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json();
    }

    const { oldPassword } = req.body;

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: "User password not match." });
    }

    const { id, name, email, file_id, createdAt, updatedAt } =
      await user.update(req.body);

    return res
      .status(201)
      .json({ id, name, email, file_id, createdAt, updatedAt });
  }

  async delete(request, response) {
    const user = await User.findByPk(request.params.id);

    if (!user) {
      return response.status(404).json({});
    }

    await user.destroy();

    return response.json();
  }
}

export default new UsersControllers();
