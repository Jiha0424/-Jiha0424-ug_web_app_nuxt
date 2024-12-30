import type { AxiosRequestConfig } from 'axios';
import { defineStore } from 'pinia';

export const useSettingFaqStore = defineStore('setting-faq', () => {
  const { $api } = useNuxtApp();
  const faqs = ref({});
  const faq = ref({});
  const save = ref({});

  const fetchFaq = async (_query: any) => {
    try {
      faqs.value = await $api
        .get('/api/faq/list', { params: _query })
        .then((res) => {
          return res.data;
        });
    } catch (error) {
      console.log(error);
    }
  };

  const getFaq = async (_query: any) => {
    try {
      faq.value = await $api.get(`/api/faq/detail/${_query}`).then((res) => {
        return res.data;
      });
    } catch (error) {
      console.log(error);
    }
  };

  const downloadFile = async (downloadPath: string, originFileName: string) => {
    try {
      const response = await $api.get(`/api${downloadPath}?folder=faq`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', originFileName);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.log(error);
    }
  };

  const addFaq = async (file: any, _query: any) => {
    try {
      const formData = new FormData();
      formData.append('files', file);

      const blob = new Blob([JSON.stringify(_query)], {
        type: 'application/json',
      });
      formData.append('faq', blob);

      save.value = await $api
        .post('/api/faq/add', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then((res) => {
          return res.data;
        });
    } catch (error) {
      console.log(error);
    }
  };

  const modifyFaq = async (file: any, _query: any) => {
    try {
      const formData = new FormData();
      formData.append('files', file);

      const blob = new Blob([JSON.stringify(_query)], {
        type: 'application/json',
      });
      formData.append('faq', blob);

      save.value = await $api
        .post('/api/faq/modify', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then((res) => {
          return res.data;
        });
    } catch (error) {
      console.log(error);
    }
  };

  const removeFile = async (id: string) => {
    try {
      save.value = await $api
        .get(`/api/attachment/remove/${id}`, {
          params: { targetGroup: 'faq' },
        })
        .then((res) => {
          return res.data;
        });
    } catch (error) {
      console.log(error);
    }
  };

  const removeFaq = async (_query: any) => {
    try {
      save.value = await $api.post(`/api/faq/remove`, _query).then((res) => {
        return res.data;
      });
    } catch (error) {
      console.log(error);
    }
  };

  const modifyFaqOrder = async (_query: any) => {
    try {
      save.value = await $api
        .post(`/api/faq/modify/order`, _query)
        .then((res) => {
          return res.data;
        });
    } catch (error) {
      console.log(error);
    }
  };

  return {
    faqs,
    faq,
    save,
    fetchFaq,
    getFaq,
    downloadFile,
    addFaq,
    modifyFaq,
    modifyFaqOrder,
    removeFile,
    removeFaq,
  };
});
