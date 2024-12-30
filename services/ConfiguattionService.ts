export default class Configuration {
  getPalette = async () => {
    return fetch('/data/palette.json')
      .then((res) => res.json())
      .then((d) => d.data);
  };

  getSurface = async () => {
    return fetch('/data/surface.json')
      .then((res) => res.json())
      .then((d) => d.data);
  };
}
