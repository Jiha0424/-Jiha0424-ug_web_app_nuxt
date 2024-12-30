<script setup>
import MenuService from '~/services/MenuService';
import MenuItem from './MenuItem.vue';

const menuService = new MenuService();
const menus = ref([]);

onMounted(() => {
  menuService.getMenu().then((data) => (menus.value = data));
});
</script>

<template>
  <ul class="layout-menu">
    <template v-for="(item, i) in menus" :key="item.to">
      <MenuItem v-if="!item.separator" :item="item" :index="i" />
      <li v-if="item.separator" class="menu-separator"></li>
    </template>
  </ul>
</template>
