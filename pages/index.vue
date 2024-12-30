<script setup>
import Chart from 'primevue/chart';
import GmapCustomMarker from 'googlemap-custom-marker-vue';
import { Calendar } from 'v-calendar';
import dayjs from 'dayjs';

// api통신 하는 모듈 선언
const dashboardStore = useDashboardStore();

const router = useRouter();

// 필수값 체크 함수 선언
const { isInvalid } = useInvalidate();

const category = ref('M');
const myJobMng = ref('0');
const manholeData = ref(null);
const pipeData = ref(null);
const ductData = ref(null);
const pieOptions = ref(null);
const sensorData = ref(null);
const sensorOptions = ref(null);
const markers = ref([]);
const selectedDate = ref(null);
const selectedJobs = ref([]);
const attributes = ref([
  {
    key: 'today',
    highlight: {
      color: 'green',
      fillMode: 'solid',
    },
    dates: new Date(),
  },
]);

const isMyAlertDialog = ref(false);
const isMyJobDialog = ref(false);

const todayAM = ref('');
const todayPM = ref('');
const tomorrowAM = ref('');
const tomorrowPM = ref('');
const afterTomorrowAM = ref('');
const afterTomorrowPM = ref('');

// 메인 리스트 조회
const { status, error, refresh } = await useAsyncData(
  'dashboard',
  () => dashboardStore.getDashboard(),
  {
    server: false,
    lazy: true,
  }
);

const procMyJobBottom = computed(() => (type) => {
  let result = 0;

  dashboardStore.dashboard.data.mapStatuses.forEach((w) => {
    if (type === 'waterQuality') result += w.waterQuality;
    else if (type === 'flooded') result += w.flooded;
    else if (type === 'stink') result += w.stink;
    else if (type === 'etc') result += w.etc;
  });

  return result;
});

const dredgeImage = computed(() => (status, newMessage) => {
  let result = 'btn_message_finished';

  if (status === '3') {
    result = 'btn_message_verified';

    if (newMessage) {
      result = 'btn_message_unverified';
    }
  }

  return result;
});

// Polyline 스타일 옵션
const polylineOptions = {
  strokeColor: '#6BD3FF', // 선 색상
  strokeOpacity: 1.0, // 투명도
  strokeWeight: 2, // 선 두께
};

onMounted(async () => {
  await dashboardStore.getWeather();

  getWeather();
});

// 내알림
const goMyJobAlert = () => {
  isMyAlertDialog.value = true;
};

// 내업무관리
const goMyJobManagement = () => {
  isMyJobDialog.value = true;
};

const moveMapPage = (data) => {
  navigateTo({
    path: '/manhole/manholeMap',
    query: { lat: data.position.lat, lng: data.position.lng },
  });
};

watch(status, (newVal) => {
  if (newVal === 'success') {
    // 내업무관리 데이터 셋팅
    dashboardStore.dashboard.data.myJobs.forEach((d) => {
      let tmp = {};
      tmp.key = d.targetDt;
      tmp.dates = d.targetDt;
      tmp.dot = true;

      attributes.value = [...attributes.value, tmp];
    });

    selectedJobs.value = dashboardStore.dashboard.data.myJobs.filter(
      (d) => d.targetDt === dayjs(new Date()).format('YYYY-MM-DD')
    );

    // 지도마커 데이터 셋팅
    markerChange('M', '');
    setChartData();
  }
});

