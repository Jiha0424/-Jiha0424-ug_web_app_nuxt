import axios from 'axios';

export default defineNuxtPlugin(() => {
  const { customToast } = useMessageToast();

  const api = axios.create({
    baseURL: process.env.API_BASE_URL,
    timeout: 20000,
  });

  api.interceptors.request.use(
    (config) => {
      const accessToken = useCookie('accessToken').value;
      const refreshToken = useCookie('refreshToken').value;

      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      if (config.url === '/api/auth/refresh-token') {
        config.headers.Authorization = `Bearer ${refreshToken}`;
      }

      return config;
    },
    (error) => {
      // console.log('request error : ' + JSON.stringify(error.request));

      return Promise.reject(error);
    }
  );

  api.interceptors.response.use(
    async (response) => {
      // console.log('request response : ' + response);

      return response;
    },
    async (error) => {
      // if (error.response.status === 400) {
      //   console.log('error : ' + JSON.stringify(error));
      //   console.log('error.response : ' + JSON.stringify(error.response));
      //   serverToast(
      //     'error',
      //     error.response.status,
      //     error.response.data.message
      //   );
      //   // return false;
      // }
      if (error.response.status === 401) {
        // console.log(
        //   'error.response.data.status : ' + error.response.data.status
        // );
        if (
          error.response.data.status === 401000 ||
          error.response.data.status === 401002 ||
          error.response.data.status === 401004 ||
          error.response.data.status === 401005
        ) {
          api.get('/api/auth/logout');
          logout();
        } else if (error.response.data.status === 401003) {
          try {
            const tokenResult = await api.post('/api/auth/refresh-token');

            if (tokenResult.status === 200) {
              useCookie('accessToken').value =
                tokenResult.data.data.accessToken;
              useCookie('refreshToken').value =
                tokenResult.data.data.refreshToken;

              return api(error.config);
            }
          } catch (e) {
            console.log('refreshToken error : ' + e);
            logout();
          }
        }
        // return navigateTo('/auth/login', { redirectCode: 302 });
      } else {
        customToast(
          'error',
          error.response.status,
          error.response.data.message
        );
      }
      if (error.response.status === 500) {
        return navigateTo('/sample/error');
      }

      return Promise.reject(false);
    }
  );

  const logout = () => {
    useCookie('accessToken').value = null;
    useCookie('refreshToken').value = null;

    return navigateTo('/');
  };

  return {
    provide: {
      api: api,
    },
  };
});
