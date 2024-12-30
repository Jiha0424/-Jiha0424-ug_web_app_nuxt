import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', () => {
  const { $api } = useNuxtApp();
  const token = ref({});

  const login = async (_query: any) => {
    token.value = await $api
      .post('/api/auth/authenticate', _query)
      .then((res) => {
        return res.data;
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return {
    token,
    login,
  };
});
