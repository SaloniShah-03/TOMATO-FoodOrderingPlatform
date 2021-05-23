const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const Account = require("../models/account");
const Seller = require("../models/seller");

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: process.env.SENDGRID_KEY,
    },
  })
);

exports.signupUser = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation Failed, Incorrect data entered.");
    error.statusCode = 422;
    error.errors = errors.array();
    throw error;
  }

  const email = req.body.email;
  const firstName = req.body.firstName;
  const password = req.body.password;
  const lastName = req.body.lastName;
  const role = req.body.role;
  let token;

  if (role !== "ROLE_USER") {
    const error = new Error(
      "Signing up an user should have a role of ROLE_USER"
    );
    error.statusCode = 500;
    throw error;
  }

  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      token = crypto.randomBytes(32).toString("hex");

      const account = new Account({
        role: role,
        email: email,
        password: hashedPassword,
        accountVerifyToken: token,
        accountVerifyTokenExpiration: Date.now() + 3600000,
      });
      return account.save();
    })
    .then((savedAccount) => {
      const user = new User({
        firstName: firstName,
        lastName: lastName,
        account: savedAccount,
      });
      return user.save();
    })
    .then((savedUser) => {
      transporter.sendMail({
        to: email,
        from: "help.tomato@gmail.com",
        subject: "Email Verification - Tomato",
        html: `
        <!DOCTYPE html
        PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml" lang="en-GB">
      
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>Tomato - Verification</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
        <style type="text/css">
          a[x-apple-data-detectors] {
            color: inherit !important;
          }
        </style>
      
      </head>
      
      <body style="margin: 0; padding: 0;" bgcolor="#D8D8D8">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="padding: 20px 0 30px 0;">
      
              <table align="center" border="0" cellpadding="0" cellspacing="0" width="600"
                style="border-collapse: collapse; border: 1px solid #feefe6;">
                <tr>
                  <td align="center" bgcolor="#ffffff" style="padding: 40px 0 30px 0;">
                    <img src="https://i.imgur.com/aDzIWwN.png" alt="Food Delivery." width="300" height="230"
                      style="display: block;" />
                  </td>
                </tr>
                <tr bgcolor="#ffffff">
                  <td style="padding: 40px 30px 40px 30px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%"
                      style="border-collapse: collapse;">
                      <tr>
                        <td style="color: #153643; font-family: Arial, sans-serif;">
                          <h1 style="font-size: 24px; margin: 0;">Email Verification - Tomato</h1>
                        </td>
                      </tr>
                      <tr>
                        <td
                          style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 24px; padding: 20px 0 30px 0;">
                          <p style="margin: 0;">Tomato is an Indian restaurant aggregator and food
                            delivery start-up. Tomato provides information and menus of restaurants as
                            well as food delivery options from partner restaurants in select
                            cities. 
                            <br>To start using our services you need to verify your account.<br>
                            Click this <a
                              href="http://localhost:3002/auth/verify/${token}">link</a> to verify
                            your account.</p>
                            <br><br>
                            ~ Team Tomato
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td bgcolor="#ee4c50" style="padding: 30px 30px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%"
                      style="border-collapse: collapse;">
                      <tr>
                        <td style="color: #ffffff; font-family: Arial, sans-serif; font-size: 14px;">
                          <p style="margin: 0;">&reg; Tomato 2020<br />
                            <a href="#" style="color: #ffffff;">Unsubscribe</a> to this newsletter
                            instantly</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
      
            </td>
          </tr>
        </table>
      </body>
      
      </html>
                    `,
      });
      res.status(201).json({
        message:
          "User signed-up successfully, please verify your email before logging in.",
        userId: savedUser._id,
      });
    })
    .catch((err) => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

exports.verifyAccount = (req, res, next) => {
  const token = req.params.token;
  Account.findOne({
    accountVerifyToken: token,
    accountVerifyTokenExpiration: { $gt: Date.now() },
  })
    .then((account) => {
      if (!account) {
        const error = new Error(
          "Token in the url is tempered, don't try to fool me!"
        );
        error.statusCode = 403;
        throw error;
      }
      account.isVerified = true;
      account.accountVerifyToken = undefined;
      account.accountVerifyTokenExpiration = undefined;
      return account.save();
    })
    .then((account) => {
      res.json({ message: "Account verified successfully." });
    })
    .catch((err) => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

exports.login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;

  Account.findOne({ email: email })
    .then((account) => {
      if (!account) {
        const error = new Error("Invalid email/password combination.");
        error.statusCode = 401;
        throw error;
      }
      loadedUser = account;
      return bcrypt.compare(password, account.password);
    })
    .then((isEqual) => {
      if (!isEqual) {
        const error = new Error("Invalid email/password combination.");
        error.statusCode = 401;
        throw error;
      }
      if (loadedUser.isVerified === false) {
        const error = new Error(
          "Verify your email before accessing the platform."
        );
        error.statusCode = 401;
        throw error;
      }
      const token = jwt.sign(
        { accountId: loadedUser._id.toString() },
        "supersecretkey-tomato",
        { expiresIn: "10h" }
      );
      res.status(200).json({ message: "Logged-in successfully", token: token });
    })
    .catch((err) => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

exports.signupSeller = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation Failed, Incorrect data entered.");
    error.statusCode = 422;
    error.errors = errors.array();
    throw error;
  }

  if (req.files.length == 0) {
    const error = new Error("Upload an image as well.");
    error.statusCode = 422;
    throw error;
  }

  const arrayFiles = req.files.map((file) => file.path);
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;
  const tags = req.body.tags;
  const role = req.body.role;
  const payment = req.body.payment;
  const paymentArray = payment.split(" ");
  const minOrderAmount = req.body.minOrderAmount;
  const costForOne = req.body.costForOne;
  const phoneNo = req.body.phoneNo;
  const street = req.body.street;
  const aptName = req.body.aptName;
  const formattedAddress = req.body.formattedAddress;
  const lat = req.body.lat;
  const lng = req.body.lng;
  const locality = req.body.locality;
  const zip = req.body.zip;

  let token;

  if (role !== "ROLE_SELLER") {
    const error = new Error(
      "Signing up a seller should have a role of ROLE_SELLER"
    );
    error.statusCode = 500;
    throw error;
  }

  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      token = crypto.randomBytes(32).toString("hex");

      const account = new Account({
        role: role,
        email: email,
        password: hashedPassword,
        accountVerifyToken: token,
        accountVerifyTokenExpiration: Date.now() + 3600000,
      });
      return account.save();
    })
    .then((savedAccount) => {
      const seller = new Seller({
        name: name,
        tags: tags,
        imageUrl: arrayFiles,
        minOrderAmount: minOrderAmount,
        costForOne: costForOne,
        account: savedAccount,
        payment: paymentArray,
        formattedAddress: formattedAddress,
        address: {
          street: street,
          zip: zip,
          phoneNo: phoneNo,
          locality: locality,
          aptName: aptName,
          lat: lat,
          lng: lng,
        },
      });
      return seller.save();
    })
    .then((savedSeller) => {
      transporter.sendMail({
        to: email,
        from: "help.tomato@gmail.com",
        subject: "Email Verification - Tomato",
        html: `
        <!DOCTYPE html
        PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml" lang="en-GB">
      
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>Tomato - Verification</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
        <style type="text/css">
          a[x-apple-data-detectors] {
            color: inherit !important;
          }
        </style>
      
      </head>
      
      <body style="margin: 0; padding: 0;" bgcolor="#D8D8D8">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="padding: 20px 0 30px 0;">
      
              <table align="center" border="0" cellpadding="0" cellspacing="0" width="600"
                style="border-collapse: collapse; border: 1px solid #feefe6;">
                <tr>
                  <td align="center" bgcolor="#ffffff" style="padding: 40px 0 30px 0;">
                    <img src="https://i.imgur.com/aDzIWwN.png" alt="Food Delivery." width="300" height="230"
                      style="display: block;" />
                  </td>
                </tr>
                <tr bgcolor="#ffffff">
                  <td style="padding: 40px 30px 40px 30px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%"
                      style="border-collapse: collapse;">
                      <tr>
                        <td style="color: #153643; font-family: Arial, sans-serif;">
                          <h1 style="font-size: 24px; margin: 0;">Email Verification - Tomato</h1>
                        </td>
                      </tr>
                      <tr>
                        <td
                          style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 24px; padding: 20px 0 30px 0;">
                          <p style="margin: 0;">Tomato is an Indian restaurant aggregator and food
                            delivery start-up. Tomato provides information and menus of restaurants as
                            well as food delivery options from partner restaurants in select
                            cities. 
                            <br>To start using our services you need to verify your account.<br>
                            Click this <a
                              href="http://localhost:3002/auth/verify/${token}">link</a> to verify
                            your account.</p>
                            <br><br>
                            ~ Team Tomato
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td bgcolor="#ee4c50" style="padding: 30px 30px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%"
                      style="border-collapse: collapse;">
                      <tr>
                        <td style="color: #ffffff; font-family: Arial, sans-serif; font-size: 14px;">
                          <p style="margin: 0;">&reg; Tomato 2020<br />
                            <a href="#" style="color: #ffffff;">Unsubscribe</a> to this newsletter
                            instantly</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
      
            </td>
          </tr>
        </table>
      </body>
      
      </html>
                    `,
      });
      res.status(201).json({
        message:
          "Seller signed-up successfully, please verify your email before logging in.",
        sellerId: savedSeller._id,
      });
    })
    .catch((err) => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

exports.imagesTest = (req, res, next) => {
  if (!req.files) {
    const error = new Error("Upload an image as well.");
    error.statusCode = 422;
    throw error;
  }

  const arrayFiles = req.files.map((file) => file.path);
  console.log(arrayFiles);

  res.status(200).json({ message: "success" });
};
