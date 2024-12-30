<script setup>
import Paginator from 'primevue/paginator';
import Editor from 'primevue/editor';

// 공통 데이터 선언
const { pageSizes, defaultPerPage } = useCommonData();

// api통신 하는 모듈 선언
const faqStore = useSettingFaqStore();

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
const category = ref('');

// 페이징 처리시 변수
const currentPage = ref(0);
const perSizes = pageSizes;
const selectedPerPage = defaultPerPage;

// 팝업관련변수
const isDialog = ref(false);
const isUseYnDialog = ref(false);
const faq = ref({});

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
  'setting-faq',
  () =>
    faqStore.fetchFaq({
      keyword: keyword.value,
      category: category.value,
      size: selectedPerPage.value,
      page: currentPage.value,
    }),
  {
    watch: [currentPage],
    server: false,
    lazy: true,
  }
);

// FAQ 등록 화면 호출
const addFaq = () => {
  isNew.value = true;
  faq.value = { displayYn: 'Y', category: '01', groupCode: 'MH_FAQ_CATEGORY' };
  isDialog.value = true;
};

// FAQ 수정 화면 호출
const modifyFaq = async (data) => {
  isNew.value = false;

  await faqStore.getFaq(data.id);

  if (faqStore.faq.status === 200) {
    faq.value = { ...faqStore.faq.data };

    isDialog.value = true;
  } else {
    failToast();
    isDialog.value = false;
  }
};

