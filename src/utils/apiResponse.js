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
  // Eğer limit "all", 0 veya tanımsız sa limitsiz kabul et
  const isUnlimited = limit === "all" || parseInt(limit) === 0 || !limit;
  // Limitsiz ise limit veri sayısı kadar olur, değilse gelen limit kullanılır
  const finalLimit = isUnlimited ? totalItems || data.length : parseInt(limit);
  const finalPage = isUnlimited ? 1 : parseInt(page);
  const totalPages = Math.ceil(totalItems / limit) || 1;

  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page: finalPage,
      limit: isUnlimited ? "all" : finalLimit,
      totalItems,
      totalPages,
      hasNextPage: finalPage < totalPages,
      hasPreviousPage: finalPage > 1,
    },
    filters,
  });
};
