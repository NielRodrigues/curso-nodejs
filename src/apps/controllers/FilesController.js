import File from "../models/File.js";

class FilesController {
  async create(request, response) {
    const { originalname, filename } = request.file;

    const file = await File.create({ name: originalname, path: filename });

    response.json(file);
  }
}

export default new FilesController();
