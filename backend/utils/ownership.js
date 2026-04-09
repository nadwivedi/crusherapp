const scopedFilter = (req, filter = {}) => ({
  userId: req.userId,
  ...filter,
});

const scopedIdFilter = (req, id, filter = {}) => scopedFilter(req, {
  _id: id,
  ...filter,
});

module.exports = {
  scopedFilter,
  scopedIdFilter,
};
