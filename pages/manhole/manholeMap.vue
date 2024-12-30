<script setup>
import GmapCustomMarker from 'googlemap-custom-marker-vue';

definePageMeta({
  layout: 'map',
});

const route = useRoute();

const defaultCenter = ref({ lat: 37.33233, lng: 126.8099 });
const distance = ref(0);
const markers = ref([]);
const polylines = ref([]);
const mapRef = ref(null);
const markerRef = ref(null);
const section = ref('M');
const isGood = ref(true);
const isNormal = ref(true);
const isBad = ref(true);
const isDanger = ref(true);
const isSearchBtn = ref(false);
const isDraw = ref(false);
const searchAreas = ref([]);
const searchName = ref('');
const ratingValue = ref(4);
const paramCenter = ref({
  latitude: 37.33233,
  longitude: 126.8099,
  meter: 650,
});

const ducts = ref([
  {
    ductType: '시멘트',
    ductLayWay: '표준매설',
    dictDiameter: '45MM',
    ductHeight: '1500MM',
    ductRemoval: '우수',
    ductFlowInout: '유입',
    ductDegree: 158,
  },
  {
    ductType: '시멘트',
    ductLayWay: '표준매설',
    dictDiameter: '45MM',
    ductHeight: '1600MM',
    ductRemoval: '우수',
    ductFlowInout: '유출',
    ductDegree: 238,
  },
]);

const dredges = ref([
  { title: '22년도 정기 준설작업', regDt: '2022-03-30' },
  { title: '23년도 정기 준설작업', regDt: '2023-03-30' },
  { title: '23년도 긴급 준설작업', regDt: '2023-07-22' },
]);

const isDialog = ref(false);

if (route != undefined && route.query.lat) {
  defaultCenter.value = {
    lat: parseFloat(route.query.lat),
    lng: parseFloat(route.query.lng),
  };
  paramCenter.value.latitude = parseFloat(route.query.lat);
  paramCenter.value.longitude = parseFloat(route.query.lng);
}

// api통신 하는 모듈 선언
const mapStore = useMapStore();

const { status, error, refresh } = await useAsyncData(
  'map',
  () => mapStore.getMapData(paramCenter.value),
  {
    server: false,
    lazy: true,
  }
);

const calculateDistance = () => {
  const map = mapRef.value.$mapObject; // GMapMap의 실제 지도 객체
  const bounds = map.getBounds(); // 지도 경계 가져오기

  if (bounds) {
    paramCenter.value.latitude = map.getCenter().lat();
    paramCenter.value.longitude = map.getCenter().lng();
    const centerLatLng = map.getCenter(); // 현재 중심 좌표
    const northEast = bounds.getNorthEast(); // 경계의 북동쪽 점
    const southWest = bounds.getSouthWest(); // 경계의 남서쪽 점

    // 중심에서 북동쪽 화면 끝까지의 거리 계산
    const distanceToEdge =
      google.maps.geometry.spherical.computeDistanceBetween(
        centerLatLng,
        northEast
      );

    distance.value = Math.round(distanceToEdge); // 거리(미터)를 반올림하여 저장
    paramCenter.value.meter = distance.value;
  }

  if (isDraw.value) {
    isDraw.value = false;
    refresh();
  }
};

const onSectionClick = (pSection) => {
  section.value = pSection;

  if (pSection === 'M') {
    polylines.value = [];
    makeMarker();
  }
  if (pSection === 'P') {
    markers.value = [];
    makePolyline();
  }
};

const onStatusClick = (type) => {
  if (type === 'G') isGood.value = !isGood.value;
  if (type === 'N') isNormal.value = !isNormal.value;
  if (type === 'B') isBad.value = !isBad.value;
  if (type === 'D') isDanger.value = !isDanger.value;

  onSectionClick(section.value);
};

const fetchArea = async () => {
  if (searchName.value.length > 1)
    await mapStore.fetchArea({ query: searchName.value });

  searchAreas.value = [];
  if (mapStore.areas.status === 200) {
    if (mapStore.areas.data != null) {
      searchAreas.value = [...mapStore.areas.data];
    }
  }
};

const onDragMap = (event) => {
  isSearchBtn.value = true;
};

const searchData = () => {
  refresh();

  isSearchBtn.value = false;
};

const setCenter = (data) => {
  defaultCenter.value = {
    lat: parseFloat(data.point.y),
    lng: parseFloat(data.point.x),
  };
};

watch(status, (newVal) => {
  if (newVal === 'success') {
    if (section.value === 'M') makeMarker();
    if (section.value === 'P') makePolyline();
  }
});

