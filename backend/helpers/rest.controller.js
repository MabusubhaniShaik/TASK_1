class RestController {
  constructor(model) {
    this.Model = model;
    this.bindMethods();
  }

  // === Bind class methods to instance ===
  bindMethods() {
    [
      "create",
      "findAll",
      "handleGet",
      "getById",
      "update",
      "delete",
      "buildIdQuery",
      "buildQuery",
      "preSave",
      "postSave",
    ].forEach((method) => {
      if (this[method]) this[method] = this[method].bind(this);
    });
  }

  // === Hooks (can override per controller) ===
  async preSave(payload, mode, ctx) {
    return payload;
  }

  async postSave(doc, mode, ctx) {
    return doc;
  }

  // === Build ID query dynamically ===
  buildIdQuery(id) {
    if (!id) return {};
    const orConditions = [{ id }, { _id: id }];

    // Add string fields from query params dynamically
    Object.keys(this.Model.schema.paths).forEach((key) => {
      if (this.Model.schema.paths[key].instance === "String") {
        orConditions.push({ [key]: id });
      }
    });

    return { $or: orConditions };
  }

  // === Build dynamic query from request query params ===
  buildQuery(filters = {}) {
    const query = {};

    for (const [key, value] of Object.entries(filters)) {
      if (value === "") continue;

      if (key === "id" || key === "_id") {
        Object.assign(query, this.buildIdQuery(value));
        continue;
      }

      const pathInfo = this.Model.schema.paths[key];
      if (!pathInfo) continue;

      switch ((pathInfo.instance || "").toLowerCase()) {
        case "string":
          query[key] = { $regex: value, $options: "i" };
          break;
        case "boolean":
          query[key] = value === "true";
          break;
        case "number":
        case "date":
          query[key] = isNaN(Number(value)) ? undefined : Number(value);
          break;
        default:
          query[key] = value;
      }
    }

    return query;
  }

  // === CRUD OPERATIONS ===
  async handleGet(req, res) {
    const id = req.params.id || req.query.id || req.query._id;
    return id ? this.getById(req, res) : this.findAll(req, res);
  }

  async getById(req, res) {
    try {
      const id = req.params.id || req.query.id || req.query._id;
      if (!id) return res.status(400).json({ error: "ID parameter required" });

      const query = this.buildIdQuery(id);
      const doc = await this.Model.findOne(query);
      if (!doc)
        return res
          .status(404)
          .json({ error: `Record with ID "${id}" not found` });

      res.status(200).json(doc);
    } catch (err) {
      this.handleError(res, err, "GET_BY_ID");
    }
  }

  async findAll(req, res) {
    try {
      const { page, limit, sort = "-createdAt", ...filters } = req.query;
      const query = this.buildQuery(filters);

      let qb = this.Model.find(query).sort(sort);

      if (page && limit) {
        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.min(Math.max(1, Number(limit)), 100);
        const skip = (pageNum - 1) * limitNum;

        const [total, data] = await Promise.all([
          this.Model.countDocuments(query),
          qb.skip(skip).limit(limitNum).lean(),
        ]);

        return res
          .status(200)
          .json({ total, page: pageNum, limit: limitNum, data });
      }

      const data = await qb.lean();
      res.status(200).json(data);
    } catch (err) {
      this.handleError(res, err, "FIND_ALL");
    }
  }

  async create(req, res) {
    try {
      const ctx = { req, res, user: req.user };
      const payload = await this.preSave(req.body, "create", ctx);

      const doc = await this.Model.create({
        ...payload,
        created_by: ctx.user?.id || "system",
        updated_by: ctx.user?.id || "system",
      });

      const finalDoc = await this.postSave(doc, "create", ctx);
      res.status(201).json(finalDoc);
    } catch (err) {
      this.handleError(res, err, "CREATE", 400);
    }
  }

  async update(req, res) {
    try {
      const ctx = { req, res, user: req.user };
      const id = req.params.id || req.query.id || req.query._id;

      const doc = await this.Model.findOne(this.buildIdQuery(id));
      if (!doc)
        return res
          .status(404)
          .json({ error: `Record with ID "${id}" not found` });

      const payload = await this.preSave(req.body, "update", ctx);
      Object.assign(doc, payload, {
        updated_by: ctx.user?.id || "system",
        updated_at: new Date(),
      });
      await doc.save();

      const finalDoc = await this.postSave(doc, "update", ctx);
      res.status(200).json(finalDoc);
    } catch (err) {
      this.handleError(res, err, "UPDATE", 400);
    }
  }

  async delete(req, res) {
    try {
      const id = req.params.id || req.query.id || req.query._id;

      const doc = await this.Model.findOneAndDelete(this.buildIdQuery(id));
      if (!doc) return res.status(404).json({ error: "Record not found" });

      res.status(200).json(doc);
    } catch (err) {
      this.handleError(res, err, "DELETE");
    }
  }

  // === ERROR HANDLER ===
  handleError(res, err, op, status = 500) {
    console.error(`Error in ${op}:`, err);
    res.status(status).json({ error: err.message || "Unexpected error" });
  }

  // === Public interface ===
  getMethods() {
    return {
      create: this.create,
      findAll: this.findAll,
      findOne: this.handleGet,
      getById: this.getById,
      update: this.update,
      delete: this.delete,
    };
  }
}

module.exports = RestController;
