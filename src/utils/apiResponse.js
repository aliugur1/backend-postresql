exports.success = (
  res,
  { message = "İşlem başarılı.", data = null, status = 200 } = {},
) => {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
};

exports.list = (
  res,
  {
    message = "Liste getirildi.",
    data = [],
    page = 1,
    limit = 10,
    totalItems = 0,
    filters = {},
  } = {},
) => {
  const totalPages = Math.ceil(totalItems / limit) || 1;

  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
    filters,
  });
};
