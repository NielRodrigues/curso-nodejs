import "./database";
// import { Op } from "sequelize";
import Customer from "./apps/models/Customer";
// mport Contact from "./apps/models/Contact";

class Playground {
  static async play() {
    const customer = await Customer.findAll();
    // const customers = await Customer.findAll();

    console.log(
      "\n\n\n==========================================================================================\n\n\n"
    );
    console.log(JSON.stringify(customer, null, 2));
    console.log(
      "\n\n\n==========================================================================================\n\n\n"
    );
  }
}

Playground.play();
