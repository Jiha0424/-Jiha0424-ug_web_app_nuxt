<script setup>
import Paginator from 'primevue/paginator';
import Editor from 'primevue/editor';

// 공통 데이터 선언
const { pageSizes, defaultPerPage } = useCommonData();

// api통신 하는 모듈 선언
const noticeStore = useSettingNoticeStore();

// confirm창 선언
const confirmPopup = useConfirm();

// 필수값 체크 함수 선언
const { isInvalid } = useInvalidate();

// 메시지 선언
const { saveToast, failToast, validToast, customToast } = useMessageToast();

// add, modify 변수
const isNew = ref(true);

// 검색관련 변수
const keyword = ref('');
const displayYn = ref('');

// 페이징 처리시 변수
const currentPage = ref(0);
const perSizes = pageSizes;
const selectedPerPage = defaultPerPage;

// 팝업관련변수
const isDialog = ref(false);
const isUseYnDialog = ref(false);
const notice = ref({});

// 데이터테이블 관련
const selectedRows = ref([]);

// 파일 관련 변수
const selectedFile = ref(null);

// 검색버튼
const getSearch = () => {
  if (currentPage.value !== 0) currentPage.value = 0;
  else refresh();
};

// 페이징 숫자 클릭 이벤트
const onPaginate = (e) => (currentPage.value = e.page);

// 파일 업로드
const onFileSelected = (event) => {
  selectedFile.value = event.files[0];
};

// 메인 리스트 조회
const { status, error, refresh } = await useAsyncData(
  'setting-notice',
  () =>
    noticeStore.fetchNotice({
      keyword: keyword.value,
      displayYn: displayYn.value,
      size: selectedPerPage.value,
      page: currentPage.value,
    }),
  {
    watch: [currentPage],
    server: false,
    lazy: true,
  }
);

// 공지사항항 등록 화면 호출
const addNotice = () => {
  isNew.value = true;
  notice.value = { displayYn: 'Y' };
  isDialog.value = true;
};

// 공지사항 수정 화면 호출
const modifyNotice = async (data) => {
  isNew.value = false;

  await noticeStore.getNotice(data.id);

  if (noticeStore.notice.status === 200) {
    notice.value = { ...noticeStore.notice.data };
    notice.value.isNewYn = notice.value.newYn === 'Y' ? true : false;
    notice.value.isNoticeYn = notice.value.noticeYn === 'Y' ? true : false;

    isDialog.value = true;
  } else {
    failToast();
    isDialog.value = false;
  }
};

// modal창 validator(임시적인 validation입니다. 필요한 부분만 개인별로 처리 하세요)
const validation = () => {
  if (isInvalid(notice.value.title) || isInvalid(notice.value.content)) {
    validToast();
    return true;
  }

  return false;
};

// confirm창 조작
const confirm = (event) => {
  if (validation()) return true;

  confirmPopup.require({
    target: event.target,
    message: '데이터를 저장 하시겠습니까?',
    icon: 'pi pi-exclamation-triangle',
    rejectProps: {
      label: '취소',
      severity: 'secondary',
      outlined: true,
    },
    acceptProps: {
      label: '확인',
    },
    accept: () => {
      save();
    },
    reject: () => {},
  });
};

// 공지삭제팝업
const noticeRemove = async () => {
  if (isDialog.value) {
    selectedRows.value = [notice.value];
  }

  if (selectedRows.value.length === 0) {
    customToast(
      'warn',
      '데이터 선택',
      '선택된 데이터가 없습니다. \n다시 확인해 주세요.'
    );

    return;
  }

  isUseYnDialog.value = true;
};

// 순서 위로 변경
const modifyUpOrder = (idx) => {
  if (idx > 0) {
    let item = noticeStore.notices.data.content.splice(idx, 1);
    noticeStore.notices.data.content.splice(idx - 1, 0, item[0]);
  }
};

// 순서 아래로 변경
const modifyDownOrder = (idx) => {
  if (noticeStore.notices.data.content.length - 1 > idx) {
    let item = noticeStore.notices.data.content.splice(idx, 1);
    noticeStore.notices.data.content.splice(idx + 1, 0, item[0]);
  }
};

// 저장(insert, update)
const save = async () => {
  notice.value.file = selectedFile.value;
  notice.value.newYn = notice.value.isNewYn ? 'Y' : 'N';
  notice.value.noticeYn = notice.value.isNoticeYn ? 'Y' : 'N';

  if (isNew.value)
    await noticeStore.addNotice(selectedFile.value, notice.value);
  else await noticeStore.modifyNotice(selectedFile.value, notice.value);

  if (noticeStore.save.status === 200) {
    saveToast();
    isDialog.value = false;
    refresh();
  } else failToast();

  selectedFile.value = null;
};

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

// 파일삭제처리
const fileRemove = async () => {
  await noticeStore.removeFile(notice.value.attachment.id);

  if (noticeStore.save.status === 200) {
    saveToast();
    notice.value.attachment = null;
    noticeStore.notices.data.content.forEach((d) => {
      if (d.id === notice.value.id) {
        d.downloadPath = null;
      }
    });
  } else failToast();
};

