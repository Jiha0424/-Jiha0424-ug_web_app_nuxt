<script setup>
import NodeService from '~/services/NodeService';

const treeValue = ref(null);
const selectedTreeValue = ref(null);
const treeTableValue = ref(null);
const selectedTreeTableValue = ref(null);

const nodeService = new NodeService();

onMounted(() => {
  nodeService.getTreeNode().then((data) => (treeValue.value = data));
  nodeService.getTreeTableNode().then((data) => (treeTableValue.value = data));
});
</script>

<template>
  <div class="card">
    <div class="font-semibold text-xl">Tree</div>
    <Tree
      :value="treeValue"
      selectionMode="checkbox"
      v-model:selectionKeys="selectedTreeValue"
    ></Tree>
  </div>

  <div class="card">
    <div class="font-semibold text-xl mb-4">TreeTable</div>
    <TreeTable
      :value="treeTableValue"
      selectionMode="checkbox"
      v-model:selectionKeys="selectedTreeTableValue"
    >
      <Column field="name" header="Name" :expander="true"></Column>
      <Column field="size" header="Size"></Column>
      <Column field="type" header="Type"></Column>
    </TreeTable>
  </div>
</template>

<style lang="scss" scoped></style>
