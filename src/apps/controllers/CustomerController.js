import * as Yup from "yup";
import { Op } from "sequelize";
import { parseISO } from "date-fns";

import Customer from "../models/Customer";
import Contact from "../models/Contact";

class CustomerController {
  async index(request, response) {
    const {
      name,
      email,
      status,
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

    if (status) {
      where = {
        ...where,
        status: {
          [Op.in]: status.split(",").map((item) => item.toUpperCase()),
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

    const data = await Customer.findAll({
      where,
      // include: [
      //   {
      //     model: Contact,
      //     attributes: ["id", "status"],
      //   },
      // ],
      order,
      limit,
      offset: limit * page - limit,
    });

    return response.json(data);
  }

  async show(request, response) {
    const customer = await Customer.findByPk(request.params.id);

    if (!customer) {
      return response.status(404).json({});
    }

    return response.json(customer);
  }

  async create(request, response) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().email().required(),
      status: Yup.string().uppercase(),
    });

    if (!(await schema.isValid(request.body))) {
      return response.status(400).json({ error: "Error on validate shema." });
    }

    const customer = await Customer.create(request.body);

    return response.status(201).json(customer);
  }

  async update(request, response) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      status: Yup.string().uppercase(),
    });

    if (!(await schema.isValid(request.body))) {
      return response.status(400).json({ error: "Error on validate shema." });
    }

    const customer = await Customer.findByPk(request.params.id);

    if (!customer) {
      return response.status(404).json();
    }

    await customer.update(request.body);

    return response.json(customer);
  }

  async delete(request, response) {
    const customer = await Customer.findByPk(request.params.id);

    if (!customer) {
      return response.status(404).json();
    }

    await customer.destroy();

    return response.json();
  }
}

export default new CustomerController();
