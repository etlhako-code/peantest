const router = require("express").Router();
const {
  getOrder,
  getAllOrders,
  createOrder,
} = require("../controllers/orders.controller");
const verifyToken = require("../middleware/verifyToken");

router.route("/create").post(verifyToken, createOrder);

router.route("/").get(verifyToken, getAllOrders);

router.route("/:id").get(verifyToken, getOrder);


/*testing routes
router.route("/").get( getAllOrders);
router.route("/create").post(createOrder);
router.route("/:id").get( getOrder);*/

module.exports = router;
