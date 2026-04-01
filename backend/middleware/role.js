const checkPermission = (requiredRight) => {
  return (req, res, next) => {
    // If it's the owner (no req.employee), they have full rights
    if (!req.employee) {
      return next();
    }

    // Check if the employee's permissions object has this right set to true
    if (req.employee.permissions && req.employee.permissions[requiredRight]) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access denied. You do not have permission to ${requiredRight} records.`,
    });
  };
};

module.exports = checkPermission;
