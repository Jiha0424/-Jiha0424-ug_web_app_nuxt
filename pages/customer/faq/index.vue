<script setup>
import Paginator from 'primevue/paginator';
import Editor from 'primevue/editor';

// 공통 데이터 선언
const { pageSizes, defaultPerPage } = useCommonData();

// api통신 하는 모듈 선언
const faqStore = useSettingFaqStore();

// 검색관련 변수
const keyword = ref('');

// 페이징 처리시 변수
const currentPage = ref(0);
const perSizes = pageSizes;
const selectedPerPage = defaultPerPage;

// 검색버튼
const getSearch = () => {
  if (currentPage.value !== 0) currentPage.value = 0;
  else refresh();
};

// 페이징 숫자 클릭 이벤트
const onPaginate = (e) => (currentPage.value = e.page);

// 메인 리스트 조회
const { status, error, refresh } = await useAsyncData(
  'customer-faq',
  () =>
    faqStore.fetchFaq({
      keyword: keyword.value,
      size: selectedPerPage.value,
      page: currentPage.value,
    }),
  {
    watch: [currentPage],
    server: false,
    lazy: true,
  }
);

// 파일다운로드
const fileDownload = async (downloadPath, originFileName) => {
  await faqStore.downloadFile(downloadPath, originFileName);
};
</script>

<template>
  <ClientOnly>
    <div class="text-2xl font-semibold mb-4 ml-10">FAQ</div>
    <div v-if="status === 'pending'" class="card">
      <div
        class="rounded border border-surface-200 dark:border-surface-700 p-6 bg-surface-0 dark:bg-surface-900 mt-14"
      >
        <ul class="m-0 p-0 list-none">
          <li class="mb-4" v-for="item in [1, 2, 3, 4]">
            <div class="flex">
              <Skeleton shape="circle" size="4rem" class="mr-2"></Skeleton>
              <div class="self-center" style="flex: 1">
                <Skeleton width="100%" class="mb-2"></Skeleton>
                <Skeleton width="75%"></Skeleton>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <div v-else class="card">
      <div class="flex justify-between">
        <Select
          v-model="selectedPerPage"
          @change="getSearch"
          inputId="perSize"
          :options="perSizes"
          optionLabel="name"
          optionValue="code"
          class="w-full md:w-24"
        />
        <div class="flex gap-2">
          <InputGroup>
            <InputText
              v-model="keyword"
              placeholder="검색어"
              class="w-full md:w-24"
            />
            <Button class="pi pi-search" @click="getSearch" />
          </InputGroup>
        </div>
      </div>
      <Accordion value="0">
        <AccordionPanel
          v-for="(item, i) in faqStore.faqs.data.content"
          :value="i"
        >
          <AccordionHeader>{{ item.question }}</AccordionHeader>
          <AccordionContent>
            <div v-html="item.answer"></div>
            <hr v-if="item.downloadPath" />
            <div v-if="item.downloadPath" class="flex flex-row justify-end">
              <div class="mr-4 content-center">
                {{ item.originFileName }}
              </div>
              <div class="mr-10">
                <Button
                  label="다운로드"
                  outlined
                  @click="fileDownload(item.downloadPath, item.originFileName)"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionPanel>
      </Accordion>
      <Paginator
        @page="onPaginate"
        :rows="selectedPerPage"
        :first="currentPage * selectedPerPage"
        :totalRecords="
          faqStore.faqs.data !== undefined
            ? faqStore.faqs.data.totalElements
            : 0
        "
      ></Paginator>
    </div>
  </ClientOnly>
</template>

<style lang="scss" scoped></style>
