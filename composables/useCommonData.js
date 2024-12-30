const pageSizes = ref([
  { name: '10', code: 10 },
  { name: '20', code: 20 },
  { name: '30', code: 30 },
  { name: '50', code: 50 },
]);

const defaultPerPage = ref(10);

export const useCommonData = () => {
  return {
    pageSizes,
    defaultPerPage,
  };
};
