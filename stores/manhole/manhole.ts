import { defineStore } from 'pinia';

export const useMapStore = defineStore('map', () => {
  const { $api } = useNuxtApp();
  const map = ref({});
  const areas = ref({});

  const getMapData = async (_query: any) => {
    try {
      map.value = await $api
        .get('/api/manhole_info/list', { params: _query })
        .then((res) => {
          return res.data;
        });
    } catch (error) {
      console.log(error);
    }
  };

  const fetchArea = async (_query: any) => {
    try {
      areas.value = await $api
        .get('/api/vworld-client/search/point', { params: _query })
        .then((res) => {
          return res.data;
        });
    } catch (error) {
      console.log(error);
    }
  };

  return {
    map,
    areas,
    getMapData,
    fetchArea,
  };
});
