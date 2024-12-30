export default class PhotoService {
  getPhoto = async () => {
    return fetch('/data/photo.json')
      .then((res) => res.json())
      .then((d) => d.data);
  };
}
