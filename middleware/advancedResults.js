const advancedResults = (model, populate) => async (req, res, next) => {
  let reqQuery = { ...req.query };

  const removeFields = ['select', 'sort', 'page', 'limit'];
  removeFields.forEach(ele => delete reqQuery[ele]);

  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(/\b(gte|gt|lt|lte|in)\b/g, match => `$${match}`);

  let query = model.find(JSON.parse(queryStr));

  //select
  if (req.query.select) {
    const params = req.query.select.split(',').join(' ');
    query = query.select(params);
  }

  //sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('createdAt');
  }

  //pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit) || 100;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments();
  let pagination = {};

  query = query.skip(startIndex).limit(limit);

  if (populate) query.populate(populate);

  const results = await query;

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results
  };

  next();
};

module.exports = advancedResults;
