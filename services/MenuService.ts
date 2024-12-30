export default class MenuService {
  getMenu = async () => {
    return await fetch('/data/menu.json')
      .then((res) => res.json())
      .then((d) => d.data);
  };
}
