<script setup>
const route = useRoute();

// api통신 하는 모듈 선언
const noticeStore = useSettingNoticeStore();

// 리스트 화면으로 이동
const goList = () => {
  navigateTo({
    path: '/customer/notice',
    query: { currentPage: route.query.currentPage },
  });
};

// 메인 리스트 조회
const { status, error, refresh } = await useAsyncData(
  'customer-notice-detail',
  () => noticeStore.getNotice(route.params.id),
  {
    server: false,
    lazy: true,
  }
);

// 파일다운로드
const fileDownload = async () => {
  await noticeStore.downloadFile(
    noticeStore.notice.data.attachment.downloadPath,
    noticeStore.notice.data.attachment.originFileName
  );
};
</script>

<template>
  <ClientOnly>
    <div class="text-2xl font-semibold mb-4 ml-10">공지사항</div>
    <div
      v-if="status === 'pending'"
      class="rounded border border-surface-200 dark:border-surface-700 p-6 bg-surface-0 dark:bg-surface-900 h-full"
    >
      <div class="flex mb-4">
        <Skeleton shape="circle" size="4rem" class="mr-2"></Skeleton>
        <div>
          <Skeleton width="10rem" class="mb-2"></Skeleton>
          <Skeleton width="5rem" class="mb-2"></Skeleton>
          <Skeleton height=".5rem"></Skeleton>
        </div>
      </div>
      <Skeleton width="100%" height="150px"></Skeleton>
      <div class="flex justify-between mt-4">
        <Skeleton width="4rem" height="2rem"></Skeleton>
        <Skeleton width="4rem" height="2rem"></Skeleton>
      </div>
    </div>
    <div v-else class="card">
      <div class="flex flex-col">
        <div class="flex flex-row justify-between">
          <div class="text-lg ml-4">{{ noticeStore.notice.data.title }}</div>
          <div class="text-sm mr-4 content-end">
            {{ noticeStore.notice.data.regDt }} |
            {{ noticeStore.notice.data.viewCount }}
          </div>
        </div>
        <hr />
        <div class="m-4" v-html="noticeStore.notice.data.content"></div>
        <hr v-if="noticeStore.notice.data.attachment" />
        <div
          v-if="noticeStore.notice.data.attachment"
          class="flex flex-row justify-end"
        >
          <div class="mr-4 content-center">
            {{ noticeStore.notice.data.attachment.originFileName }}
          </div>
          <div class="mr-10">
            <Button label="다운로드" outlined @click="fileDownload" />
          </div>
        </div>
        <hr />
        <div class="flex flex-row justify-center">
          <Button label="목록" severity="contrast" @click="goList" />
        </div>
      </div>
    </div>
  </ClientOnly>
</template>

<style lang="scss" scoped></style>
