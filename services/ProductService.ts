export default class ProductService {
  getProductsSmall = async () => {
    return fetch('/data/products-small.json')
      .then((res) => res.json())
      .then((d) => d.data);
  };

  getProductsWithOrdersSmall = async () => {
    return fetch('/data/products-orders-small.json')
      .then((res) => res.json())
      .then((d) => d.data);
  };

  getProduct = async () => {
    return fetch('/data/products.json')
      .then((res) => res.json())
      .then((d) => d.data);
  };
}
