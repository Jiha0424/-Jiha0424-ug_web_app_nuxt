export default class UserInfoService {
  getUserInfo = async () => {
    return fetch("/data/user-info.json")
      .then((res) => res.json())
      .then((d) => d.data);
  };
}
