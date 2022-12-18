<script setup lang="ts">
import { ref } from "vue"

defineProps<{ msg: string }>()

const count = ref(0)
</script>

<template>
  <div class="w-100px h-100px text-yellow border-red border-1px">哈哈</div>
</template>

<style scoped></style>
