import { cloneDeep, isEqual } from "lodash";

class Product {
  constructor(product) {
    this.product = product;
    this.item = {
      product_id: this.product.id,
      name: this.product.name,
      available: this.product.available,
      image: this.product.image,
      price: this.product.default_price,
      combination_price: null,
      size: this.product.default_size,
      total_price: null,
      quantity: 1,
      comment: "",
      extras: {}
    };
  }

  changeSize(newSize) {
    this.item.size = this.product.sizes[newSize].name;
    this.item.price = this.product.sizes[newSize].price;
    this.item.total_price = this.product.sizes[newSize].price;
  }

  addExtras(extra) {
    this.item.extras[extra] = this.product.extras[extra];
  }

  deleteExtras(extra) {
    delete this.item.extras[extra];
  }

  calculatePrice() {
    let extrasPrice = Object.values(this.item.extras).reduce(
      (acc, extra) => +extra.price + acc,
      0
    );
    this.setCombinationID();
    this.item.combination_price = (this.item.price + extrasPrice).toFixed(2);
    this.item.total_price = this.item.combination_price;
    return this.item.combination_price;
  }

  setCombinationID() {
    const combination = this.product?.combinations.find(combination => {
      const size = combination.size === this.item.size;
      let extrasKeys = [];
      for (let extrasKey in this.item.extras) {
        extrasKeys.push(extrasKey);
      }
      const extras = isEqual(extrasKeys.sort(), combination.extras.sort());
      return size && extras;
    });
    if (combination) this.item.combination_id = combination.combination_id;
  }

  getItem() {
    return cloneDeep(this.item);
  }
}

export default Product;
