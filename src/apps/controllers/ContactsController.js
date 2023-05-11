import * as Yup from "yup";
import { Op } from "sequelize";
import { parseISO } from "date-fns";

import Customer from "../models/Customer";
import Contact from "../models/Contact";

class ContactsController {
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

    let where = { customer_id: request.params.customerId };
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

    const data = await Contact.findAll({
      where,
      include: [
        {
          model: Customer,
          attributes: ["id", "status"],
          required: true,
        },
      ],
      order,
      limit,
      offset: limit * page - limit,
    });

    return response.json(data);
  }

  async show(request, response) {
    const contact = await Contact.findOne({
      where: {
        customer_id: request.params.customerId,
        id: request.params.id,
      },
      attributes: { exclude: ["customer_id"] },
    });

    if (!contact) {
      return response.status(404).json({});
    }

    return response.json(contact);
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

    const contact = await Contact.create({
      customer_id: request.params.customerId,
      ...request.body,
    });

    return response.status(201).json(contact);
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

    const contact = await Contact.findOne({
      where: {
        customer_id: request.params.customerId,
        id: request.params.id,
      },
      attributes: { exclude: ["customer_id"] },
    });

    if (!contact) {
      return response.status(404).json();
    }

    await contact.update(request.body);

    return response.json(contact);
  }

  async delete(request, response) {
    const contact = await Contact.findOne({
      where: {
        customer_id: request.params.customerId,
        id: request.params.id,
      },
      attributes: { exclude: ["customer_id"] },
    });

    if (!contact) {
      return response.status(404).json();
    }

    await contact.destroy();

    return response.json();
  }
}

export default new ContactsController();