const makePolyline = () => {
  polylines.value = [];

  mapStore.map.data.forEach((d) => {
    let tmp = {};

    tmp.line = [
      { lat: d.latitude, lng: d.longitude },
      { lat: d.inLatitude, lng: d.inLongitude },
    ];

    if (d.ductDeteriorationStatus === 'G' && isGood.value) {
      tmp.color = '#6BD3FF';
      polylines.value = [...polylines.value, tmp];
    }
    if (d.ductDeteriorationStatus === 'N' && isNormal.value) {
      tmp.color = '#44AF68';
      polylines.value = [...polylines.value, tmp];
    }
    if (d.ductDeteriorationStatus === 'B' && isBad.value) {
      tmp.color = '#F4DB56';
      polylines.value = [...polylines.value, tmp];
    }
    if (d.ductDeteriorationStatus === 'D' && isDanger.value) {
      tmp.color = '#FF6666';
      polylines.value = [...polylines.value, tmp];
    }
  });
};

const makeMarker = () => {
  markers.value = [];

  mapStore.map.data.forEach((d) => {
    let tmp = {};
    let tmpPosition = {};

    tmpPosition.lat = d.latitude;
    tmpPosition.lng = d.longitude;
    tmp.position = tmpPosition;

    if (d.cleanStatus === 'G' && isGood.value) {
      tmp.image = 'good';
      markers.value = [...markers.value, tmp];
    }
    if (d.cleanStatus === 'N' && isNormal.value) {
      tmp.image = 'normal';
      markers.value = [...markers.value, tmp];
    }
    if (d.cleanStatus === 'B' && isBad.value) {
      tmp.image = 'bad';
      markers.value = [...markers.value, tmp];
    }
    if (d.cleanStatus === 'D' && isDanger.value) {
      tmp.image = 'danger';
      markers.value = [...markers.value, tmp];
    }
  });
};

const markerClick = async (event, data) => {
  markerRef.value.toggle(event);
};

const manholeDetail = () => {
  isDialog.value = true;
};
</script>

