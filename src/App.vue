<template>
  <router-view />
  <GlobalLoading />
</template>

<script setup>
import { onMounted } from 'vue'
import { useSetting } from './store/pinia'
import GlobalLoading from './components/GlobalLoading.vue'

const store = useSetting()

onMounted(() => {
  store.setSetting()
})
</script>
