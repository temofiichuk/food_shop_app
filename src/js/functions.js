import axios from "axios";
export const API = "http://localhost:9001/";

export const validPattern = {
  first_name: {
    pattern: /^([А-ЯІЇЄҐІҐ]|[A-Z])+([а-яіїєґ]|[a-z])*$/,
    message: "Invalid First Name"
  },
  last_name: {
    pattern: /^([А-ЯІЇЄҐІҐ]|[A-Z])+([а-яіїєґ]|[a-z])*$/,
    message: "Invalid Last Name"
  },
  order_phone: {
    pattern: /^\+\(?380\)?\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{3}$/,
    message:
      "Invalid Phone, please enter a valid phone number (+380 XXX XXX XX XX)"
  },
  order_address: {
    pattern: /^.{5,}$/,
    message: "Minimum 5 symbols"
  },
  require: {
    pattern: /^.{3,}$/,
    message: "Minimum 3 symbols"
  }
};

function createCardHtml({ id, name, default_price, available, image, extra }) {
  return `
    <li class="products__product card">
      <img src="assets/products/${image}" alt="${name}" />
      <p class="name">${name}</p>
      <p class="price">$ <span>${default_price}</span></p>
      <p class="available"><span>${available} </span>Bowls available</p>
      <button class="add-to-cart" data-id="${id}" >
          <img src="assets/icons/Plus.svg" alt="Add To Card" />
      </button>
    </li>`;
}

export function renderCategory(wrapper, catID) {
  wrapper.innerHTML = "";
  try {
    axios.get(API + "categories/").then(({ data }) => {
      data.forEach(({ name, id }) => {
        const $li = `
          <li ${id === catID ? 'class="active"' : ""}
             data-category_id="${id}" >
            <span>${name}</span>
          </li>`;
        wrapper.insertAdjacentHTML("beforeend", $li);
      });
    });
  } catch (err) {
    console.error(err);
  }
}

export function renderProducts(productsList, params = "") {
  try {
    axios
      .get(`${API}products?${params}`)
      .then(({ data }) => {
        productsList.innerHTML = "";
        data.forEach(product => {
          productsList.insertAdjacentHTML("beforeend", createCardHtml(product));
        });
      })
      .then(overlayMask);
  } catch (err) {
    console.error(err);
  }
}

function overlayMask() {
  const $main = document.querySelector(".main");
  const $products = document.querySelector(".products");
  const overlay = document.querySelector(".overlay");
  const $aside = document.querySelector("aside");
  const cards = Array.from(document.querySelectorAll(".products__product"));

  const hideOverlayMask = e => (e.currentTarget.style = `--opacity: 0;`);
  const showOverlayMask = e => {
    const x = e.pageX - $main.offsetLeft - $aside.offsetWidth - 24;
    const y = e.pageY - $products.offsetTop + $products.scrollTop - 24;
    e.currentTarget.style = `--opacity: 1; --x: ${x}px; --y:${y}px;`;
  };
  const initOverlayCard = () => {
    const overlayCard = document.createElement("div");
    overlayCard.classList.add("card");
    overlay.append(overlayCard);
  };
  overlay.innerHTML = "";
  cards.forEach(initOverlayCard);
  $products.addEventListener("mousemove", showOverlayMask);
  $products.addEventListener("mouseleave", hideOverlayMask);
}

export function changeActiveCategory(active) {
  const currentActive = document.querySelector("#categories .active");
  const activeLine = document.querySelector(".category__active-line");
  currentActive.classList.remove("active");
  active.classList.add("active");
  activeLine.style.left = active.offsetLeft + "px";
}

export function validQuantity(input) {
  if (!/^[1-9]+[0-9]*$/.test(input.value)) {
    input.value = input.value.replace(/\D/g, "").replace(/^0*/, "");
    return false;
  }
  return true;
}

