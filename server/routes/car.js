const express = require('express');
const router = express.Router();

const {Car} = require('../../database/models');


router.get("/:id", async (req, res) => {
    console.log(req.params)
  await Car.findByPk(req.params.id).then((car) => res.json(car));
});



module.exports = router;