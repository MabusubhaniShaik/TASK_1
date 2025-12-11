// src/controllers/rest.controller.js
const mongoose = require("mongoose");
const ResponseFormatter = require("../utils/response.formatter");

class RestController {
  constructor(model, options = {}) {
    this.Model = model;
    this.options = {
      preSave: options.preSave || ((d) => d),
      postSave: options.postSave || ((d) => d),
      softDelete: options.softDelete || false,
    };
  }

  buildIdQuery(id) {
    if (mongoose.Types.ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id)) {
      return { _id: id };
    }
    const numericId = parseInt(id);
    return !isNaN(numericId) ? { id: numericId } : { id: id };
  }

  buildQuery(filters = {}) {
    const { page, limit, sort, fields, ...query } = filters;
    if (this.options.softDelete) query.deleted_at = null;
    return query;
  }

  async create(req, res) {
    try {
      const data = await this.options.preSave(req.body, "create", req);
      const document = new this.Model({
        ...data,
        created_by: req.user?.id || "system",
        updated_by: req.user?.id || "system",
      });
      await document.save();
      const finalDoc = await this.options.postSave(document, "create", req);

      // Use dynamic success message
      res
        .status(201)
        .json(ResponseFormatter.createSuccess(this.Model, finalDoc));
    } catch (error) {
      res
        .status(400)
        .json(
          ResponseFormatter.error(
            error.name === "ValidationError"
              ? ResponseFormatter.messages.VALIDATION_ERROR
              : error.message,
            error.errors
          )
        );
    }
  }

  async findAll(req, res) {
    try {
      const {
        page,
        limit,
        sort = "-created_date",
        fields,
        ...filters
      } = req.query;
      const query = this.buildQuery(filters);

      let queryBuilder = this.Model.find(query);
      if (sort) queryBuilder = queryBuilder.sort(sort);
      if (fields)
        queryBuilder = queryBuilder.select(fields.split(",").join(" "));

      // Check if BOTH page AND limit parameters exist (even if empty)
      const hasPageParam = page !== undefined;
      const hasLimitParam = limit !== undefined;

      if (hasPageParam && hasLimitParam) {
        // Try to parse both values
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        // If either is invalid, treat as no pagination
        if (isNaN(pageNum) || pageNum < 1 || isNaN(limitNum) || limitNum < 1) {
          const documents = await queryBuilder.lean();
          return res
            .status(200)
            .json(
              ResponseFormatter.success(
                ResponseFormatter.messages.FETCH_ALL_SUCCESS(
                  ResponseFormatter.getResourceName(this.Model)
                ),
                documents,
                documents.length
              )
            );
        }

        // Valid pagination - show pagination
        const skip = (pageNum - 1) * limitNum;

        const [total, documents] = await Promise.all([
          this.Model.countDocuments(query),
          queryBuilder.skip(skip).limit(limitNum).lean(),
        ]);

        const pagination = ResponseFormatter.paginate(total, pageNum, limitNum);
        return res
          .status(200)
          .json(
            ResponseFormatter.fetchAllSuccess(this.Model, documents, pagination)
          );
      }

      // WITHOUT pagination (missing either page or limit)
      const documents = await queryBuilder.lean();

      res
        .status(200)
        .json(
          ResponseFormatter.success(
            ResponseFormatter.messages.FETCH_ALL_SUCCESS(
              ResponseFormatter.getResourceName(this.Model)
            ),
            documents,
            documents.length
          )
        );
    } catch (error) {
      res.status(500).json(ResponseFormatter.error(error.message));
    }
  }

  async findOne(req, res) {
    try {
      const { id } = req.params;
      const { fields } = req.query;
      const query = this.buildIdQuery(id);
      if (this.options.softDelete) query.deleted_at = null;

      let document = this.Model.findOne(query);
      if (fields) document = document.select(fields.split(",").join(" "));

      const result = await document;
      if (!result) {
        return res
          .status(404)
          .json(
            ResponseFormatter.error(
              ResponseFormatter.messages.NOT_FOUND(
                ResponseFormatter.getResourceName(this.Model)
              )
            )
          );
      }

      // Use dynamic success message
      res
        .status(200)
        .json(ResponseFormatter.fetchOneSuccess(this.Model, result));
    } catch (error) {
      res.status(500).json(ResponseFormatter.error(error.message));
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const query = this.buildIdQuery(id);
      if (this.options.softDelete) query.deleted_at = null;

      const document = await this.Model.findOne(query);
      if (!document) {
        return res
          .status(404)
          .json(
            ResponseFormatter.error(
              ResponseFormatter.messages.NOT_FOUND(
                ResponseFormatter.getResourceName(this.Model)
              )
            )
          );
      }

      const updateData = await this.options.preSave(req.body, "update", req);
      Object.assign(document, updateData);
      document.updated_by = req.user?.id || "system";

      await document.save();
      const finalDoc = await this.options.postSave(document, "update", req);

      // Use dynamic success message
      res
        .status(200)
        .json(ResponseFormatter.updateSuccess(this.Model, finalDoc));
    } catch (error) {
      res
        .status(400)
        .json(
          ResponseFormatter.error(
            error.name === "ValidationError"
              ? ResponseFormatter.messages.VALIDATION_ERROR
              : error.message,
            error.errors
          )
        );
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const query = this.buildIdQuery(id);
      const permanentDelete = req.query.permanent === "true";

      if (this.options.softDelete && !permanentDelete) {
        const result = await this.Model.findOneAndUpdate(
          query,
          {
            deleted_at: new Date(),
            deleted_by: req.user?.id || "system",
          },
          { new: true }
        );

        if (!result) {
          return res
            .status(404)
            .json(
              ResponseFormatter.error(
                ResponseFormatter.messages.NOT_FOUND(
                  ResponseFormatter.getResourceName(this.Model)
                )
              )
            );
        }

        return res
          .status(200)
          .json(
            ResponseFormatter.success(
              ResponseFormatter.messages.SOFT_DELETE_SUCCESS(
                ResponseFormatter.getResourceName(this.Model)
              ),
              result
            )
          );
      }

      const result = await this.Model.findOneAndDelete(query);
      if (!result) {
        return res
          .status(404)
          .json(
            ResponseFormatter.error(
              ResponseFormatter.messages.NOT_FOUND(
                ResponseFormatter.getResourceName(this.Model)
              )
            )
          );
      }

      // Use dynamic success message
      res
        .status(200)
        .json(ResponseFormatter.deleteSuccess(this.Model, { deletedId: id }));
    } catch (error) {
      res.status(500).json(ResponseFormatter.error(error.message));
    }
  }

  getMethods() {
    return {
      create: this.create.bind(this),
      findAll: this.findAll.bind(this),
      findOne: this.findOne.bind(this),
      update: this.update.bind(this),
      delete: this.delete.bind(this),
    };
  }
}

module.exports = RestController;
