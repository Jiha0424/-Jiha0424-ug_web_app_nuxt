<script setup scope>
import MenuService from '~/services/MenuService';
import PaletteConfigurator from './PaletteConfigurator.vue';

const { onMenuToggle } = useLayout();

const searchManhole = ref('');

const menuService = new MenuService();
const menus = ref([
  {
    label: 'UG소개',
    command: () => navigateTo(''),
  },
  {
    label: '맨홀',
    items: [
      {
        label: '맨홀리스트',
        command: () => navigateTo('/'),
      },
      {
        label: '맨홀지도',
        command: () => navigateTo('/manhole/manholeMap'),
      },
      {
        label: '샘플지도',
        command: () => navigateTo('/manhole/sampleMap'),
      },
    ],
  },
  {
    label: '준설공사',
    items: [
      {
        label: '준설공사리스트',
        command: () => navigateTo(''),
      },
      {
        label: '준설공사지도',
        command: () => navigateTo(''),
      },
    ],
  },
  {
    label: '고객지원',
    items: [
      {
        label: '공지사항',
        command: () => navigateTo('/customer/notice'),
      },
      {
        label: '준설공사공고',
        command: () => navigateTo(''),
      },
      {
        label: 'FAQ',
        command: () => navigateTo('/customer/faq'),
      },
    ],
  },
  {
    label: '설정',
    items: [
      {
        label: '회원관리',
        command: () => navigateTo(''),
      },
      {
        label: '공지사항',
        command: () => navigateTo('/setting/notice'),
      },
      {
        label: '준설공사공고',
        command: () => navigateTo(''),
      },
      {
        label: 'FAQ',
        command: () => navigateTo('/setting/faq'),
      },
    ],
  },
]);

// {
//     label: 'Sample',
//     items: [
//       {
//         label: 'UI Components',
//         items: [
//           {
//             label: 'Form Layout',
//             icon: 'pi pi-fw pi-id-card',
//             url: '/sample/uikit/formlayout',
//           },
//           {
//             label: 'Input',
//             icon: 'pi pi-fw pi-check-square',
//             url: '/sample/uikit/input',
//           },
//           {
//             label: 'Button',
//             icon: 'pi pi-fw pi-mobile',
//             url: '/sample/uikit/button',
//             class: 'rotated-icon',
//           },
//           {
//             label: 'Table',
//             icon: 'pi pi-fw pi-table',
//             url: '/sample/uikit/table',
//           },
//           {
//             label: 'List',
//             icon: 'pi pi-fw pi-list',
//             url: '/sample/uikit/list',
//           },
//           {
//             label: 'Tree',
//             icon: 'pi pi-fw pi-share-alt',
//             url: '/sample/uikit/tree',
//           },
//           {
//             label: 'Panel',
//             icon: 'pi pi-fw pi-tablet',
//             url: '/sample/uikit/panel',
//           },
//           {
//             label: 'Overlay',
//             icon: 'pi pi-fw pi-clone',
//             url: '/sample/uikit/overlay',
//           },
//           {
//             label: 'Media',
//             icon: 'pi pi-fw pi-image',
//             url: '/sample/uikit/media',
//           },
//           {
//             label: 'Menu',
//             icon: 'pi pi-fw pi-bars',
//             url: '/sample/uikit/menuDoc',
//           },
//           {
//             label: 'Message',
//             icon: 'pi pi-fw pi-comment',
//             url: '/sample/uikit/message',
//           },
//           {
//             label: 'File',
//             icon: 'pi pi-fw pi-file',
//             url: '/sample/uikit/file',
//           },
//           {
//             label: 'Chart',
//             icon: 'pi pi-fw pi-chart-bar',
//             url: '/sample/uikit/charts',
//           },
//           {
//             label: 'Timeline',
//             icon: 'pi pi-fw pi-calendar',
//             url: '/sample/uikit/timeline',
//           },
//           {
//             label: 'Misc',
//             icon: 'pi pi-fw pi-circle',
//             url: '/sample/uikit/misc',
//           },
//         ],
//       },
//       {
//         label: 'Pages',
//         icon: 'pi pi-fw pi-briefcase',
//         items: [
//           {
//             label: 'Auth',
//             icon: 'pi pi-fw pi-user',
//             items: [
//               {
//                 label: 'Login',
//                 icon: 'pi pi-fw pi-sign-in',
//                 url: '/sample/auth/login',
//               },
//               {
//                 label: 'Access Denied',
//                 icon: 'pi pi-fw pi-lock',
//                 url: '/sample/auth/access_denied',
//               },
//             ],
//           },
//           {
//             label: 'Crud',
//             icon: 'pi pi-fw pi-pencil',
//             url: '/sample/crud',
//           },
//           {
//             label: 'Not Found',
//             icon: 'pi pi-fw pi-exclamation-circle',
//             url: '/sample/not_found',
//           },
//           {
//             label: 'Error',
//             icon: 'pi pi-fw pi-times-circle',
//             url: '/sample/error',
//           },
//         ],
//       },
//     ],
//   },
</script>

<template>
  <div class="layout-topbar">
    <div class="layout-topbar-logo-container">
      <button
        class="layout-menu-button layout-topbar-action"
        @click="onMenuToggle"
      >
        <i class="pi pi-bars"></i>
      </button>
      <NuxtLink to="/" class="layout-topbar-logo">
        <span class="text-xl"><strong>안산시</strong></span>
        <span class="text-xl text-sky-500"><strong>UG</strong></span>
      </NuxtLink>
    </div>

    <div>
      <Menubar
        :model="menus"
        class="custom-menubar"
        :pt="{ itemLink: { ariaHidden: false } }"
      ></Menubar>
    </div>

    <div class="layout-topbar-actions">
      <InputText
        v-model="searchManhole"
        id="searchManhole"
        placeholder="맨홀 검색"
        class="w-full md:w-40 p-inputtext-xs"
      />
      <Button type="button" text icon="pi pi-search" severity="secondary" />
      <Button type="button" severity="help" rounded label="김" class="ml-3" />
    </div>
  </div>
</template>

<style scoped>
/* 테두리 제거 커스터마이징 */
.custom-menubar {
  border: none; /* 테두리 제거 */
  box-shadow: none; /* 그림자 제거 */
}

.p-menubar-submenu {
  font-size: 13px; /* 서브메뉴 글자 크기 */
}
</style>
