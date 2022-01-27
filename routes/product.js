const router = require("express").Router();
const {
  getAllProducts,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  getProductByName,
  getProductReviews,
  createProductReview,
  updateProductReview,
} = require("../controllers/products.controller");
const verifyAdmin = require("../middleware/verifyAdmin");
const verifyToken = require("../middleware/verifyToken");

router
  .route("/")
  .get(getAllProducts)
  .post(createProduct);//add after testing verifyToken, verifyAdmin,

router
  .route("/:id")
  .get(getProduct)
  .get(getProductByName)
  .put( updateProduct) // add after testing verifyToken, verifyAdmin,
  .delete( deleteProduct); // add after testing verifyToken, verifyAdmin,

router.route("/:id/reviews")
  .get( getProductReviews)
  .post(createProductReview) // add after testing verifyToken, 
  .put(updateProductReview); //verifyToken,


module.exports = router;
