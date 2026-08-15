const express = require('express');

const { coursesService } = require('../services/courses.service');
const { asyncHandler } = require('../utils/async-handler');

const categoriesRouter = express.Router();

categoriesRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const categories = await coursesService.getCategories();

    res.json({
      success: true,
      data: { categories },
    });
  }),
);

module.exports = { categoriesRouter };
