<script setup>
import Paginator from 'primevue/paginator';

const route = useRoute();

// 공통 데이터 선언
const { pageSizes, defaultPerPage } = useCommonData();

// api통신 하는 모듈 선언
const noticeStore = useSettingNoticeStore();

// 검색관련 변수
const keyword = ref('');

// 페이징 처리시 변수
const currentPage = ref(
  route.query.currentPage === undefined ? 0 : route.query.currentPage
);
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
  'customer-notice',
  () =>
    noticeStore.fetchNotice({
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
const fileDownload = async (data) => {
  let downloadPath = '';
  let originFileName = '';

  if (data.downloadPath) {
    downloadPath = data.downloadPath;
    originFileName = data.originFileName;
  } else {
    downloadPath = notice.value.attachment.downloadPath;
    originFileName = notice.value.attachment.originFileName;
  }

  await noticeStore.downloadFile(downloadPath, originFileName);
};

const goDetail = (data) => {
  navigateTo({
    path: `/customer/notice/${data.id}`,
    query: {
      currentPage: currentPage.value,
    },
  });
};
</script>

<template>
  <ClientOnly>
    <div class="text-2xl font-semibold mb-4 ml-10">공지사항</div>
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
      <!-- {{ noticeStore.notices.data.content }} -->
      <DataTable
        :value="
          noticeStore.notices.data !== undefined
            ? noticeStore.notices.data.content
            : []
        "
        :dataKey="(data) => `${data.id}`"
        :rowHover="true"
      >
        <template #header>
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
        </template>
        <template #empty> 데이터가 없습니다. </template>
        <template #loading> Loading customers data. Please wait. </template>
        <Column
          header="No."
          field="id"
          headerClass="text-center"
          style="min-width: 3rem"
        >
          <template #body="data">
            <i
              v-if="data.data.noticeYn === 'Y'"
              class="pi pi-bell text-red-600 text-xl"
            ></i>
            <div v-else>
              {{
                noticeStore.notices.data.totalElements -
                currentPage * selectedPerPage -
                data.index
              }}
            </div>
          </template>
        </Column>
        <Column
          header="제목"
          field="title"
          headerClass="text-center"
          style="min-width: 25rem"
        >
        </Column>
        <Column header="파일" field="downloadPath" style="min-width: 3rem">
          <template #body="{ data }">
            <i
              v-if="data.downloadPath"
              class="pi pi-cloud-download cursor-pointer"
              @click="fileDownload(data)"
            ></i>
          </template>
        </Column>
        <Column header="조회수" field="viewCount" style="min-width: 3rem">
        </Column>
        <Column field="updDt" header="최종수정일" style="min-width: 6rem">
          <template #body="{ data }">
            {{ data.updDt ? data.updDt : data.regDt }}
          </template>
        </Column>
        <Column header="기타기능" style="min-width: 3rem">
          <template #body="{ data }">
            <Button
              icon="pi pi-external-link"
              outlined
              rounded
              class="mr-2"
              severity="secondary"
              @click="goDetail(data)"
            />
          </template>
        </Column>
      </DataTable>
      <Paginator
        @page="onPaginate"
        :rows="selectedPerPage"
        :first="currentPage * selectedPerPage"
        :totalRecords="
          noticeStore.notices.data !== undefined
            ? noticeStore.notices.data.totalElements
            : 0
        "
      ></Paginator>
    </div>
  </ClientOnly>
</template>

<style lang="scss" scoped></style>
