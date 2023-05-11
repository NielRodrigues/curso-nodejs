import Sequelize from "sequelize";
import config from "../config/database";

import Customer from "../apps/models/Customer";
import Contact from "../apps/models/Contact";
import User from "../apps/models/User";
import File from "../apps/models/File";

const models = [Customer, Contact, User, File];

class Database {
  constructor() {
    this.connection = new Sequelize(config);
    this.init();
    this.associate();
  }

  init() {
    models.forEach((model) => model.init(this.connection));
  }

  associate() {
    models.forEach((model) => {
      if (model.associate) {
        model.associate(this.connection.models);
      }
    });
  }
}

export default new Database();
