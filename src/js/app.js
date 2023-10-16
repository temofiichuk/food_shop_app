import {
  changeActiveCategory,
  renderCategory,
  renderProducts,
  cartItemTemplate,
  changeQuantityHandler,
  addCommentHandler,
  callOnceAfter,
  validFields,
  renderChoice,
  validPattern,
  API
} from "./functions.js";

import axios from "axios";
import Cart from "./Classes/Cart.js";
import Product from "./Classes/Product.js";
import m from "moment";

const $searchInput = document.getElementById("search");

const $categories = document.getElementById("categories");
const $productsList = document.querySelector(".products__list");

const $order = document.getElementById("order");
const $orderForm = document.forms.order_form;

const $cart = document.getElementById("cart");
const $cartForm = document.forms.cart_form;
const $cartList = $cart.querySelector(".cart__items-list");
const $cartBtn = document.getElementById("cart-btn");
const $cartIconQty = $cartBtn.querySelector(".quantity span");
const $cartSubTotal = $cartForm.querySelector(".cart__subtotal-price span");
const cartSubmitBtn = $cartForm.querySelector('[type="submit"]');

const $choice = document.getElementById("choice");
const $priceProduct = $choice.querySelector(".price-product");

const $message = document.getElementById("message");

let catID = 1;
const defaultParams = () => `category_id=${catID}`;

let cart = new Cart();
let order = {};
let product = null;

// set current date
document.getElementById("date").innerHTML = m().format("dddd, D MMM YYYY");

renderCategory($categories, catID);
renderProducts($productsList, defaultParams());
// search for products by name
$searchInput.addEventListener("keyup", ({ target: { value } }) => {
  if (!value) renderProducts($productsList, `category_id=${catID}`);
  if (value.length > 2)
    renderProducts($productsList, `q=${value}&${defaultParams()}`);
});
// get products by category
$categories.addEventListener("click", ({ target }) => {
  const currentCategory = target.closest("li");
  if (currentCategory) {
    catID = currentCategory.getAttribute("data-category_id");
    renderProducts($productsList, `category_id=${catID}`);
    changeActiveCategory(currentCategory);
  }
});
// SHOW CHOICE
$productsList.addEventListener("click", ({ target }) => {
  const addToCartBtn = target.closest(".add-to-cart");
  if (addToCartBtn) {
    const productID = addToCartBtn.getAttribute("data-id");
    axios.get(`${API}products/${productID}`).then(({ data }) => {
      product = new Product(data);
      showChoice(data);
    });
  }
});

function showChoice({ id, sizes, extras, default_size }) {
  $choice.setAttribute("data-id", id);
  renderChoice(
    sizes,
    $choice.querySelector('[class$="sizes"]'),
    "radio",
    "size",
    default_size
  );
  renderChoice(
    extras,
    $choice.querySelector('[class$="extras"]'),
    "checkbox",
    "extras"
  );
  $priceProduct.textContent = product.calculatePrice();
  $choice.classList.add("open");
}

// CHOICE FORM
$choice.addEventListener("click", ({ target }) => {
  const size = target.closest('[name="size"]');
  if (size) product.changeSize(size.value);
  const extras = target.closest('[name="extras"]');
  if (extras) {
    extras.checked
      ? product.addExtras(extras.value)
      : product.deleteExtras(extras.value);
  }
  if (extras || size) {
    $priceProduct.textContent = product.calculatePrice();
  }
});

$choice.addEventListener("submit", e => {
  e.preventDefault();
  cart.addItem(product.getItem());
});
// CART
$cartBtn.addEventListener("click", () => {
  $choice.classList.remove("open");
  $cart.classList.toggle("open");
});

document.addEventListener("updateCart", () => {
  cart.renderList($cartList, cartItemTemplate);
  $cartIconQty.textContent = cart.getTotalQty();
  $cartSubTotal.textContent = cart.calculateSubtotalPrice();
  cartSubmitBtn.disabled = cart.getItems().length <= 0;
});

document.addEventListener("addToCart", () => {
  $cart.classList.add("open");
  $choice.classList.remove("open");
});

$cartForm.addEventListener("submit", e => {
  e.preventDefault();
  $orderForm.type_of_order.value = $cartForm.type_of_order.value;
  $order.classList.add("open");
});
// change quantity and comment
const addComment = callOnceAfter(addCommentHandler, 2000);
const changeQuantity = callOnceAfter(changeQuantityHandler, 2000);
$cartForm.addEventListener("keyup", ({ target }) => {
  const inputQuantity = target.closest(".item__qty input");
  if (inputQuantity) changeQuantity(inputQuantity, cart);

  const inputComment = target.closest(".item__comment input");
  if (inputComment) addComment(inputComment, cart);
});

$cart.addEventListener("click", ({ target }) => {
  const deleteBtn = target.closest(".item__delete");
  if (deleteBtn) {
    const id = +deleteBtn.getAttribute("data-id");
    cart.deleteItem(id);
    return;
  }
  if (target.closest(".cart__close-btn")) {
    $cart.classList.remove("open");
  }
});
// ORDER
$orderForm.addEventListener("click", ({ target }) => {
  if (target.closest(".order__cancel-btn")) {
    $order.classList.remove("open");
  }
});

$orderForm.addEventListener("submit", e => {
  e.preventDefault();
  const formData = new FormData(e.target);
  if (!validFields(e.target, validPattern)) return;
  for (const [key, value] of formData) {
    order[key] = value;
  }
  order.items = cart.getItems();
  try {
    axios.post(`${API}orders/`, order).then(({ data }) => {
      localStorage.removeItem("cart");
      $cart.classList.remove("open");
      $order.classList.remove("open");
      showSuccess(
        `Successfully. We will contact you shortly. Your order number is #${data.id}`
      );
      order = {};
      cart = new Cart();
    });
  } catch (err) {
    showFail(
      "Something went wrong. Please try again later or call us at +380994499444"
    );
    console.error(err);
  }
});

function showFail(text) {
  $message.children[0].textContent = text;
  $message.classList.add("fail", "open");
  setTimeout(() => {
    $message.classList.remove("fail", "open");
  }, 30000);
}

function showSuccess(text) {
  $message.children[0].textContent = text;
  $message.classList.add("success", "open");
  setTimeout(() => {
    $message.classList.remove("success", "open");
  }, 30000);
}
