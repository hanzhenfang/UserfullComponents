<script setup lang="ts">
import {
  ref,
  nextTick,
  computed,
  onMounted,
  onUnmounted,
  useSlots,
  type Ref,
} from "vue"
import { useScrollBar } from "./useScrollBar"

export interface Props {
  containerEl: null | HTMLElement
  autoHide?: boolean
  autoHeight?: boolean
  performance?: {
    scrollTop?: Ref<number>
  }
}

const props = withDefaults(defineProps<Props>(), {})

const hasDefaultSlot = !!useSlots()["default"]
const sliderRef = ref<null | HTMLElement>(null)
const containerEl = computed(() => props.containerEl)
const uScrollBar = useScrollBar({
  containerEl: containerEl,
  sliderEl: sliderRef,
  autoHeight: hasDefaultSlot ? props.autoHeight : true,
  performance: props.performance,
})
const { scrollable, isScrollEnd, sliderPos } = uScrollBar

// NOTE: 不需要自动隐藏的时候默认一直显示
const show = !props.autoHide
  ? computed(() => scrollable.value)
  : computed(() => !isScrollEnd.value)

onMounted(() => {
  nextTick(() => {
    uScrollBar.init()
  })
})

onUnmounted(() => {
  uScrollBar.modifySliderEventListener("remove")
})

defineExpose({ uScrollBarReturn: uScrollBar })
</script>

<template>
  <transition>
    <div
      v-show="show"
      ref="sliderRef"
      class="slider-wrapper"
      :style="sliderPos"
    >
      <slot>
        <div class="default-slider" />
      </slot>
    </div>
  </transition>
</template>

<style scoped>
.v-leave-active {
  transition: all 0.15s ease-out;
  transition-delay: 900ms;
}
.v-leave-to {
  opacity: 0;
}

.slider-wrapper {
  z-index: 100;
  position: absolute;
  right: 0px;
  touch-action: none;
}

.default-slider {
  width: 6px;
  height: 100%;
  background-color: rgb(0 0 0 / 0.2);
  border-radius: 3px;
  margin-right: 3px;
}
</style>
