export default class CountryService {
  getCountry = async () => {
    return fetch('/data/country.json')
      .then((res) => res.json())
      .then((d) => d.data);
  };
}
