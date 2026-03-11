const crypto = require("crypto");
const User = require("../models/User");

const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hashedPassword = crypto
    .scryptSync(password, salt, 64)
    .toString("hex");

  return `${salt}:${hashedPassword}`;
};

const verifyPassword = (password, storedPassword) => {
  const [salt, hashedPassword] = storedPassword.split(":");

  if (!salt || !hashedPassword) {
    return false;
  }

  const derivedPassword = crypto
    .scryptSync(password, salt, 64)
    .toString("hex");

  return crypto.timingSafeEqual(
    Buffer.from(hashedPassword, "hex"),
    Buffer.from(derivedPassword, "hex")
  );
};

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  mobile: user.mobile,
  state: user.state,
  district: user.district,
});

const signupUser = async (req, res) => {
  try {
    const { name, mobile, password, state, district } = req.body;

    if (!name || !mobile || !password || !state || !district) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ mobile: mobile.trim() });
    if (existingUser) {
      return res.status(409).json({ message: "Mobile number already registered" });
    }

    const user = await User.create({
      name: name.trim(),
      mobile: mobile.trim(),
      password: hashPassword(password),
      state: state.trim(),
      district: district.trim(),
    });

    return res.status(201).json({
      message: "Signup successful",
      user: sanitizeUser(user),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Mobile number already registered" });
    }

    return res.status(500).json({ message: "Failed to signup user" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { mobile, password } = req.body;

    if (!mobile || !password) {
      return res
        .status(400)
        .json({ message: "Mobile number and password are required" });
    }

    const user = await User.findOne({ mobile: mobile.trim() }).select("+password");
    if (!user || !verifyPassword(password, user.password)) {
      return res.status(401).json({ message: "Invalid mobile number or password" });
    }

    return res.json({
      message: "Login successful",
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to login user" });
  }
};

module.exports = {
  signupUser,
  loginUser,
};
