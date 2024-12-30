import { defineStore } from 'pinia';

export const useSampleStore = defineStore('sample', () => {
  const { $api } = useNuxtApp();
  const map = ref({});

  const getMapData = async (_query: any) => {
    try {
      map.value = await $api
        .get('/api/sample/list', { params: _query })
        .then((res) => {
          return res.data;
        });
    } catch (error) {
      console.log(error);
    }
  };

  return {
    map,
    getMapData,
  };
});
