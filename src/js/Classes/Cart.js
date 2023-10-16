class Cart {
  constructor() {
    this.items = JSON.parse(localStorage.getItem("cart")) ?? [];
    this.updateCartEvent = new CustomEvent("updateCart");
    this.addToCartEvent = new CustomEvent("addToCart");

    document.addEventListener("DOMContentLoaded", () =>
      document.dispatchEvent(this.updateCartEvent)
    );
  }

  setCartToLocal() {
    localStorage.setItem(`cart`, JSON.stringify(this.items));
    document.dispatchEvent(this.updateCartEvent);
  }

  getItems() {
    return this.items;
  }

  getTotalQty() {
    return this.items.reduce((count, item) => count + item.quantity, 0);
  }

  addItem(product) {
    const item = this.items.find(
      item => item.combination_id === product.combination_id
    );
    if (item) {
      item.quantity++;
      item.total_price = (item.combination_price * item.quantity).toFixed(2);
    } else {
      this.items.push(product);
    }
    this.setCartToLocal();
    document.dispatchEvent(this.addToCartEvent);
  }

  deleteItem(id) {
    this.items = this.items.filter(item => item.combination_id !== id);
    this.setCartToLocal();
  }

  changeQuantity(id, count) {
    const item = this.items.find(item => item.combination_id === id);
    if (!item) return;
    if (count && item.quantity === count) return;
    item.quantity = count;
    item.total_price = (item.combination_price * item.quantity).toFixed(2);
    this.setCartToLocal();
  }

  addComment(id, comment) {
    const item = this.items.find(item => item.combination_id === id);
    if (!item || item.comment === comment) return;
    item.comment = comment;
    this.setCartToLocal();
  }

  calculateSubtotalPrice() {
    return this.items
      .reduce((count, item) => count + +item.total_price, 0)
      .toFixed(2);
  }

  renderList(cartList, itemTemplate) {
    cartList.innerHTML = "";
    this.items.forEach(item => {
      cartList.insertAdjacentHTML("beforeend", itemTemplate(item));
    });
  }
}
export default Cart;
