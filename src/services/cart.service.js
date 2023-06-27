const httpStatus = require("http-status");
const { Cart, Product, User } = require("../models");
const ApiError = require("../utils/ApiError");
const config = require("../config/config");

// TODO: CRIO_TASK_MODULE_CART - Implement the Cart service methods

/**
 * Fetches cart for a user
 * - Fetch user's cart from Mongo
 * - If cart doesn't exist, throw ApiError
 * --- status code  - 404 NOT FOUND
 * --- message - "User does not have a cart"
 *
 * @param {User} user
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const getCartByUser = async (user) => {
  console.log("get user's cart");
  console.log(user, "service user");
  const userCart = await Cart.findOne({ email: user.email });
  // const userCart = await Cart.findOne({_id:user._id})
  if (!userCart) {
    throw new ApiError(httpStatus.NOT_FOUND, "User does not have a cart");
  }

  return userCart;
};

/**
 * Adds a new product to cart
 * - Get user's cart object using "Cart" model's findOne() method
 * --- If it doesn't exist, create one
 * --- If cart creation fails, throw ApiError with "500 Internal Server Error" status code
 *
 * - If product to add already in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product already in cart. Use the cart sidebar to update or remove product from cart"
 *
 * - If product to add not in "products" collection in MongoDB, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product doesn't exist in database"
 *
 * - Otherwise, add product to user's cart
 *
 *
 *
 * @param {User} user
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const addProductToCart = async (user, productId, quantity) => {
  // const usercart = await Cart.findOne({ email: user.email });

  // if (!usercart) {
  //   const create_user_cart = Cart.create({ email: user.email, cartItems: [] });
  //   if (!create_user_cart) {
  //     throw new ApiError(
  //       httpStatus.INTERNAL_SERVER_ERROR,
  //       "Cart creation failed"
  //     );
  //   }
  // }

  // const checkProduct = await Product.findOne({ _id: productId });
  // if (!checkProduct)
  //   throw new ApiError(
  //     httpStatus.BAD_REQUEST,
  //     "Product doesn't exist in database"
  //   );

  // if(!usercart.cartItems.some((item) => item.product._id === productId) && usercart.cartItems.length>0)
  //   throw new ApiError(
  //     httpStatus.BAD_REQUEST,
  //     "Product already in cart. Use the cart sidebar to update or remove product from cart"
  //   );

  // usercart.cartItems.push({ checkProduct, quantity });
  // await usercart.save();
  // return usercart;

  let cart = await Cart.findOne({ email: user.email });

  if (!cart) {
    try {
      cart = await Cart.create({
        email: user.email,
        cartItems: [],
        paymentOption: config.default_payment_option,
      });
      await cart.save();
    } catch (e) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "User cart creation failed"
      );
    }
  }

  if (cart.cartItems.some((item) => item.product._id == productId)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Product already in cart. Use the cart sidebar to update or remove product from cart"
    );
  }

  const product = await Product.findOne({ _id: productId });
  if (!product) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "product doesn't exist in the database"
    );
  }

  cart.cartItems.push({ product, quantity });
  await cart.save();

  return cart;
};

/**
 * Updates the quantity of an already existing product in cart
 * - Get user's cart object using "Cart" model's findOne() method
 * - If cart doesn't exist, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "User does not have a cart. Use POST to create cart and add a product"
 *
 * - If product to add not in "products" collection in MongoDB, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product doesn't exist in database"
 *
 * - If product to update not in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product not in cart"
 *
 * - Otherwise, update the product's quantity in user's cart to the new quantity provided and return the cart object
 *
 *
 * @param {User} user
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const updateProductInCart = async (user, productId, quantity) => {
  // const getCart = await Cart.findOne({ email: user.email });
  // if (!getCart) {
  //   throw new ApiError(
  //     httpStatus.BAD_REQUEST,
  //     "User does not have a cart. Use POST to create cart and add a product"
  //   );
  // }

  // const find_product = await Product.findOne({ _id: productId });
  // if (!find_product) {
  //   throw new ApiError(
  //     httpStatus.BAD_REQUEST,
  //     "product doesn't exist in database"
  //   );
  // }

  // if (!getCart.cartItems.some((item) => item.product._id === productId)) {
  //   throw new ApiError(httpStatus.BAD_REQUEST, "Product not in cart");
  // }

  // console.log(getCart.cartItems ,"cartItems")
  // getCart.cartItems(...cartItems, quantity)
  // await getCart.save();
  // return getCart;

  // const newcart = await Cart.findOneAndUpdate({_id:user.id}, {quantity:user.body.quantity}, {
  //   new: true,
  // });
  // console.log(newcart);
  // await newcart.save();
  // return newcart;

  let cart = await Cart.findOne({ email: user.email });

  if (!cart) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "User does not have a cart. Use POST to create cart and add a product"
    );
  }

  let product = await Product.findOne({ _id: productId });

  if (!product) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Product doesn't exist in database"
    );
  }

  let productIndex = -1;
  for (let i = 0; i < cart.cartItems.length; i++) {
    if (productId == cart.cartItems[i].product._id) {
      productIndex = i;
      // break;
    }
  }

  if (productIndex == -1) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Product not in cart");
  } else {
    cart.cartItems[productIndex].quantity = quantity;
  }

  await cart.save();
  return cart;
};

/**
 * Deletes an already existing product in cart
 * - If cart doesn't exist for user, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "User does not have a cart"
 *
 * - If product to update not in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product not in cart"
 *
 * Otherwise, remove the product from user's cart
 *
 *
 * @param {User} user
 * @param {string} productId
 * @throws {ApiError}
 */
const deleteProductFromCart = async (user, productId) => {
  // const fetchCart = await Cart.findOne({ email: user.email });
  // if (!fetchCart) {
  //   throw new ApiError(httpStatus.BAD_REQUEST, "User does not have a cart");
  // }

  // if (fetchCart.cartItems.some((item) => item.product._id === productId)) {
  //   throw new ApiError(httpStatus.BAD_REQUEST, "Product already in Cart");
  // }

  let cart = await Cart.findOne({ email: user.email });

  if (!cart) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User does not have a cart");
  }

  let product = await Product.findOne({ _id: productId });

  let productIndex = -1;
  for (let i = 0; i < cart.cartItems.length; i++) {
    if (productId == cart.cartItems[i].product._id) {
      productIndex = i;
    }
  }

  if (productIndex == -1) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Product not in cart");
  } else {
    cart.cartItems.splice(productIndex, 1);
  }

  await cart.save();
};

// TODO: CRIO_TASK_MODULE_TEST - Implement checkout function
/**
 * Checkout a users cart.
 * On success, users cart must have no products.
 *
 * @param {User} user
 * @returns {Promise}
 * @throws {ApiError} when cart is invalid
 */
const checkout = async (user) => {
  const getuser = await getCartByUser(user);
  const { cartItems } = getuser;
  if (cartItems.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Users cart is empty");
  }
  if (!(await user.hasSetNonDefaultAddress())) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Address not set");
  }

  let total = 0;
  getuser.cartItems.some((item)=>{
    total = item.product.cost * item.quantity
  })


  if (user.walletMoney < total) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Insufficient Balance");
  }

  const moneyLeft = user.walletMoney - total;
  user.walletMoney = moneyLeft;
  getuser.cartItems = [];
  await getuser.save();
  user.save();
  return user;
};

module.exports = {
  getCartByUser,
  addProductToCart,
  updateProductInCart,
  deleteProductFromCart,
  checkout,
};
