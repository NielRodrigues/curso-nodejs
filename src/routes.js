import { Router } from "express";

import auth from "./apps/middlewares/auth";
// eslint-disable-next-line import/no-extraneous-dependencies, import/order
import multer from "multer";
import multerConfig from "./config/multer";

import customers from "./apps/controllers/CustomerController";
import contacts from "./apps/controllers/ContactsController";
import users from "./apps/controllers/UsersController";
import sessions from "./apps/controllers/SessionsControllers";
import files from "./apps/controllers/FilesController";

const routes = new Router();
const upload = multer(multerConfig);

// Sessions
routes.post("/sessions", sessions.create);

// Controla o acesso desse ponto
routes.use(auth);

// Customers
routes.get("/customers", customers.index);
routes.get("/customers/:id", customers.show);
routes.post("/customers", customers.create);
routes.put("/customers/:id", customers.update);
routes.delete("/customers/:id", customers.delete);

// Contacts
routes.get("/customers/:customerId/contacts", contacts.index);
routes.get("/customers/:customerId/contacts/:id", contacts.show);
routes.post("/customers/:customerId/contacts", contacts.create);
routes.put("/customers/:customerId/contacts/:id", contacts.update);
routes.delete("/customers/:customerId/contacts/:id", contacts.delete);

// Users
routes.get("/users", users.index);
routes.get("/users/:id", users.show);
routes.post("/users", users.create);
routes.put("/users/:id", users.update);
routes.delete("/users/:id", users.delete);

// Files
// eslint-disable-next-line arrow-body-style
routes.post("/files", upload.single("file"), files.create);

export default routes;