// modal창 validator(임시적인 validation입니다. 필요한 부분만 개인별로 처리 하세요)
const validation = () => {
  if (isInvalid(faq.value.question) || isInvalid(faq.value.answer)) {
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
const faqRemove = async () => {
  if (isDialog.value) {
    selectedRows.value = [faq.value];
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
    let item = faqStore.faqs.data.content.splice(idx, 1);
    faqStore.faqs.data.content.splice(idx - 1, 0, item[0]);
  }
};

// 순서 아래로 변경
const modifyDownOrder = (idx) => {
  if (faqStore.faqs.data.content.length - 1 > idx) {
    let item = faqStore.faqs.data.content.splice(idx, 1);
    faqStore.faqs.data.content.splice(idx + 1, 0, item[0]);
  }
};

// 저장(insert, update)
const save = async () => {
  faq.value.file = selectedFile.value;

  if (isNew.value) await faqStore.addFaq(selectedFile.value, faq.value);
  else await faqStore.modifyFaq(selectedFile.value, faq.value);

  if (faqStore.save.status === 200) {
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
    downloadPath = faq.value.attachment.downloadPath;
    originFileName = faq.value.attachment.originFileName;
  }
  await faqStore.downloadFile(downloadPath, originFileName);
};

// 파일삭제처리
const fileRemove = async () => {
  await faqStore.removeFile(faq.value.attachment.id);

  if (faqStore.save.status === 200) {
    saveToast();
    faq.value.attachment = null;
    faqStore.faqs.data.content.forEach((d) => {
      if (d.id === faq.value.id) {
        d.downloadPath = null;
      }
    });
  } else failToast();
};

// 공지삭제 처리
const del = async () => {
  await faqStore.removeFaq(selectedRows.value);

  if (faqStore.save.status === 200) {
    saveToast();
    selectedRows.value = [];
    isUseYnDialog.value = false;
    isDialog.value = false;
    refresh();
  } else failToast();
};

// 순서변경 처리
const setFaqOrder = async () => {
  faqStore.faqs.data.content.forEach((d, i) => {
    d.orderSeq = currentPage.value * selectedPerPage.value + i + 1;
  });
  await faqStore.modifyFaqOrder(faqStore.faqs.data.content);

  if (faqStore.save.status === 200) {
    saveToast();
    selectedRows.value = [];
    refresh();
  } else failToast();
};
</script>

<template>
  <ClientOnly>
    <!-- FAQ 삭제 팝업 -->
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
    <!-- //FAQ 삭제 팝업 -->

    <!-- FAQ 등록/수정 -->
    <Dialog
      v-model:visible="isDialog"
      :style="{ width: '1100px', height: '100vh' }"
      header="FAQ 저장"
      :modal="true"
    >
      <div class="grid grid-cols-12 gap-10">
        <div class="col-span-11 xl:col-span-6">
          <div class="flex flex-col">
            <label for="faq.category" class="text-xs">카테고리</label>
            <Select
              v-model="faq.category"
              inputId="faq.category"
              :options="[
                { value: '01', name: '문의사항' },
                { value: '02', name: '사이트이용' },
              ]"
              optionLabel="name"
              optionValue="value"
              placeholder="전체"
              class="w-full md:w-52"
              :invalid="false"
            />
          </div>
          <div class="flex flex-col">
            <label for="faq.question" class="text-xs">제목</label>
            <InputText
              v-model="faq.question"
              id="faq.question"
              placeholder="제목"
              class="w-full"
            />
          </div>
          <div class="flex flex-col mt-2">
            <label for="faq.answer" class="text-xs">내용</label>
            <Editor
              v-model="faq.answer"
              id="faq.answer"
              placeholder="내용"
              class="w-full"
              style="height: 350px"
            />
          </div>
        </div>
        <div class="col-span-11 xl:col-span-6">
          <div class="flex flex-col gap-4">
            <div class="flex flex-col">
              <label for="searchDomain" class="text-xs">전시여부</label>
              <div class="flex flex-wrap items-center gap-2">
                <RadioButton
                  v-model="faq.displayYn"
                  inputId="faq.displayYn1"
                  name="faq.displayYn"
                  value="Y"
                />
                <label for="faq.displayYn1">전시</label>
                <RadioButton
                  v-model="faq.displayYn"
                  inputId="faq.displayYn2"
                  name="faq.displayYn"
                  value="N"
                />
                <label for="faq.displayYn2">미전시</label>
              </div>
            </div>
            <div class="flex flex-col">
              <label for="file" class="text-xs">첨부파일</label>
              <FileUpload
                v-if="!faq.attachment"
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
                {{ faq.attachment.originFileName }}
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
                <div>{{ faq.regName + '(' + faq.regId + ')' }}</div>
                <div>{{ faq.regDt }}</div>
              </div>
            </div>
            <div v-if="!isNew && faq.updId" class="flex flex-col">
              <label for="file" class="text-xs">최종수정일</label>
              <div class="flex flex-col">
                <div>{{ faq.updName + '(' + faq.updId + ')' }}</div>
                <div>{{ faq.updDt }}</div>
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
          @click="faqRemove"
        />
        <Button label="저장" icon="pi pi-check" @click="confirm($event)" />
      </template>
    </Dialog>
    <!-- //FAQ 등록/수정 -->

    <div class="card flex flex-col gap-2">
      <Fieldset legend="FAQ 관리" toggleable>
        <div class="flex flex-row justify-between gap-2">
          <div class="flex flex-wrap gap-4">
            <div class="flex flex-col">
              <label for="category" class="text-xs">카테고리</label>
              <Select
                v-model="category"
                inputId="category"
                :options="[
                  { value: '', name: '전체' },
                  { value: '01', name: '문의사항' },
                  { value: '02', name: '사이트이용' },
                ]"
                optionLabel="name"
                optionValue="value"
                placeholder="전체"
                class="w-full md:w-52"
                :invalid="false"
              />
            </div>
            <div class="flex flex-col">
              <label for="keyword" class="text-xs">검색어</label>
              <InputText v-model="keyword" />
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
      <!-- {{ faqStore.faqs.data.content }} -->
      <DataTable
        :value="
          faqStore.faqs.data !== undefined ? faqStore.faqs.data.content : []
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
                label="등록"
                icon="pi pi-plus"
                severity="info"
                @click="addFaq"
              />
              <Button
                label="선택삭제"
                icon="pi pi-trash"
                severity="danger"
                @click="faqRemove"
              />
              <Button
                label="순서저장"
                outlined
                severity="help"
                @click="setFaqOrder"
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
            <div>
              {{
                faqStore.faqs.data.totalElements -
                currentPage * selectedPerPage -
                data.index
              }}
            </div>
          </template>
        </Column>
        <Column
          header="카테고리"
          field="categoryName"
          headerClass="text-center"
          style="min-width: 5rem"
        ></Column>
        <Column
          header="제목"
          field="question"
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
              @click="modifyFaq(data.data)"
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
          faqStore.faqs.data !== undefined
            ? faqStore.faqs.data.totalElements
            : 0
        "
      ></Paginator>
    </div>
  </ClientOnly>
</template>

<style lang="scss" scoped></style>
