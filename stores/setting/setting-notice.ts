import type { AxiosRequestConfig } from 'axios';
import { defineStore } from 'pinia';

export const useSettingNoticeStore = defineStore('setting-notice', () => {
  const { $api } = useNuxtApp();
  const notices = ref({});
  const notice = ref({});
  const save = ref({});

  const fetchNotice = async (_query: any) => {
    try {
      notices.value = await $api
        .get('/api/notice/list', { params: _query })
        .then((res) => {
          return res.data;
        });
    } catch (error) {
      console.log(error);
    }
  };

  const getNotice = async (_query: any) => {
    try {
      notice.value = await $api
        .get(`/api/notice/detail/${_query}`)
        .then((res) => {
          return res.data;
        });
    } catch (error) {
      console.log(error);
    }
  };

  const downloadFile = async (downloadPath: string, originFileName: string) => {
    try {
      const response = await $api.get(`/api${downloadPath}?folder=notice`, {
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

  const addNotice = async (file: any, _query: any) => {
    try {
      const formData = new FormData();
      formData.append('files', file);

      const blob = new Blob([JSON.stringify(_query)], {
        type: 'application/json',
      });
      formData.append('notice', blob);

      save.value = await $api
        .post('/api/notice/add', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then((res) => {
          return res.data;
        });
    } catch (error) {
      console.log(error);
    }
  };

  const modifyNotice = async (file: any, _query: any) => {
    try {
      const formData = new FormData();
      formData.append('files', file);

      const blob = new Blob([JSON.stringify(_query)], {
        type: 'application/json',
      });
      formData.append('notice', blob);

      save.value = await $api
        .post('/api/notice/modify', formData, {
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
          params: { targetGroup: 'notice' },
        })
        .then((res) => {
          return res.data;
        });
    } catch (error) {
      console.log(error);
    }
  };

  const removeNotice = async (_query: any) => {
    try {
      save.value = await $api.post(`/api/notice/remove`, _query).then((res) => {
        return res.data;
      });
    } catch (error) {
      console.log(error);
    }
  };

  const modifyNoticeYn = async (_query: any) => {
    try {
      save.value = await $api
        .post(`/api/notice/modify/notice_yn`, _query)
        .then((res) => {
          return res.data;
        });
    } catch (error) {
      console.log(error);
    }
  };

  const modifyNoticeOrder = async (_query: any) => {
    try {
      save.value = await $api
        .post(`/api/notice/modify/order`, _query)
        .then((res) => {
          return res.data;
        });
    } catch (error) {
      console.log(error);
    }
  };

  return {
    notices,
    notice,
    save,
    fetchNotice,
    getNotice,
    downloadFile,
    addNotice,
    modifyNotice,
    modifyNoticeYn,
    modifyNoticeOrder,
    removeFile,
    removeNotice,
  };
});