const getWeather = () => {
  const today = new Date();
  const afterToday = new Date();
  const tomorrow = new Date(today.setDate(today.getDate() + 1));
  const afterTomorrow = new Date(afterToday.setDate(afterToday.getDate() + 2));

  dashboardStore.weather.data.forEach((d) => {
    if (d.fcstDate === dayjs(new Date()).format('YYYYMMDD')) {
      if (d.fcstTime == '0600') {
        if (d.category == 'SKY') {
          if (d.fcstValue == '1') {
            todayAM.value = 'NB01.png';
          } else if (d.fcstValue == '4') {
            todayAM.value = 'NB04.png';
          } else {
            todayAM.value = 'NB03.png';
          }
        }

        if (d.category == 'PCP') {
          if (d.fcstValue != '강수없음') {
            todayAM.value = 'NB08.png';
          }
        }
      }
      if (d.fcstTime == '1400') {
        if (d.category == 'SKY') {
          if (d.fcstValue == '1') {
            todayPM.value = 'NB01.png';
          } else if (d.fcstValue == '4') {
            todayPM.value = 'NB04.png';
          } else {
            todayPM.value = 'NB03.png';
          }
        }

        if (d.category == 'PCP') {
          if (d.fcstValue != '강수없음') {
            todayPM.value = 'NB08.png';
          }
        }
      }
    }
    if (d.fcstDate === dayjs(tomorrow).format('YYYYMMDD')) {
      if (d.fcstTime == '0600') {
        if (d.category == 'SKY') {
          if (d.fcstValue == '1') {
            tomorrowAM.value = 'NB01.png';
          } else if (d.fcstValue == '4') {
            tomorrowAM.value = 'NB04.png';
          } else {
            tomorrowAM.value = 'NB03.png';
          }
        }

        if (d.category == 'PCP') {
          if (d.fcstValue != '강수없음') {
            tomorrowAM.value = 'NB08.png';
          }
        }
      }
      if (d.fcstTime == '1400') {
        if (d.category == 'SKY') {
          if (d.fcstValue == '1') {
            tomorrowPM.value = 'NB01.png';
          } else if (d.fcstValue == '4') {
            tomorrowPM.value = 'NB04.png';
          } else {
            tomorrowPM.value = 'NB03.png';
          }
        }

        if (d.category == 'PCP') {
          if (d.fcstValue != '강수없음') {
            tomorrowPM.value = 'NB08.png';
          }
        }
      }
    }
    if (d.fcstDate === dayjs(afterTomorrow).format('YYYYMMDD')) {
      if (d.fcstTime == '0600') {
        if (d.category == 'SKY') {
          if (d.fcstValue == '1') {
            afterTomorrowAM.value = 'NB01.png';
          } else if (d.fcstValue == '4') {
            afterTomorrowAM.value = 'NB04.png';
          } else {
            afterTomorrowAM.value = 'NB03.png';
          }
        }

        if (d.category == 'PCP') {
          if (d.fcstValue != '강수없음') {
            afterTomorrowAM.value = 'NB08.png';
          }
        }
      }
      if (d.fcstTime == '1400') {
        if (d.category == 'SKY') {
          if (d.fcstValue == '1') {
            afterTomorrowPM.value = 'NB01.png';
          } else if (d.fcstValue == '4') {
            afterTomorrowPM.value = 'NB04.png';
          } else {
            afterTomorrowPM.value = 'NB03.png';
          }
        }

        if (d.category == 'PCP') {
          if (d.fcstValue != '강수없음') {
            afterTomorrowPM.value = 'NB08.png';
          }
        }
      }
    }
  });
};

const setChartData = () => {
  let totManhole = [0, 0, 0, 0];
  let totPipe = [0, 0, 0, 0];
  let totDuct = [0, 0, 0, 0];
  let totSensor = [0, 0, 0, 0];

  dashboardStore.dashboard.data.mapStatuses.forEach((d) => {
    totManhole[0] += Math.round(getNulltoZero(d.mGoodCount) * 0.4);
    totManhole[1] += Math.round(getNulltoZero(d.mNormalCount) * 0.15);
    totManhole[2] += Math.round(getNulltoZero(d.mBadCount) * 0.3);
    totManhole[3] += Math.round(getNulltoZero(d.mDangerCount) * 0.08);

    totPipe[0] += Math.round(getNulltoZero(d.dGoodCount) * 0.27);
    totPipe[1] += Math.round(getNulltoZero(d.dNormalCount) * 0.22);
    totPipe[2] += Math.round(getNulltoZero(d.dBadCount) * 0.15);
    totPipe[3] += Math.round(getNulltoZero(d.dDangerCount) * 0.2);

    totDuct[0] += Math.round(getNulltoZero(d.daGoodCount) * 0.28);
    totDuct[1] += Math.round(getNulltoZero(d.daNormalCount) * 0.26);
    totDuct[2] += Math.round(getNulltoZero(d.daBadCount) * 0.22);
    totDuct[3] += Math.round(getNulltoZero(d.daDangerCount) * 0.24);
  });

  manholeData.value = {
    labels: ['좋음', '보통', '나쁨', '위험'],
    datasets: [
      {
        data: totManhole,
        backgroundColor: ['#6BD3FF', '#44AF68', '#F4DB56', '#FF6666'],
        hoverBackgroundColor: ['#6BD3FF', '#44AF68', '#F4DB56', '#FF6666'],
      },
    ],
  };
  pipeData.value = {
    labels: ['좋음', '보통', '나쁨', '위험'],
    datasets: [
      {
        data: totPipe,
        backgroundColor: ['#6BD3FF', '#44AF68', '#F4DB56', '#FF6666'],
        hoverBackgroundColor: ['#6BD3FF', '#44AF68', '#F4DB56', '#FF6666'],
      },
    ],
  };
  ductData.value = {
    labels: ['좋음', '보통', '나쁨', '위험'],
    datasets: [
      {
        data: totDuct,
        backgroundColor: ['#6BD3FF', '#44AF68', '#F4DB56', '#FF6666'],
        hoverBackgroundColor: ['#6BD3FF', '#44AF68', '#F4DB56', '#FF6666'],
      },
    ],
  };
  pieOptions.value = {
    // responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
        position: 'left',
        labels: {
          usePointStyle: true,
        },
      },
    },
  };

  sensorData.value = {
    labels: ['A', 'B', 'C'],
    datasets: [
      {
        label: '수질',
        borderColor: '#ff6421',
        pointBackgroundColor: '#ff6421',
        pointBorderColor: '#ff6421',
        pointHoverBackgroundColor: '#ff6421',
        pointHoverBorderColor: '#ff6421',
        data: [65, 59, 81],
        borderWidth: 1,
        pointRadius: 1,
      },
      {
        label: '침수',
        borderColor: '#6bd3ff',
        pointBackgroundColor: '#6bd3ff',
        pointBorderColor: '#6bd3ff',
        pointHoverBackgroundColor: '#6bd3ff',
        pointHoverBorderColor: '#6bd3ff',
        data: [28, 40, 19],
        borderWidth: 1,
        pointRadius: 1,
      },
      {
        label: '악취',
        borderColor: '#2381e6',
        pointBackgroundColor: '#2381e6',
        pointBorderColor: '#2381e6',
        pointHoverBackgroundColor: '#2381e6',
        pointHoverBorderColor: '#2381e6',
        data: [64, 82, 36],
        borderWidth: 1,
        pointRadius: 1,
      },
      {
        label: '기타',
        borderColor: '#74debe',
        pointBackgroundColor: '#74debe',
        pointBorderColor: '#74debe',
        pointHoverBackgroundColor: '#74debe',
        pointHoverBorderColor: '#74debe',
        data: [30, 80, 92],
        borderWidth: 1,
        pointRadius: 1,
      },
    ],
  };
  sensorOptions.value = {
    plugins: {
      legend: {
        display: false,
      },
    },
  };
};

