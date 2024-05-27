const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");
const User = require("../models/user");
const { sendVerificationLink } = require("../helpers/emails/email");



/*
 * @POST
 * Desc
 * postSignUpUser()
 */
exports.postSignUpUser = async (req, res, next) => {
  try {
    // Define validation middlewares
    await Promise.all(
      [
        body("name").notEmpty().withMessage("Name is required"),
        body("email").isEmail().withMessage("Invalid email"),
        body("phone").notEmpty().withMessage("Phone number is required"),
        body("password")
          .isLength({ min: 6 })
          .withMessage("Password must be at least 6 characters long"),
      ].map((validation) => validation.run(req))
    );

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, password } = req.body;

    // Hash the password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const currentDate = new Date();
    const nextFiveMinutes = new Date(currentDate.getTime() + 5 * 60 * 1000);
    const verifyToken = Array(50)
      .fill(0)
      .map((x) => ((Math.random() * 36) | 0).toString(36))
      .join("");

    const payload = {
      name,
      email,
      phone,
      password: hashedPassword,
      emailVerificationSettings: {
        emailVerified: false,
        emailVerificationLink: verifyToken,
        emailVerificationLinkExpires: nextFiveMinutes,
      },
      twoFaSettings: {
        TwoFaRequired: false,
        TwoFaType: "none",
      },
    };

    const createUser = await new User(payload).save();

    if (createUser) {
      await sendVerificationLink(
        "testcompany@x.com",
        "test@x.com",
        "Verify Your Email Address",
        verifyToken
      );
      return res.status(200).json({ msg: "User registered successfully" });
    }

    return res.status(500).json({ msg: "Failed to register user" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

/*
 * @POST
 * Desc
 * postSignInUser()
 */

exports.postSignInUser = async (req, res, next) => {
  const { email, password } = req.body;
  try {

    console.log(req);

    // For now, just send a success message
    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error("Login error:", error);
    res.send({status:400, message: error.msg });
  }
};


/*
 * @POST
 * Desc
 * verifyUserEmail()
 */

exports.verifyUserEmail = async (req, res, next) => {
  const { token } = req.params;

  console.log(req.session);

  // Check if the token is provided
  if (!token) {
    return res.status(400).json({ error: "Token is required" });
  }

  try {
    // Find the user with the provided token
    const user = await User.findOne({
      "emailVerificationSettings.emailVerificationLink": token,
    }).exec();

    // If no user is found, return an error
    if (!user) {
      return res.status(404).json({ error: "Invalid link" });
    }

    // Check if the email is already verified
    const isEmailVerified = user.emailVerificationSettings.emailVerified;
    if (isEmailVerified) {
      return res.status(200).json({ message: "Email is already verified" });
    }

    // Check if the token has expired
    const currentTime = new Date().getTime();
    const tokenExpirationTime = new Date(
      user.emailVerificationSettings.emailVerificationLinkExpires
    ).getTime();

    if (tokenExpirationTime < currentTime) {
      return res.status(400).json({
        error: "Link is expired or invalid. Request for a new link",
      });
    }

    // Update the user document with email verification
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        "emailVerificationSettings.emailVerified": true,
        "emailVerificationSettings.emailVerificationLink": null,
        "emailVerificationSettings.emailVerificationLinkExpires": null,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(500).json({ error: "Failed to update user" });
    }

    return res.status(200).json({ message: "Email verified" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