export function cartItemTemplate({
  combination_id,
  name,
  price,
  image,
  quantity,
  total_price,
  comment,
  size,
  extras
}) {
  return `
     <li class="cart__item" data-product_id="${combination_id}">
      <div class="item__top">
        <div>
          <div class="item__info">
            <img src="assets/products/${image}"
              alt="product's image" />
              <p class="item__name">${name}</p>
          </div>
          <label for="item-quantity-${combination_id}" class="item__qty">
            <input
              id="item-quantity-${combination_id}"
              type="text"
              name="item_qty_${combination_id}"
              value="${quantity}" />
          </label>
        </div>
        <p class="item__total-price">$ <span>${total_price}</span></p>
      </div>
      <div class="item__bottom">
        <label for="item-comment-${combination_id}" class="item__comment">
          <input
            name="item_comment_${combination_id}"
            id="item-comment-${combination_id}"
            type="text"
            placeholder="Order Note..."
            value="${comment}"
          />
        </label>
        <button class="item__delete" data-id="${combination_id}">
          <img src="assets/icons/Trash.svg" alt="Delete" />
        </button>
      </div>
      <div class="item__prices-info"> 
          <p class="item__price">${size}: $ <span>${price}</span></p> |    
          ${Object.values(extras)
            .map(
              extra => `<p class="item__price">
                ${extra.name}: $ ${extra.price}
              </p>`
            )
            .join(" | ")}
      </div>
    </li>`;
}

export function changeQuantityHandler(inputQuantity, cart) {
  const id = +inputQuantity
    .closest(".cart__item")
    .getAttribute("data-product_id");

  const changeHandler = () => {
    if (!validQuantity(inputQuantity)) return;
    cart.changeQuantity(id, +inputQuantity.value);
  };
  changeHandler();

  const blurEventHandler = ({ currentTarget: input }) => {
    if (input.value !== "") return;
    input.value = 1;
    changeHandler();
    inputQuantity.removeEventListener("blur", blurEventHandler);
  };

  inputQuantity.addEventListener("blur", blurEventHandler);
}

export function addCommentHandler(inputComment, cart) {
  if (inputComment.value === "") return;
  const id = +inputComment
    .closest(".cart__item")
    .getAttribute("data-product_id");

  cart.addComment(id, inputComment.value);
}

export function callOnceAfter(callback, wait) {
  let isChange = false;
  let keyChange = null;

  const returnFunc = (...params) => {
    if (!isChange) {
      clearTimeout(keyChange);
      keyChange = setTimeout(() => {
        isChange = true;
        returnFunc(...params);
      }, wait);
    } else {
      callback(...params);
      isChange = false;
    }
  };

  return returnFunc;
}

export function validFields(form, patterns) {
  const formData = new FormData(form);
  let valid = true;
  for (const [key, value] of formData) {
    if (
      !patterns[key] ||
      (form.type_of_order.value !== "Delivery" && key === "order_address")
    ) {
      continue;
    }
    const $error = form[key].parentElement.nextElementSibling;

    const validByPattern = patterns[key].pattern.test(value);
    !validByPattern && ($error.textContent = patterns[key].message);

    const validByRequire = patterns.require.pattern.test(value);
    !validByRequire && ($error.textContent = patterns.require.message);

    valid = validByPattern && validByRequire;
    valid && ($error.textContent = "");
  }
  return valid;
}

export function renderChoice(object, wrapper, type, name, checked) {
  const properties = Object.keys(object);
  wrapper.innerHTML = "";
  for (const property of properties) {
    const uniqueId = Math.round(Math.random() * 1000);
    const selected = object[property].name === checked;
    wrapper.insertAdjacentHTML(
      "afterbegin",
      `<input ${selected ? "checked" : ""} 
              id="size_${uniqueId}" 
              type="${type}" 
              name="${name}" 
              value="${property}">
            <label 
              class="primary-btn" 
              for="size_${uniqueId}"> 
                ${object[property].name} 
            </label>`
    );
  }
}