// 공지삭제 처리
const del = async () => {
  await noticeStore.removeNotice(selectedRows.value);

  if (noticeStore.save.status === 200) {
    saveToast();
    selectedRows.value = [];
    isUseYnDialog.value = false;
    isDialog.value = false;
    refresh();
  } else failToast();
};

// 공지지정 처리
const setNoticeYn = async () => {
  if (selectedRows.value.length === 0) {
    customToast(
      'warn',
      '데이터 선택',
      '선택된 데이터가 없습니다. \n다시 확인해 주세요.'
    );

    return;
  }

  await noticeStore.modifyNoticeYn(selectedRows.value);

  if (noticeStore.save.status === 200) {
    saveToast();
    selectedRows.value = [];
    refresh();
  } else failToast();
};

// 순서변경 처리
const setNoticeOrder = async () => {
  noticeStore.notices.data.content.forEach((d, i) => {
    d.orderSeq = currentPage.value * selectedPerPage.value + i + 1;
  });
  await noticeStore.modifyNoticeOrder(noticeStore.notices.data.content);

  if (noticeStore.save.status === 200) {
    saveToast();
    selectedRows.value = [];
    refresh();
  } else failToast();
};
</script>

<template>
  <ClientOnly>
    <!-- 공지사항 삭제 팝업 -->
    <Dialog
      :header="'데이터 삭제'"
      v-model:visible="isUseYnDialog"
      :style="{ width: '350px' }"
      :modal="true"
    >
      <div class="flex items-center justify-center">
        <i class="pi pi-exclamation-triangle mr-4" style="font-size: 2rem" />
        <span v-if="isDialog"> 데이터를 정말로 삭제 하시겠습니까? </span>
        <span v-else>선택된 데이터를 정말로 삭제 하시겠습니까?</span>
      </div>
      <template #footer>
        <Button
          label="취소"
          icon="pi pi-times"
          @click="isUseYnDialog = false"
          text
          severity="secondary"
        />
        <Button
          label="저장"
          icon="pi pi-check"
          @click="del"
          severity="danger"
          outlined
          autofocus
        />
      </template>
    </Dialog>
    <!-- //공지사항 삭제 팝업 -->

    <!-- 공지사항 등록/수정 -->
    <Dialog
      v-model:visible="isDialog"
      :style="{ width: '1100px', height: '100vh' }"
      header="공지사항 저장"
      :modal="true"
    >
      <div class="grid grid-cols-12 gap-10">
        <div class="col-span-11 xl:col-span-6">
          <div class="flex flex-col">
            <label for="notice.title" class="text-xs">제목</label>
            <InputText
              v-model="notice.title"
              id="notice.title"
              placeholder="제목"
              class="w-full"
            />
          </div>
          <div class="flex flex-col mt-2">
            <label for="notice.content" class="text-xs">내용</label>
            <Editor
              v-model="notice.content"
              id="notice.content"
              placeholder="내용"
              class="w-full"
              style="height: 400px"
            />
          </div>
        </div>
        <div class="col-span-11 xl:col-span-6">
          <div class="flex flex-col gap-4">
            <div class="flex flex-col">
              <label for="searchDomain" class="text-xs">전시여부</label>
              <div class="flex flex-wrap items-center gap-2">
                <RadioButton
                  v-model="notice.displayYn"
                  inputId="notice.displayYn1"
                  name="notice.displayYn"
                  value="Y"
                />
                <label for="notice.displayYn1">전시</label>
                <RadioButton
                  v-model="notice.displayYn"
                  inputId="notice.displayYn2"
                  name="notice.displayYn"
                  value="N"
                />
                <label for="notice.displayYn2">미전시</label>
              </div>
            </div>
            <div class="flex flex-col">
              <label for="searchDomain" class="text-xs">속성</label>
              <div class="flex flex-wrap items-center gap-2">
                <Checkbox
                  v-model="notice.isNoticeYn"
                  id="notice.noticeYn"
                  :value="'Y'"
                  binary
                ></Checkbox>
                <label for="notice.noticeYn">공지</label>
                <Checkbox
                  v-model="notice.isNewYn"
                  id="notice.newYn"
                  :value="'Y'"
                  binary
                ></Checkbox>
                <label for="notice.newYn">최신 글</label>
              </div>
            </div>
            <div class="flex flex-col">
              <label for="file" class="text-xs">첨부파일</label>
              <FileUpload
                v-if="!notice.attachment"
                name="file"
                @select="onFileSelected"
                :multiple="false"
                accept=".zip,.pdf,.doc,.pptx,.hwp,.png,.jpg,.gif"
                :maxFileSize="5000000"
                customUpload
                :file-limit="1"
                :auto="false"
                invalid-file-type-message="GIF이미지 파일만 가능합니다."
                invalid-file-size-message="5MB까지만 업로드 가능합니다."
                :show-upload-button="false"
              />
              <div v-else class="flex flex-col gap-2 text-xl">
                {{ notice.attachment.originFileName }}
                <div class="flex flex-row gap-2">
                  <Button label="다운로드" outlined @click="fileDownload" />
                  <Button
                    label="삭제"
                    severity="danger"
                    icon="pi pi-trash"
                    outlined
                    @click="fileRemove"
                  />
                </div>
              </div>
            </div>
            <div v-if="!isNew" class="flex flex-col">
              <label for="file" class="text-xs">등록일</label>
              <div class="flex flex-col">
                <div>{{ notice.regName + '(' + notice.regId + ')' }}</div>
                <div>{{ notice.regDt }}</div>
              </div>
            </div>
            <div v-if="!isNew && notice.updId" class="flex flex-col">
              <label for="file" class="text-xs">최종수정일</label>
              <div class="flex flex-col">
                <div>{{ notice.updName + '(' + notice.updId + ')' }}</div>
                <div>{{ notice.updDt }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <Button
          label="취소"
          icon="pi pi-times"
          text
          @click="isDialog = false"
        />
        <Button
          v-if="!isNew"
          label="삭제"
          severity="danger"
          icon="pi pi-trash"
          @click="noticeRemove"
        />
        <Button label="저장" icon="pi pi-check" @click="confirm($event)" />
      </template>
    </Dialog>
    <!-- //공지사항 등록/수정 -->

    <div class="card flex flex-col gap-2">
      <Fieldset legend="공지사항 관리" toggleable>
        <div class="flex flex-row justify-between gap-2">
          <div class="flex flex-wrap gap-4">
            <div class="flex flex-col">
              <label for="keyword" class="text-xs">검색어</label>
              <InputText v-model="keyword" />
            </div>
            <div class="flex flex-col">
              <label for="displayYn" class="text-xs">전시여부</label>
              <Select
                v-model="displayYn"
                inputId="displayYn"
                :options="[
                  { value: '', name: '전체' },
                  { value: 'Y', name: '전시' },
                  { value: 'N', name: '미전시' },
                ]"
                optionLabel="name"
                optionValue="value"
                placeholder="전체"
                class="w-full md:w-52"
                :invalid="false"
              />
            </div>
          </div>
          <div class="flex flex-wrap items-center">
            <div class="flex h-12 w-24 justify-end">
              <Button
                type="button"
                label="조회"
                icon="pi pi-search"
                @click="getSearch"
              />
            </div>
          </div>
        </div>
      </Fieldset>
    </div>

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
        v-model:selection="selectedRows"
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
              <Button
                label="공지지정"
                severity="success"
                outlined
                @click="setNoticeYn"
              />
              <Button
                label="등록"
                icon="pi pi-plus"
                severity="info"
                @click="addNotice"
              />
              <Button
                label="선택삭제"
                icon="pi pi-trash"
                severity="danger"
                @click="noticeRemove"
              />
              <Button
                label="순서저장"
                outlined
                severity="help"
                @click="setNoticeOrder"
              />
            </div>
          </div>
        </template>
        <template #empty> 데이터가 없습니다. </template>
        <template #loading> Loading customers data. Please wait. </template>
        <Column selectionMode="multiple" style="min-width: 3rem"></Column>
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
        <Column header="미리보기" style="min-width: 2rem">
          <template #body="{ data }">
            <i class="pi pi-eye"></i>
          </template>
        </Column>
        <Column header="전시유무" field="displayYn" style="min-width: 3rem">
          <template #body="{ data }">
            <Tag
              class="flex w-16 justify-center"
              :value="data.displayYn === 'Y' ? '전시' : '미전시'"
              :severity="data.displayYn === 'Y' ? 'success' : 'danger'"
            />
          </template>
        </Column>
        <Column header="조회수" field="viewCount" style="min-width: 3rem">
        </Column>
        <Column header="최종수정자" key="explain" style="min-width: 6rem">
          <template #body="{ data }">
            {{
              data.updId
                ? data.updName + '(' + data.updId + ')'
                : data.regName + '(' + data.regId + ')'
            }}
          </template>
        </Column>
        <Column field="updDt" header="최종수정일" style="min-width: 6rem">
          <template #body="{ data }">
            {{ data.updDt ? data.updDt : data.regDt }}
          </template>
        </Column>
        <Column header="기타기능" style="min-width: 3rem">
          <template #body="data">
            <Button
              icon="pi pi-pencil"
              outlined
              rounded
              class="mr-2"
              @click="modifyNotice(data.data)"
            />
            <ButtonGroup>
              <Button
                icon="pi pi-chevron-down"
                outlined
                severity="secondary"
                @click="modifyDownOrder(data.index)"
              /><Button
                icon="pi pi-chevron-up"
                outlined
                severity="secondary"
                @click="modifyUpOrder(data.index)"
              />
            </ButtonGroup>
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
