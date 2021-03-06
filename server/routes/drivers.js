const express = require('express');
const router = express.Router();
const {Driver, Car} = require('../../database/models');
const AuthJwt = require('../Middleware/auth.jwt.js')
const nodemailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')


router.get("/", (req, res) => {
    Driver.findAll().then((drivers) => res.json(drivers));
  });

  router.get("/:id",  (req, res) => {
    console.log(req.params)
 Driver.findOne({where : {id: +req.params.id}, include : [Car]}).then(driver =>{console.log(driver)
 
   res.json(driver)}).catch(err => res.json(err))
  });



  router.post("/register", async (req, res) => {
    const emailExist = await Driver.findOne({
      where: { email: req.body.email },
    }); 
    if (emailExist) return res.send({message: "Email already exist"});
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt); 
    const driver = await Driver.create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        password:hashPassword,
        email: req.body.email,
        address: req.body.address,
        phoneNumber: req.body.phoneNumber,
        ICN: req.body.ICN,
        driverLicense: req.body.driverLicense
      });
      // console.log(driver)
      const updatedDriver = await Driver.findByPk(driver.id)
      // console.log(updatedDriver);
      res.json({
        driver: updatedDriver,
          accessToken : jwt.sign(
            { id: driver.id },
            'HAMDI_IS_DYING',
            { expiresIn: 2*60 }
          )
        })
  nodemailer.createTestAccount((err, email) => {
        var transporter = nodemailer.createTransport(
          smtpTransport({
            service: "gmail",
            port: 465,
            secure: false,
            host: "smtp.gmail.com",
            auth: {
              user: "mydocapplication123456@gmail.com",
              pass: "Mydocapplication123",
            },
            tls: {
              rejectUnauthorized: false,
            },
          })
        );
        let mailOptions = {
          from: "Car-pooling@RBK.com",
          to: `${req.body.email}`,
          subject: "Carpooling new account",
          text: `Hey ${req.body.firstName}, ${req.body.lastName} welcome to our community.     
                Driving in your car soon?
                Let's make this your least expensive and eco-friendly.
                 Your ride. your choice !`,
        };
        transporter.sendMail(mailOptions, (err, info) => {
          console.log(info)
        });
      }); 
  })

  router.post("/login", async (req, res) => {
    console.log(req.body)
    const user = await Driver.findOne({ where: { email: req.body.email } });
    if (!user){
       return res.json({ message :"Email is not found"}) }
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) return res.send({message: "Invalid password "});
    res.status(200).json({
      driver: user,
        accessToken : jwt.sign(
          { id: user.id },
          'HAMDI_IS_DYING',
          { expiresIn: 2*60 } //expires in by seconds
        )
      });
  });


  router.delete("/:id",  (req, res) => {
     Driver.findByPk(req.params.id)
      .then((drivers) => {
        drivers.destroy();
      })
      .then(() => {
        res.json("deleted");
      });
  });



  module.exports = router;