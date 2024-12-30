export default class CustomerService {
  getCustomersSmall = async () => {
    return fetch('/data/customers-small.json')
      .then((res) => res.json())
      .then((d) => d.data);
  };

  getCustomersMedium = async () => {
    return fetch('/data/customers-medium.json')
      .then((res) => res.json())
      .then((d) => d.data);
  };

  getCustomersLarge = async () => {
    return fetch('/data/customers-large.json')
      .then((res) => res.json())
      .then((d) => d.data);
  };

  getCustomersXLarge = async () => {
    return fetch('/data/customers-xlarge.json')
      .then((res) => res.json())
      .then((d) => d.data);
  };

  getCustomers = async (params: any) => {
    const queryParams = Object.keys(params)
      .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
      .join('&');
    return fetch(
      `https://www.primefaces.org/data/customers?${queryParams}`
    ).then((res) => res.json());
  };
}