<template>
  <ClientOnly>
    <Dialog
      v-model:visible="isDialog"
      :style="{ width: '700px' }"
      header="UGM-4115011000-0002 맨홀"
      :modal="true"
    >
      <Tabs value="0">
        <TabList>
          <Tab value="0">외부정보</Tab>
          <Tab value="1">내부정보</Tab>
          <Tab value="2">관로정보</Tab>
          <Tab value="3">준설이력</Tab>
        </TabList>
        <TabPanels>
          <TabPanel value="0">
            <div class="flex flex-col gap-4">
              <div class="flex flex-row justify-between">
                <img
                  src="/images/manhole_sample.png"
                  class="w-44 h-32 shadow-sm"
                />
              </div>
              <div class="flex flex-row justify-between">
                <div class="flex flex-col">
                  <label for="manholeType" class="text-xs">위치정보</label>
                  <InputText
                    id="manholeType"
                    placeholder="맨홀 형태"
                    value="37.478309621, 127.123330459"
                    class="w-full md:w-72"
                    :disabled="true"
                  />
                </div>
                <div class="flex flex-col">
                  <label for="manholeType" class="text-xs">주소정보</label>
                  <InputText
                    id="manholeType"
                    placeholder="맨홀 형태"
                    value="경기도 안산시 단원구 선부동 1077-20"
                    class="w-full md:w-72"
                    :disabled="true"
                  />
                </div>
              </div>
              <div class="flex flex-row justify-between">
                <div class="flex flex-col">
                  <label for="manholeType" class="text-xs">맨홀 형태</label>
                  <InputText
                    id="manholeType"
                    placeholder="맨홀 형태"
                    value="원형맨홀"
                    class="w-full md:w-72"
                    :disabled="true"
                  />
                </div>
                <div class="flex flex-col">
                  <label for="manholeKind" class="text-xs">맨홀 종류</label>
                  <InputText
                    id="manholeKind"
                    placeholder="맨홀 종류"
                    value="표준맨홀"
                    class="w-full md:w-72"
                    :disabled="true"
                  />
                </div>
              </div>
              <div class="flex flex-row justify-between">
                <div class="flex flex-col">
                  <label for="manholeType" class="text-xs">뚜껑재질</label>
                  <InputText
                    id="manholeType"
                    placeholder="뚜껑재질"
                    value="주철강"
                    class="w-full md:w-72"
                    :disabled="true"
                  />
                </div>
                <div class="flex flex-col">
                  <label for="manholeKind" class="text-xs">배재방식</label>
                  <InputText
                    id="manholeKind"
                    placeholder="배재방식"
                    value="오수"
                    class="w-full md:w-72"
                    :disabled="true"
                  />
                </div>
              </div>
            </div>
          </TabPanel>
          <TabPanel value="1">
            <div class="flex flex-col gap-4">
              <div class="flex flex-row justify-between">
                <img
                  src="/images/manhole_inner.jpg"
                  class="w-44 h-32 shadow-sm"
                />
              </div>
              <div class="flex flex-row justify-between">
                <div class="flex flex-col">
                  <label for="manholeType" class="text-xs">내부배제방식</label>
                  <InputText
                    id="manholeType"
                    placeholder="맨홀 형태"
                    value="오수"
                    class="w-full md:w-72"
                    :disabled="true"
                  />
                </div>
                <div class="flex flex-col">
                  <label for="manholeType" class="text-xs">사다리모양</label>
                  <InputText
                    id="manholeType"
                    placeholder="맨홀 형태"
                    value="두 다리 모두 디딜 수 있는 길이"
                    class="w-full md:w-72"
                    :disabled="true"
                  />
                </div>
              </div>
              <div class="flex flex-row justify-between">
                <div class="flex flex-col">
                  <label for="manholeType" class="text-xs">사다리재질질</label>
                  <InputText
                    id="manholeType"
                    placeholder="맨홀 형태"
                    value="스테인리스강"
                    class="w-full md:w-72"
                    :disabled="true"
                  />
                </div>
                <div class="flex flex-col">
                  <label for="manholeKind" class="text-xs">맨홀지름</label>
                  <InputText
                    id="manholeKind"
                    placeholder="맨홀 종류"
                    value="1200MM"
                    class="w-full md:w-72"
                    :disabled="true"
                  />
                </div>
              </div>
              <div class="flex flex-row justify-between">
                <div class="flex flex-col">
                  <label for="manholeType" class="text-xs">인버트유무</label>
                  <InputText
                    id="manholeType"
                    placeholder="뚜껑재질"
                    value="유"
                    class="w-full md:w-72"
                    :disabled="true"
                  />
                </div>
                <div class="flex flex-col">
                  <label for="manholeKind" class="text-xs">내부재질</label>
                  <InputText
                    id="manholeKind"
                    placeholder="배재방식"
                    value="시멘트"
                    class="w-full md:w-72"
                    :disabled="true"
                  />
                </div>
              </div>
              <div class="flex flex-row justify-between">
                <div class="flex flex-col">
                  <label for="manholeType" class="text-xs">맨홀깊이</label>
                  <InputText
                    id="manholeType"
                    placeholder="뚜껑재질"
                    value="3500MM"
                    class="w-full md:w-72"
                    :disabled="true"
                  />
                </div>
              </div>
            </div>
          </TabPanel>
          <TabPanel value="2">
            <div class="flex flex-col gap-4">
              <div class="flex flex-row justify-between">
                <img src="/images/duct1.jpg" class="w-44 h-32 shadow-sm" />
              </div>
              <DataTable
                :value="ducts"
                :dataKey="(data) => `${data.index}`"
                :rowHover="true"
              >
                <Column
                  header="관로종류류"
                  field="ductType"
                  bodyClass="text-center"
                  style="min-width: 6rem"
                >
                </Column>
                <Column
                  header="매설방식"
                  field="ductLayWay"
                  bodyClass="text-center"
                  style="min-width: 4rem"
                >
                </Column>
                <Column
                  header="관경"
                  field="dictDiameter"
                  bodyClass="text-center"
                  style="min-width: 3rem"
                >
                </Column>
                <Column
                  header="매설깊이"
                  field="ductHeight"
                  bodyClass="text-center"
                  style="min-width: 3rem"
                >
                </Column>
                <Column
                  header="배제방식"
                  field="ductRemoval"
                  bodyClass="text-center"
                  style="min-width: 3rem"
                >
                </Column>
                <Column
                  header="유출입"
                  field="ductFlowInout"
                  bodyClass="text-center"
                  style="min-width: 3rem"
                >
                </Column>
                <Column
                  header="방위각"
                  field="ductDegree"
                  bodyClass="text-center"
                  style="min-width: 3rem"
                >
                </Column>
              </DataTable>
            </div>
          </TabPanel>
          <TabPanel value="3">
            <div class="flex flex-col gap-4">
              <DataTable
                :value="dredges"
                :dataKey="(data) => `${data.index}`"
                :rowHover="true"
              >
                <Column
                  header="준설작업업"
                  field="title"
                  bodyClass="text-center"
                  style="min-width: 15rem"
                >
                </Column>
                <Column
                  header="시행일자자"
                  field="regDt"
                  bodyClass="text-center"
                  style="min-width: 5rem"
                >
                </Column>
                <Column
                  header="기타기능"
                  bodyClass="text-center"
                  style="min-width: 5rem"
                >
                  <template #body="{ data }"
                    ><Button outlined rounded icon="pi pi-external-link"
                  /></template>
                </Column>
              </DataTable>
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Dialog>
    <div
      class="map_card md:h-screen"
      style="padding: 0; margin: 0"
      :style="{ height: `calc(100vh - 4rem)` }"
    >
      <div
        class="flex flex-wrap justify-between absolute z-10 gap-2 mt-4 ml-52"
      >
        <div class="inmap_card shadow-lg flex flex-wrap mr-10">
          <ButtonGroup class="text-lg">
            <Button
              label="맨홀"
              :severity="section === 'M' ? 'info' : 'secondary'"
              :icon="`pi ${section === 'M' ? 'pi-check' : 'pi-times'}`"
              @click="onSectionClick('M')"
            />
            <Button
              label="관로"
              :severity="section === 'P' ? 'info' : 'secondary'"
              :icon="`pi ${section === 'P' ? 'pi-check' : 'pi-times'}`"
              @click="onSectionClick('P')"
            />
            <Button
              label="배수"
              :severity="section === 'D' ? 'info' : 'secondary'"
              :icon="`pi ${section === 'D' ? 'pi-check' : 'pi-times'}`"
              @click="onSectionClick('D')"
            />
            <Button
              label="센서"
              :severity="section === 'S' ? 'info' : 'secondary'"
              :icon="`pi ${section === 'S' ? 'pi-check' : 'pi-times'}`"
              @click="onSectionClick('S')"
            />
          </ButtonGroup>
        </div>
        <div class="inmap_card flex flex-wrap mr-10 gap-2">
          <Button
            label="좋음"
            rounded
            :style="`background-color: ${
              isGood ? '#6BD3FF' : '#C1C1C1'
            }; border: none`"
            @click="onStatusClick('G')"
          />
          <Button
            label="보통"
            rounded
            :style="`background-color: ${
              isNormal ? '#44AF68' : '#C1C1C1'
            }; border: none`"
            @click="onStatusClick('N')"
          />
          <Button
            label="나쁨"
            rounded
            :style="`background-color: ${
              isBad ? '#f4db56' : '#C1C1C1'
            }; border: none`"
            @click="onStatusClick('B')"
          />
          <Button
            label="위험"
            rounded
            :style="`background-color: ${
              isDanger ? '#FF6666' : '#C1C1C1'
            }; border: none`"
            @click="onStatusClick('D')"
          />
        </div>
      </div>
      <div class="flex flex-wrap justify-center absolute z-10 top-1/2 ml-2">
        <Button
          rounded
          severity="contrast"
          icon="pi pi-arrow-right"
          @click="isDraw = true"
        />
      </div>
      <div class="grid place-items-center absolute z-10 mt-24 left-1/2">
        <Button
          v-if="isSearchBtn"
          label="이 지역 검색"
          rounded
          severity="secondary"
          icon="pi pi-search"
          @click="searchData"
        />
      </div>

      <GMapMap
        ref="mapRef"
        :center="defaultCenter"
        :zoom="17"
        :options="{
          zoomControl: true,
          mapTypeControl: true,
          scaleControl: false,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: true,
        }"
        @bounds_changed="calculateDistance"
        @dragend="onDragMap"
      >
        <GmapCustomMarker
          :key="index"
          v-for="(m, index) in markers"
          :marker="m.position"
          :nuxtMode="true"
        >
          <img
            :src="`/images/${m.image}.png`"
            style="width: 23px; height: 23px"
            class="cursor-pointer"
            @click="markerClick($event, m)"
          />
        </GmapCustomMarker>
        <GMapPolyline
          v-for="(m, index) in polylines"
          :key="index"
          :path="m.line"
          :options="{
            strokeColor: m.color, // 선 색상
            strokeOpacity: 1.0, // 투명도
            strokeWeight: 2,
          }"
        />
      </GMapMap>
    </div>
    <Popover ref="markerRef" id="overlay_panel" style="width: 450px">
      <div class="card">
        <div class="flex flex-col">
          <div class="flex flex-row justify-between">
            <div class="content-center">경기도 의정부시 가능 1동 115-85</div>
            <div>
              <Button
                text
                severity="secondary"
                icon="pi pi-times"
                @click="markerClick($event)"
              />
            </div>
          </div>
          <div class="flex flex-row">
            <div class="mr-2">
              <Rating v-model="ratingValue" />
            </div>
            <div class="text-sm">4.0</div>
          </div>
          <div class="flex flex-row mt-2 gap-1">
            <Button
              icon="pi pi-at"
              severity="info"
              rounded
              style="opacity: 0.7"
            />
            <Button
              icon="pi pi-map-marker"
              severity="info"
              rounded
              style="opacity: 0.7"
            />
            <Button
              icon="pi pi-send"
              severity="info"
              rounded
              style="opacity: 0.7"
            />
            <Button
              icon="pi pi-bookmark"
              severity="info"
              rounded
              style="opacity: 0.7"
            />
          </div>
          <div class="flex flex-row mt-2 gap-2">
            <img src="/images/manhole_sample.png" class="w-44 h-32 shadow-sm" />
            <div class="flex flex-col">
              <div class="flex flex-row">
                <div class="font-semibold">맨홀형태</div>
                <div class="text-sm content-center ml-6">원형맨홀</div>
              </div>
              <div class="flex flex-row">
                <div class="font-semibold">맨홀종류</div>
                <div class="text-sm content-center ml-6">표준맨홀</div>
              </div>
              <div class="flex flex-row">
                <div class="font-semibold">해발고도</div>
                <div class="text-sm content-center ml-6">19M</div>
              </div>
              <div class="flex flex-row">
                <div class="font-semibold">준설이력</div>
                <div class="text-sm content-center ml-6">2건</div>
              </div>
            </div>
          </div>
          <div class="flex flex-row justify-evenly mt-2 gap-2">
            <Button
              outlined
              severity="secondary"
              label="정보확인"
              @click="manholeDetail"
            />
            <Button
              outlined
              severity="secondary"
              label="정보수정"
              @click="manholeDetail"
            />
            <Button
              outlined
              severity="secondary"
              label="준설작업"
              @click="manholeDetail"
            />
          </div>
        </div>
      </div>
      <!-- <DataTable
        v-model:selection="selectedProduct"
        :value="products"
        selectionMode="single"
        :paginator="true"
        :rows="5"
        @row-select="onProductSelect"
      >
        <Column
          field="name"
          header="Name"
          sortable
          style="min-width: 12rem"
        ></Column>
        <Column header="Image">
          <template #body="slotProps">
            <img
              :src="`https://primefaces.org/cdn/primevue/images/product/${slotProps.data.image}`"
              :alt="slotProps.data.image"
              class="w-16 shadow-sm"
            />
          </template>
        </Column>
        <Column field="price" header="Price" sortable style="min-width: 8rem">
          <template #body="slotProps"> $ {{ slotProps.data.price }} </template>
        </Column>
      </DataTable> -->
    </Popover>
    <Drawer
      v-model:visible="isDraw"
      header="지도 검색"
      :style="{ width: '400px' }"
    >
      <InputGroup>
        <InputText
          v-model="searchName"
          placeholder="읍 면 동 입력"
          @keyup="fetchArea"
        />
        <InputGroupAddon>
          <i class="pi pi-search" style="font-weight: bold"></i>
        </InputGroupAddon>
      </InputGroup>

      <DataView :value="searchAreas">
        <template #empty>{{
          !searchName ? '검색어를 입력 하세요.' : '검색된 데이터가 없습니다.'
        }}</template>
        <template #list="slotProps">
          <div class="flex flex-col">
            <div v-for="(item, index) in slotProps.items" :key="index">
              <div
                class="flex flex-col sm:flex-row sm:items-center p-6 gap-4"
                :class="{
                  'border-t border-surface-200 dark:border-surface-700':
                    index !== 0,
                }"
              >
                <div
                  class="flex flex-wrap gap-4 cursor-pointer"
                  @click="setCenter(item)"
                >
                  <i
                    class="pi pi-globe place-self-center"
                    style="font-weight: bold"
                  ></i>
                  {{ item.title }}
                </div>
              </div>
            </div>
          </div>
        </template>
      </DataView>
    </Drawer>
  </ClientOnly>
</template>

<style lang="scss" scoped>
body {
  padding: 0 !important; /* padding 제거 */
  margin: 0; /* margin도 필요하면 제거 */
}
</style>
