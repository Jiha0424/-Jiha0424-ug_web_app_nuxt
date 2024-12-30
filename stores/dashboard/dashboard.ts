import { defineStore } from 'pinia';

export const useDashboardStore = defineStore('dashboard', () => {
  const { $api } = useNuxtApp();
  const dashboard = ref({});
  const weather = ref({});

  const getDashboard = async () => {
    try {
      dashboard.value = await $api
        .get('/api/dashboard/getDataAll')
        .then((res) => {
          return res.data;
        });
    } catch (error) {
      console.log(error);
    }
  };

  const getWeather = async () => {
    try {
      weather.value = await $api
        .get('/api/dashboard/getWeather')
        .then((res) => {
          return res.data;
        });
    } catch (error) {
      console.log(error);
    }
  };

  return {
    dashboard,
    weather,
    getDashboard,
    getWeather,
  };
});
