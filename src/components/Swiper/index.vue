<script lang="ts" setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from "vue"

import { SvgIcon } from "@lazycatcloud/lzc-toolkit"

import type { PloyResponse } from "@/shared/generated_model"

const props = defineProps<{
  polyList: PloyResponse[]
}>()

const emits = defineEmits<{
  (e: "clickItem", item: PloyResponse): void
}>()

const autoplayInterval = 3500 //自动播放的间隔
const swiperContainer = ref<HTMLDivElement>()
const swiperInfo = reactive({
  offsetWidth: 0,
})

const isAutoPlaying = ref<boolean>(false)
const isHoverInPoly = ref<boolean>(false)

const clonePolyList = computed(() => {
  if (props.polyList.length <= 1) return props.polyList
  const firstItem = props.polyList[0]
  const cloneList = [...props.polyList, firstItem]
  return cloneList
})

const currentPolyInfo = reactive({
  content: clonePolyList.value[0],
  index: 0,
})

function preBtn() {
  if (!swiperContainer.value) return
  let scrollRatio = currentPolyInfo.index - 1
  if (scrollRatio < 0) {
    swiperContainer.value.style.scrollBehavior = "auto"
    swiperContainer.value.scrollLeft =
      props.polyList.length * swiperInfo.offsetWidth
    if (!swiperContainer.value) return
    swiperContainer.value.style.scrollBehavior = "smooth"
    currentPolyInfo.index = props.polyList.length - 1
    swiperContainer.value.scrollLeft =
      (props.polyList.length - 1) * swiperInfo.offsetWidth
  } else {
    currentPolyInfo.index--
    swiperContainer.value.scrollLeft = scrollRatio * swiperInfo.offsetWidth
  }
}

let timerID: null | number = null
function nextBtn() {
  if (!swiperContainer.value) return
  if (timerID) return
  let scrollRatio = currentPolyInfo.index + 1
  if (scrollRatio > props.polyList.length - 1) {
    swiperContainer.value.scrollLeft = scrollRatio * swiperInfo.offsetWidth
    currentPolyInfo.index = 0
    timerID = window.setTimeout(() => {
      if (!swiperContainer.value) return
      swiperContainer.value.style.scrollBehavior = "auto"
      swiperContainer.value.scrollLeft = 0
      swiperContainer.value.style.scrollBehavior = "smooth"
      if (timerID) clearTimeout(timerID)
      timerID = null
    }, 1000)
  } else {
    currentPolyInfo.index++
    swiperContainer.value.scrollLeft = scrollRatio * swiperInfo.offsetWidth
  }
}

function hdlClickItme(item: PloyResponse) {
  emits("clickItem", item)
}

function onMouseEnter(e: MouseEvent) {
  if (isHoverInPoly.value) return
  isHoverInPoly.value = true
  pauseAutoPlay()
}

function onMouseOut(e: MouseEvent) {
  if (!isHoverInPoly.value) return
  isHoverInPoly.value = false
  resumeAutoPlay()
}

function resumeAutoPlay() {
  isAutoPlaying.value = false
  if (isHoverInPoly.value) return
  autoPlayTimeID = window.setInterval(() => {
    nextBtn()
    isAutoPlaying.value = true
  }, autoplayInterval)
}

function pauseAutoPlay() {
  isAutoPlaying.value = false
  if (autoPlayTimeID) {
    clearInterval(autoPlayTimeID)
    autoPlayTimeID = null
  }
}

let autoPlayTimeID: number | null = null
onMounted(() => {
  const observer = new ResizeObserver((entry: ResizeObserverEntry[]) => {
    swiperInfo.offsetWidth = entry[0].contentRect.width
  })
  if (!swiperContainer.value) return
  observer.observe(swiperContainer.value)
  swiperInfo.offsetWidth = swiperContainer.value.offsetWidth
  autoPlayTimeID = window.setInterval(() => {
    nextBtn()
    isAutoPlaying.value = true
  }, autoplayInterval)
})

function clickSwiperFooterBtn(polyIndex: number) {
  if (!swiperContainer.value) return
  swiperContainer.value.scrollLeft = polyIndex * swiperInfo.offsetWidth
  currentPolyInfo.index = polyIndex
}

onBeforeUnmount(() => {
  if (autoPlayTimeID) clearInterval(autoPlayTimeID)
})
</script>
<template>
  <div
    @mouseover="onMouseEnter"
    @mouseout="onMouseOut"
    class="w-full h-full bg-black flex relative"
  >
    <div
      class="absolute left-0px w-15% h-full flex items-center justify-center"
    >
      <div
        v-show="clonePolyList.length > 1 && isHoverInPoly"
        @click="preBtn"
        class="w-56px h-56px bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.2)] rounded-full cursor-pointer flex items-center justify-center"
      >
        <SvgIcon
          name="上一步"
          :width="10"
          :height="18"
          color="rgba(255,255,255,0.5)"
        />
      </div>
    </div>
    <div
      ref="swiperContainer"
      class="hide-scrollbar h-full grow flex w-fit flex-nowrap overflow-x-scroll scroll-smooth snap-x snap-mandatory"
    >
      <div
        @click="hdlClickItme(item)"
        class="h-full min-w-full snap-start snap-always cursor-pointer overflow-hidden"
        v-for="item in clonePolyList"
      >
        <img class="w-full h-full object-cover" :src="item.coverPc" />
      </div>
    </div>

    <div
      v-if="clonePolyList.length > 1"
      class="w-15% h-full flex items-center justify-center absolute right-0px"
    >
      <div
        v-show="clonePolyList.length > 1 && isHoverInPoly"
        @click="nextBtn"
        class="w-56px h-56px cursor-pointer bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.2)] rounded-full flex items-center justify-center"
      >
        <SvgIcon
          class="rotate-180"
          name="上一步"
          :width="10"
          :height="18"
          color="rgba(255,255,255,0.5)"
        />
      </div>
    </div>

    <div
      v-show="clonePolyList.length > 1 && isHoverInPoly"
      class="absolute bottom-10px z-5 items-center justify-center flex w-full"
    >
      <div
        class="rounded-15px flex px-16px bg-[rgba(0,0,0,0.5)] h-30px items-center justify-center"
      >
        <div
          v-for="(_, index) in props.polyList.length"
          @click="clickSwiperFooterBtn(index)"
          class="h-10px rounded-10px ml-6px transition-width hover:bg-white cursor-pointer"
          :class="
            index === currentPolyInfo.index
              ? `w-25px bg-[rgba(255,255,255,0.8)]`
              : `w-10px bg-[rgba(255,255,255,0.5)]`
          "
        ></div>
      </div>
    </div>
  </div>
</template>
