<script setup>
import GmapCustomMarker from 'googlemap-custom-marker-vue';

definePageMeta({
  layout: 'map',
});

const defaultCenter = ref({ lat: 37.74976111, lng: 127.0566825 });
const distance = ref(0);
const markers = ref([]);
const mapRef = ref();
const isGood = ref(true);
const isNormal = ref(true);
const isBad = ref(true);
const isDanger = ref(true);
const isSearchBtn = ref(false);
const paramCenter = ref({
  latitude: 37.74976111,
  longitude: 127.0566825,
  meter: 650,
});

// api통신 하는 모듈 선언
const sampleStore = useSampleStore();

const { status, error, refresh } = await useAsyncData(
  'sample',
  () => sampleStore.getMapData(paramCenter.value),
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
};

const searchData = () => {
  refresh();

  isSearchBtn.value = false;
};

const onDragMap = (event) => {
  isSearchBtn.value = true;
};

watch(status, (newVal) => {
  if (newVal === 'success') {
    makeMarker();
    // if (section.value === 'P') makePolyline();
  }
});

const makeMarker = () => {
  markers.value = [];

  sampleStore.map.data.forEach((d, i) => {
    let tmp = {};
    let tmpPosition = {};

    tmpPosition.lat = d.latitude;
    tmpPosition.lng = d.longitude;
    tmp.position = tmpPosition;

    // tmp.image = 'good';
    // markers.value = [...markers.value, tmp];

    if (
      (d.manholeType === 'AZB012' || d.manholeType === 'AZB010') &&
      isGood.value
    ) {
      tmp.image = 'good';
      markers.value = [...markers.value, tmp];
    } else if (
      (d.manholeType === 'AZB011' || d.manholeType === 'AZB015') &&
      isNormal.value
    ) {
      tmp.image = 'normal';
      markers.value = [...markers.value, tmp];
    } else if (
      (d.manholeType === 'AZB016' || d.manholeType === 'AZB013') &&
      isBad.value
    ) {
      tmp.image = 'bad';
      markers.value = [...markers.value, tmp];
    } else if (
      (d.manholeType === 'AZB999' || d.manholeType === 'AZB014') &&
      isDanger.value
    ) {
      tmp.image = 'danger';
      markers.value = [...markers.value, tmp];
      // }
    } else {
      if (i % 5 === 0 && isGood.value) {
        tmp.image = 'good';
        markers.value = [...markers.value, tmp];
      }
    }
  });
};

const onStatusClick = (type) => {
  if (type === 'G') isGood.value = !isGood.value;
  if (type === 'N') isNormal.value = !isNormal.value;
  if (type === 'B') isBad.value = !isBad.value;
  if (type === 'D') isDanger.value = !isDanger.value;

  makeMarker();
};
</script>

<template>
  <ClientOnly>
    <div
      class="map_card md:h-screen"
      style="padding: 0; margin: 0"
      :style="{ height: `calc(100vh - 4rem)` }"
    >
      <div
        class="flex flex-wrap justify-between absolute z-10 gap-2 mt-4 ml-52"
      >
        <!-- <div class="inmap_card shadow-lg flex flex-wrap mr-10">
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
        </div> -->
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
      <!-- <div class="flex flex-wrap justify-center absolute z-10 top-1/2 ml-2">
        <Button
          rounded
          severity="contrast"
          icon="pi pi-arrow-right"
          @click="isDraw = true"
        />
      </div> -->
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
            style="width: 18px; height: 18px"
          />
        </GmapCustomMarker>
        <!-- <GMapPolyline
          v-for="(m, index) in polylines"
          :key="index"
          :path="m.line"
          :options="{
            strokeColor: m.color, // 선 색상
            strokeOpacity: 1.0, // 투명도
            strokeWeight: 2,
          }"
        /> -->
      </GMapMap>
    </div>
    <!-- <Drawer
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
    </Drawer> -->
  </ClientOnly>
</template>

<style lang="scss" scoped>
.gm-style-mtc {
  background-color: #ffffff; /* 배경색 */
  border: 1px solid #cccccc; /* 테두리 */
  border-radius: 5px; /* 둥근 모서리 */
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.2); /* 그림자 */
}

/* 지도 유형 버튼 스타일 */
.gm-style-mtc button {
  background-color: #f8f9fa; /* 버튼 배경색 */
  color: #c2c2c2; /* 글자 색 */
  padding: 5px 10px; /* 버튼 안쪽 여백 */
  border: none; /* 기본 테두리 제거 */
  border-radius: 3px; /* 버튼 둥글게 */
  cursor: pointer; /* 커서 스타일 */
  font-size: 12px;
}

/* 버튼 hover 스타일 */
.gm-style-mtc button:hover {
  background-color: #e9ecef; /* hover 시 배경색 */
}

/* 버튼 active 스타일 */
.gm-style-mtc button:active {
  background-color: #dee2e6; /* active 시 배경색 */
}
</style>