const getNulltoZero = (data) => {
  if (data === undefined || isInvalid(data)) return 0;
  else return data;
};

const dayClick = (day) => {
  selectedJobs.value = dashboardStore.dashboard.data.myJobs.filter(
    (d) => d.targetDt === dayjs(day.date).format('YYYY-MM-DD')
  );
};

const markerChange = (type, status) => {
  // 지도마커 데이터 셋팅 (클릭에 따른)
  markers.value = [];

  category.value = type;

  dashboardStore.dashboard.data.mapStatuses.forEach((e) => {
    let tmp = {};
    let tmpPosition = {};

    tmp.bgColor = '#000000';
    tmp.opacity = 0.4;

    if (status === 'G') {
      tmp.bgColor = '#6BD3FF';
      tmp.opacity = 0.8;
    }
    if (status === 'N') {
      tmp.bgColor = '#44AF68';
      tmp.opacity = 0.7;
    }
    if (status === 'B') {
      tmp.bgColor = '#F4DB56';
      tmp.opacity = 0.8;
    }
    if (status === 'D') {
      tmp.bgColor = '#FF6666';
      tmp.opacity = 0.7;
    }

    if (type === 'S') {
      tmp.count =
        getNulltoZero(e.waterQuality) +
        getNulltoZero(e.flooded) +
        getNulltoZero(e.stink) +
        getNulltoZero(e.etc);

      if (status === 'W') {
        tmp.count = getNulltoZero(e.waterQuality);
        tmp.bgColor = '#FF6421';
      }
      if (status === 'F') {
        tmp.count = getNulltoZero(e.flooded);
        tmp.bgColor = '#6BD3FF';
      }
      if (status === 'S') {
        tmp.count = getNulltoZero(e.stink);
        tmp.bgColor = '#2381E6';
      }
      if (status === 'E') {
        tmp.count = getNulltoZero(e.etc);
        tmp.bgColor = '#74DEBE';
      }
    } else if (type === 'M') {
      tmp.count =
        Math.round(getNulltoZero(e.mGoodCount) * 0.4) +
        Math.round(getNulltoZero(e.mNormalCount) * 0.15) +
        Math.round(getNulltoZero(e.mBadCount) * 0.3) +
        Math.round(getNulltoZero(e.mDangerCount) * 0.08);

      if (status === 'G')
        tmp.count = Math.round(getNulltoZero(e.mGoodCount) * 0.4);
      if (status === 'N')
        tmp.count = Math.round(getNulltoZero(e.mNormalCount) * 0.15);
      if (status === 'B')
        tmp.count = Math.round(getNulltoZero(e.mBadCount) * 0.3);
      if (status === 'D')
        tmp.count = Math.round(getNulltoZero(e.mDangerCount) * 0.08);
    } else if (type === 'P') {
      tmp.count =
        Math.round(getNulltoZero(e.dGoodCount) * 0.27) +
        Math.round(getNulltoZero(e.dNormalCount) * 0.22) +
        Math.round(getNulltoZero(e.dBadCount) * 0.15) +
        Math.round(getNulltoZero(e.dDangerCount) * 0.2);

      if (status === 'G')
        tmp.count = Math.round(getNulltoZero(e.dGoodCount) * 0.27);
      if (status === 'N')
        tmp.count = Math.round(getNulltoZero(e.dNormalCount) * 0.22);
      if (status === 'B')
        tmp.count = Math.round(getNulltoZero(e.dBadCount) * 0.15);
      if (status === 'D')
        tmp.count = Math.round(getNulltoZero(e.dDangerCount) * 0.2);
    } else if (type === 'D') {
      tmp.count =
        Math.round(getNulltoZero(e.daGoodCount) * 0.28) +
        Math.round(getNulltoZero(e.daNormalCount) * 0.26) +
        Math.round(getNulltoZero(e.daBadCount) * 0.22) +
        Math.round(getNulltoZero(e.daDangerCount) * 0.24);

      if (status === 'G')
        tmp.count = Math.round(getNulltoZero(e.daGoodCount) * 0.28);
      if (status === 'N')
        tmp.count = Math.round(getNulltoZero(e.daNormalCount) * 0.26);
      if (status === 'B')
        tmp.count = Math.round(getNulltoZero(e.daBadCount) * 0.22);
      if (status === 'D')
        tmp.count = Math.round(getNulltoZero(e.daDangerCount) * 0.24);
    }

    if (tmp.count !== 0) {
      tmpPosition.lat = e.lat;
      tmpPosition.lng = e.lng;
      tmp.position = tmpPosition;

      markers.value = [...markers.value, tmp];
    }
  });
};
</script>

<template>
  <ClientOnly>
    <!-- 내 알림 -->
    <Dialog
      v-model:visible="isMyAlertDialog"
      :style="{ width: '800px' }"
      header="내 알림"
      :modal="true"
    >
      <DataView :value="dashboardStore.dashboard.data.myAlerts">
        <template #header></template>
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
                  class="flex flex-col md:flex-row justify-between md:items-center flex-1 gap-6"
                >
                  <div class="flex flex-row">
                    <div class="flex flex-col place-self-center mr-4">
                      <i class="pi pi-bell text-red-600 text-xl"></i>
                    </div>
                    <div class="flex flex-col">
                      <span class="mb-2">{{ item.title }}</span>
                      <div class="flex flex-row">
                        <div class="text-sm mr-10 text-gray-400">
                          {{ item.category }}
                        </div>
                        <div class="text-sm text-gray-400">
                          {{ item.regDt }}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="flex flex-row place-self-center">
                    <Button outlined rounded icon="pi pi-external-link" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </DataView>
    </Dialog>
    <!-- //내 알림 -->

    <!-- 내 업무관리 -->
    <Dialog
      v-model:visible="isMyJobDialog"
      :style="{ width: '800px' }"
      header="내 업무관리"
      :modal="true"
    >
      <div class="flex flex-row gap-4">
        <VCalendar locale="ko" :attributes="attributes" @dayclick="dayClick" />
        <DataView :value="selectedJobs">
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
                  <div class="flex flex-row">
                    <div class="flex flex-col">
                      <span class="mb-2">{{ item.title }}</span>
                      <div class="flex flex-row">
                        <div class="text-sm mr-10 text-gray-400">
                          {{ item.description }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </DataView>
      </div>
    </Dialog>
    <!-- //내 업무관리 -->

    <ProgressSpinner
      v-if="status === 'pending'"
      class="grid place-items-center justify-center"
    />
    <div v-else class="grid grid-cols-11 gap-4">
      <div class="col-span-11 lg:col-span-4 xl:col-span-3">
        <div class="card" style="border-radius: 20px">
          <div class="font-semibold text-base mb-6 ml-4 mt-4">
            내 진행중인 업무
          </div>
          <div
            class="flex flex-wrap justify-between font-semibold text-base mb-8 ml-6 mr-6"
          >
            <div class="flex flex-col cursor-pointer" @click="goMyJobAlert">
              <OverlayBadge
                value="3"
                severity="danger"
                class="inline-flex justify-center"
              >
                <Avatar
                  size="xlarge"
                  :image="'/images/ic_alarm.png'"
                  :style="{ 'background-color': '#78DED2', color: '#ffffff' }"
                />
              </OverlayBadge>
              <span class="font-normal text-xs text-center mt-1">내 알림</span>
            </div>
            <div
              class="flex flex-col cursor-pointer"
              @click="goMyJobManagement"
            >
              <OverlayBadge
                value="3"
                severity="danger"
                class="inline-flex justify-center"
              >
                <Avatar
                  size="xlarge"
                  :image="'/images/ic_cases.png'"
                  :style="{ 'background-color': '#F3BB79', color: '#ffffff' }"
                />
              </OverlayBadge>
              <span class="font-normal text-xs text-center mt-1"
                >내 업무관리</span
              >
            </div>
            <div class="flex flex-col">
              <OverlayBadge
                value="2"
                severity="danger"
                class="inline-flex justify-center"
              >
                <Avatar
                  size="xlarge"
                  :image="'/images/icon_manage_accounts.png'"
                  :style="{ 'background-color': '#78CCFB', color: '#ffffff' }"
                />
              </OverlayBadge>
              <span class="font-normal text-xs text-center mt-1"
                >권한승인관리</span
              >
            </div>
            <div class="flex flex-col justify-center">
              <OverlayBadge
                value="0"
                severity="danger"
                class="inline-flex justify-center"
              >
                <Avatar
                  size="xlarge"
                  :image="'/images/ic_support_agent.png'"
                  :style="{ 'background-color': '#C895EF', color: '#ffffff' }"
                />
              </OverlayBadge>
              <span class="font-normal text-xs text-center mt-1">1:1문의</span>
            </div>
          </div>

          <div
            class="flex flex-wrap justify-between font-semibold text-base mb-4 ml-6 mr-6"
          >
            <div
              class="flex flex-col cursor-pointer"
              @click="markerChange('S', 'W')"
            >
              <span class="font-normal text-sm text-center">수질</span>
              <hr class="mt-1 mb-2" />
              <span
                class="font-semibold text-3xl text-red-600 text-center mt-1"
                >{{ procMyJobBottom('waterQuality') }}</span
              >
            </div>
            <div
              class="flex flex-col cursor-pointer"
              @click="markerChange('S', 'F')"
            >
              <span class="font-normal text-sm text-center">침수</span>
              <hr class="mt-1 mb-2" />
              <span
                class="font-semibold text-3xl text-red-600 text-center mt-1"
                >{{ procMyJobBottom('flooded') }}</span
              >
            </div>
            <div
              class="flex flex-col cursor-pointer"
              @click="markerChange('S', 'S')"
            >
              <span class="font-normal text-sm text-center">악취</span>
              <hr class="mt-1 mb-2" />
              <span
                class="font-semibold text-3xl text-red-600 text-center mt-1"
                >{{ procMyJobBottom('stink') }}</span
              >
            </div>
            <div
              class="flex flex-col cursor-pointer"
              @click="markerChange('S', 'E')"
            >
              <span class="font-normal text-sm text-center">기타</span>
              <hr class="mt-1 mb-2" />
              <span
                class="font-semibold text-3xl text-zinc-400 text-center mt-1"
                >{{ procMyJobBottom('etc') }}</span
              >
            </div>
          </div>
        </div>

        <div class="card" style="border-radius: 20px">
          <div
            class="flex flex-wrap justify-between font-semibold text-base ml-4 mt-4"
          >
            <div>현장관리 목록</div>
            <i class="pi pi-plus" />
          </div>
          <Tabs value="0">
            <TabList>
              <div>
                <Tab value="0" class="text-xs">전체</Tab>
                <Tab value="1" class="text-xs">계약</Tab>
                <Tab value="2" class="text-xs">진행중</Tab>
                <Tab value="3" class="text-xs">완료</Tab>
              </div>
              <div class="content-center ml-auto">
                <img src="/images/ic_message_add.png" style="width: 20px" />
              </div>
            </TabList>
            <TabPanels class="p-0 ml-3 mt-3">
              <TabPanel value="0">
                <div
                  v-for="data in dashboardStore.dashboard.data.dredges"
                  class="flex flex-row justify-between mb-3"
                >
                  <div class="flex flex-col">
                    <span class="text-sm mb-1 text-ellipsis">{{
                      data.title
                    }}</span>
                    <div class="flex flex-row">
                      <span class="text-xs text-gray-400 mr-2">{{
                        data.regDt
                      }}</span>
                      <Tag
                        :value="data.statusName"
                        :severity="
                          data.status === '2'
                            ? 'info'
                            : data.status === '3'
                            ? 'success'
                            : 'secondary'
                        "
                        class="small-tag"
                      />
                      <span class="text-xs text-gray-500 ml-2">{{
                        data.category
                      }}</span>
                    </div>
                  </div>
                  <div class="content-center">
                    <img
                      :src="`/images/${dredgeImage(
                        data.status,
                        data.newMessage
                      )}.png`"
                      style="width: 20px; height: 18px"
                    />
                  </div>
                </div>
              </TabPanel>
              <TabPanel value="1">
                <div
                  v-for="data in dashboardStore.dashboard.data.dredges.filter(
                    (d) => d.status === '2'
                  )"
                  class="flex flex-row justify-between mb-3"
                >
                  <div class="flex flex-col">
                    <span class="text-sm mb-1 text-ellipsis">{{
                      data.title
                    }}</span>
                    <div class="flex flex-row">
                      <span class="text-xs text-gray-400 mr-2">{{
                        data.regDt
                      }}</span>
                      <Tag
                        :value="data.statusName"
                        :severity="
                          data.status === '2'
                            ? 'info'
                            : data.status === '3'
                            ? 'success'
                            : 'secondary'
                        "
                        class="small-tag"
                      />
                      <span class="text-xs text-gray-500 ml-2">{{
                        data.category
                      }}</span>
                    </div>
                  </div>
                  <div class="content-center">
                    <img
                      :src="`/images/${dredgeImage(
                        data.status,
                        data.newMessage
                      )}.png`"
                      style="width: 20px; height: 18px"
                    />
                  </div>
                </div>
              </TabPanel>
              <TabPanel value="2">
                <div
                  v-for="data in dashboardStore.dashboard.data.dredges.filter(
                    (d) => d.status === '3'
                  )"
                  class="flex flex-row justify-between mb-3"
                >
                  <div class="flex flex-col">
                    <span class="text-sm mb-1 text-ellipsis">{{
                      data.title
                    }}</span>
                    <div class="flex flex-row">
                      <span class="text-xs text-gray-400 mr-2">{{
                        data.regDt
                      }}</span>
                      <Tag
                        :value="data.statusName"
                        :severity="
                          data.status === '2'
                            ? 'info'
                            : data.status === '3'
                            ? 'success'
                            : 'secondary'
                        "
                        class="small-tag"
                      />
                      <span class="text-xs text-gray-500 ml-2">{{
                        data.category
                      }}</span>
                    </div>
                  </div>
                  <div class="content-center">
                    <img
                      :src="`/images/${dredgeImage(
                        data.status,
                        data.newMessage
                      )}.png`"
                      style="width: 20px; height: 18px"
                    />
                  </div>
                </div>
              </TabPanel>
              <TabPanel value="3">
                <div
                  v-for="data in dashboardStore.dashboard.data.dredges.filter(
                    (d) => d.status === '4'
                  )"
                  class="flex flex-row justify-between mb-3"
                >
                  <div class="flex flex-col">
                    <span class="text-sm mb-1 text-ellipsis">{{
                      data.title
                    }}</span>
                    <div class="flex flex-row">
                      <span class="text-xs text-gray-400 mr-2">{{
                        data.regDt
                      }}</span>
                      <Tag
                        :value="data.statusName"
                        :severity="
                          data.status === '2'
                            ? 'info'
                            : data.status === '3'
                            ? 'success'
                            : 'secondary'
                        "
                        class="small-tag"
                      />
                      <span class="text-xs text-gray-500 ml-2">{{
                        data.category
                      }}</span>
                    </div>
                  </div>
                  <div class="content-center">
                    <img
                      :src="`/images/${dredgeImage(
                        data.status,
                        data.newMessage
                      )}.png`"
                      style="width: 20px; height: 18px"
                    />
                  </div>
                </div>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </div>
      </div>

      <div class="col-span-11 lg:col-span-7 xl:col-span-6">
        <!-- :style="{ height: `calc(100vh - 6rem)` }" -->
        <div
          class="map_card md:h-screen"
          style="border-radius: 20px"
          :style="{ height: `calc(100vh - 6rem)` }"
        >
          <div
            class="flex flex-wrap justify-between absolute z-10 gap-2 mt-4 ml-4"
          >
            <div class="inmap_card shadow-lg flex flex-wrap mr-10">
              <div class="bg-white gap-6">
                <RadioButton
                  v-model="category"
                  inputId="category"
                  name="category"
                  value="M"
                  class="mr-2"
                  :disabled="true"
                />
                <span class="mr-2 text-sm">맨홀</span>
                <RadioButton
                  v-model="category"
                  inputId="category"
                  name="category"
                  value="P"
                  class="mr-2"
                  :disabled="true"
                />
                <span class="mr-2 text-sm">관로</span>
                <RadioButton
                  v-model="category"
                  inputId="category"
                  name="category"
                  value="D"
                  class="mr-2"
                  :disabled="true"
                />
                <span class="mr-2 text-sm">배수</span>
                <RadioButton
                  v-model="category"
                  inputId="category"
                  name="category"
                  value="S"
                  class="mr-2"
                  :disabled="true"
                />
                <span class="text-sm">센서</span>
              </div>
            </div>
            <div class="inmap_card shadow-lg flex flex-wrap">
              <span class="mr-1 text-sm content-center">오늘</span>
              <img
                :src="`/images/${todayAM ? todayAM : 'NB01.png'}`"
                style="width: 23px; height: 23px"
              />
              /
              <img
                :src="`/images/${todayPM ? todayPM : 'NB01.png'}`"
                style="width: 23px; height: 23px"
              />
              <span class="mr-1 ml-1 text-sm content-center">내일</span>
              <img
                :src="`/images/${tomorrowAM ? tomorrowAM : 'NB01.png'}`"
                style="width: 23px; height: 23px"
              />
              /
              <img
                :src="`/images/${tomorrowPM ? tomorrowPM : 'NB01.png'}`"
                style="width: 23px; height: 23px"
              />
              <span class="mr-1 ml-1 text-sm content-center">모레</span>
              <img
                :src="`/images/${
                  afterTomorrowAM ? afterTomorrowAM : 'NB01.png'
                }`"
                style="width: 23px; height: 23px"
              />
              /
              <img
                :src="`/images/${
                  afterTomorrowPM ? afterTomorrowPM : 'NB01.png'
                }`"
                style="width: 23px; height: 23px"
              />
            </div>
          </div>
          <GMapMap
            :center="{ lat: 37.3217, lng: 126.8312 }"
            :zoom="12"
            :options="{
              zoomControl: true,
              mapTypeControl: false,
              scaleControl: false,
              streetViewControl: false,
              rotateControl: false,
              fullscreenControl: true,
            }"
          >
            <GmapCustomMarker
              :key="index"
              v-for="(m, index) in markers"
              :marker="m.position"
              :nuxtMode="true"
            >
              <div
                class="rounded-full grid place-items-center cursor-pointer"
                style="width: 50px; height: 50px"
                :style="{ 'background-color': m.bgColor, opacity: m.opacity }"
                @click="moveMapPage(m)"
              >
                <span class="text-sm text-white">{{ m.count }}</span>
              </div>
            </GmapCustomMarker>
            <!-- <GMapPolyline :path="polylinePath" :options="polylineOptions" /> -->
          </GMapMap>
        </div>
      </div>

      <div class="col-span-11 xl:col-span-2">
        <div class="flex flex-col">
          <div class="chart_card" style="border-radius: 20px">
            <div class="flex flex-row justify-between">
              <div class="flex flex-col justify-center">
                <span class="cursor-pointer" @click="markerChange('M', '')"
                  >맨홀관리</span
                >
                <span class="cursor-pointer" @click="markerChange('M', '')"
                  >8276</span
                >
                <div class="flex flex-wrap mt-2">
                  <div
                    class="flex flex-row content-center cursor-pointer"
                    @click="markerChange('M', 'G')"
                  >
                    <div
                      style="
                        width: 13px;
                        height: 13px;
                        background-color: #6bd3ff;
                      "
                    ></div>
                    <span class="text-xs ml-1 mr-1 mb-2">좋음</span>
                  </div>
                  <div
                    class="flex flex-row content-center cursor-pointer"
                    @click="markerChange('M', 'N')"
                  >
                    <div
                      style="
                        width: 13px;
                        height: 13px;
                        background-color: #44af68;
                      "
                    ></div>
                    <span class="text-xs ml-1 mr-1 mb-2">보통</span>
                  </div>
                  <div
                    class="flex flex-row content-center cursor-pointer"
                    @click="markerChange('M', 'B')"
                  >
                    <div
                      style="
                        width: 13px;
                        height: 13px;
                        background-color: #f4db56;
                      "
                    ></div>
                    <span class="text-xs ml-1 mr-1 mb-2">나쁨</span>
                  </div>
                  <div
                    class="flex flex-row content-center cursor-pointer"
                    @click="markerChange('M', 'D')"
                  >
                    <div
                      style="
                        width: 13px;
                        height: 13px;
                        background-color: #ff6666;
                      "
                    ></div>
                    <span class="text-xs ml-1 mr-1 mb-2">위험</span>
                  </div>
                </div>
              </div>
              <div class="flex">
                <Chart
                  type="doughnut"
                  :data="manholeData"
                  :options="pieOptions"
                  :width="120"
                  :height="120"
                ></Chart>
              </div>
            </div>
          </div>
          <div class="chart_card" style="border-radius: 20px">
            <div class="flex flex-row justify-between">
              <div class="flex flex-col justify-center">
                <span class="cursor-pointer" @click="markerChange('P', '')"
                  >관로관리</span
                >
                <span class="cursor-pointer" @click="markerChange('P', '')"
                  >1506</span
                >
                <div class="flex flex-wrap mt-2">
                  <div
                    class="flex flex-row content-center cursor-pointer"
                    @click="markerChange('P', 'G')"
                  >
                    <div
                      style="
                        width: 13px;
                        height: 13px;
                        background-color: #6bd3ff;
                      "
                    ></div>
                    <span class="text-xs ml-1 mr-1 mb-2">좋음</span>
                  </div>
                  <div
                    class="flex flex-row content-center cursor-pointer"
                    @click="markerChange('P', 'N')"
                  >
                    <div
                      style="
                        width: 13px;
                        height: 13px;
                        background-color: #44af68;
                      "
                    ></div>
                    <span class="text-xs ml-1 mr-1 mb-2">보통</span>
                  </div>
                  <div
                    class="flex flex-row content-center cursor-pointer"
                    @click="markerChange('P', 'B')"
                  >
                    <div
                      style="
                        width: 13px;
                        height: 13px;
                        background-color: #f4db56;
                      "
                    ></div>
                    <span class="text-xs ml-1 mr-1 mb-2">나쁨</span>
                  </div>
                  <div
                    class="flex flex-row content-center cursor-pointer"
                    @click="markerChange('P', 'D')"
                  >
                    <div
                      style="
                        width: 13px;
                        height: 13px;
                        background-color: #ff6666;
                      "
                    ></div>
                    <span class="text-xs ml-1 mr-1 mb-2">위험</span>
                  </div>
                </div>
              </div>
              <div class="flex">
                <Chart
                  type="pie"
                  :data="pipeData"
                  :options="pieOptions"
                  :width="120"
                  :height="120"
                ></Chart>
              </div>
            </div>
          </div>
          <div class="chart_card" style="border-radius: 20px">
            <div class="flex flex-row justify-between">
              <div class="flex flex-col justify-center">
                <span class="cursor-pointer" @click="markerChange('D', '')"
                  >배수관리</span
                >
                <span class="cursor-pointer" @click="markerChange('D', '')"
                  >15836</span
                >
                <div class="flex flex-wrap mt-2">
                  <div
                    class="flex flex-row content-center cursor-pointer"
                    @click="markerChange('D', 'G')"
                  >
                    <div
                      style="
                        width: 13px;
                        height: 13px;
                        background-color: #6bd3ff;
                      "
                    ></div>
                    <span class="text-xs ml-1 mr-1 mb-2">좋음</span>
                  </div>
                  <div
                    class="flex flex-row content-center cursor-pointer"
                    @click="markerChange('D', 'N')"
                  >
                    <div
                      style="
                        width: 13px;
                        height: 13px;
                        background-color: #44af68;
                      "
                    ></div>
                    <span class="text-xs ml-1 mr-1 mb-2">보통</span>
                  </div>
                  <div
                    class="flex flex-row content-center cursor-pointer"
                    @click="markerChange('D', 'B')"
                  >
                    <div
                      style="
                        width: 13px;
                        height: 13px;
                        background-color: #f4db56;
                      "
                    ></div>
                    <span class="text-xs ml-1 mr-1 mb-2">나쁨</span>
                  </div>
                  <div
                    class="flex flex-row content-center cursor-pointer"
                    @click="markerChange('D', 'D')"
                  >
                    <div
                      style="
                        width: 13px;
                        height: 13px;
                        background-color: #ff6666;
                      "
                    ></div>
                    <span class="text-xs ml-1 mr-1 mb-2">위험</span>
                  </div>
                </div>
              </div>
              <div class="flex">
                <Chart
                  type="polarArea"
                  :data="ductData"
                  :options="pieOptions"
                  :width="120"
                  :height="120"
                ></Chart>
              </div>
            </div>
          </div>
          <div class="chart_card" style="border-radius: 20px">
            <div class="flex flex-row justify-between">
              <div class="flex flex-col justify-center">
                <span class="cursor-pointer" @click="markerChange('S', '')"
                  >센서통계</span
                >
                <span class="cursor-pointer" @click="markerChange('S', '')"
                  >269</span
                >
                <div class="flex flex-wrap mt-2">
                  <div
                    class="flex flex-row content-center cursor-pointer"
                    @click="markerChange('S', 'W')"
                  >
                    <div
                      style="
                        width: 13px;
                        height: 13px;
                        background-color: #ff6421;
                      "
                    ></div>
                    <span class="text-xs ml-1 mr-1 mb-2">수질</span>
                  </div>
                  <div
                    class="flex flex-row content-center cursor-pointer"
                    @click="markerChange('S', 'F')"
                  >
                    <div
                      style="
                        width: 13px;
                        height: 13px;
                        background-color: #6bd3ff;
                      "
                    ></div>
                    <span class="text-xs ml-1 mr-1 mb-2">침수</span>
                  </div>
                  <div
                    class="flex flex-row content-center cursor-pointer"
                    @click="markerChange('S', 'S')"
                  >
                    <div
                      style="
                        width: 13px;
                        height: 13px;
                        background-color: #2381e6;
                      "
                    ></div>
                    <span class="text-xs ml-1 mr-1 mb-2">악취</span>
                  </div>
                  <div
                    class="flex flex-row content-center cursor-pointer"
                    @click="markerChange('S', 'E')"
                  >
                    <div
                      style="
                        width: 13px;
                        height: 13px;
                        background-color: #74debe;
                      "
                    ></div>
                    <span class="text-xs ml-1 mr-1 mb-2">기타</span>
                  </div>
                </div>
              </div>
              <div class="flex">
                <Chart
                  type="radar"
                  :data="sensorData"
                  :options="sensorOptions"
                  :width="120"
                  :height="120"
                ></Chart>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ClientOnly>
</template>

<style scoped>
.small-tag {
  font-size: 10px; /* 폰트 크기 조정 */
  padding: 1px 5px; /* 패딩 조정 */
  border-radius: 4px; /* 모서리 둥글기 조정 */
}

.chart_card {
  background: var(--surface-card);
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  padding-left: 1rem;
  padding-right: 1rem;
  margin-bottom: 0.7rem;
  border-radius: var(--content-border-radius);

  &:last-child {
    margin-bottom: 0;
  }
}

.inmap_card {
  background: var(--surface-card);
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  padding-left: 1rem;
  padding-right: 1rem;
  border-radius: var(--content-border-radius);
}

.map_card {
  background: var(--surface-card);
  padding-top: 0;
  padding-bottom: 0;
  padding-left: 0;
  padding-right: 0;
  margin-bottom: 0;
  border-radius: var(--content-border-radius);

  &:last-child {
    margin-bottom: 0;
  }
}

.text-ellipsis {
  white-space: nowrap; /* 텍스트를 한 줄로 유지 */
  overflow: hidden; /* 넘치는 텍스트를 숨김 */
  text-overflow: ellipsis; /* 말줄임 표시 */
  width: 200px; /* 컨테이너 너비 설정 */
}
</style>
