import { ref, computed, type CSSProperties, watch } from "vue"

import { debounce } from "@/utils/debounce"

import type { ScrollBarOptions } from "./type"

export function useScrollBar(options: ScrollBarOptions) {
  const {
    containerEl,
    sliderEl,
    autoHeight,
    performance = {},
    maxHeightRatio = 0.9,
  } = options
  // 是否在滚动中
  const isScrollEnd = ref(true)
  const scrollEndByDebounce = debounce(scrollEnd, 100)

  let requestId: ReturnType<typeof requestAnimationFrame>
  // 平滑滚动恢复值
  let scrollBehaviorValue = ""
  const scrollTop = ref(0)
  // NOTE: 按下滑块时与滑块的顶部偏移距离
  const pressOffsetTop = ref(0)
  // 滑块的顶部偏移
  const offsetTop = ref(0)
  // 容器的各种数值
  const containerRect = ref({
    top: 0,
    scrollTop: 0,
    scrollHeight: 0,
    clientHeight: 0,
  })
  // 滑块的各种数值
  const sliderRect = ref({
    clientHeight: 0,
  })
  //
  const isDragSlider = computed(() => {
    return !!pressOffsetTop.value
  })
  // scrollable
  const scrollable = computed(() => {
    return containerRect.value.scrollHeight > containerRect.value.clientHeight
  })
  // NOTE:滑块可滚动高度: 容器高度 - 滑块高度
  const sliderRollableHeight = computed(() => {
    return containerRect.value.clientHeight - sliderRect.value.clientHeight
  })
  // NOTE:容器可滚动高度: 容器可滚动高度 - 容器可视区域高度
  const containerRollableHeight = computed(() => {
    return containerRect.value.scrollHeight - containerRect.value.clientHeight
  })
  // NOTE:高度比例: 容器可视区域和滚动区域的比例
  const heightRatio = computed(() => {
    return Math.max(
      containerRect.value.clientHeight / containerRect.value.scrollHeight,
      0.05,
    )
  })
  const sliderHeight = computed(() => {
    if (heightRatio.value > maxHeightRatio) return 0
    return heightRatio.value * containerRect.value.clientHeight
  })
  // NOTE:核心计算: 滑块的位置
  const sliderPos = computed<CSSProperties>(() => {
    return {
      willChange: "transform",
      transform: `translate3d(0,${offsetTop.value}px,0)`,
      height: autoHeight ? `${sliderHeight.value}px` : undefined,
    }
  })

  // 记录按下点偏移和禁用平滑滚动
  function hdlDown(e: PointerEvent) {
    startScroll()
    pressOffsetTop.value =
      e.clientY - sliderEl.value!.getBoundingClientRect().top || 1
    scrollBehaviorValue = getComputedStyle(containerEl.value!).scrollBehavior
    if (scrollBehaviorValue === "smooth") {
      containerEl.value!.style.scrollBehavior = "unset"
    }
  }

  // 清除偏移和恢复平滑滚动默认值
  function hdlUp() {
    containerEl.value!.style.scrollBehavior = scrollBehaviorValue
    pressOffsetTop.value = 0
    scrollEndByDebounce()
  }

  function startScroll() {
    isScrollEnd.value = false
  }
  function scrollEnd() {
    if (!isDragSlider.value) isScrollEnd.value = true
  }

  // 监听拖动距离
  function hdlMove(e: PointerEvent) {
    if (!isDragSlider.value) return
    let currentOffsetTop =
      e.clientY - containerRect.value.top - pressOffsetTop.value
    if (currentOffsetTop < 0) {
      offsetTop.value = 0
    } else if (currentOffsetTop >= sliderRollableHeight.value) {
      offsetTop.value = sliderRollableHeight.value
    } else {
      offsetTop.value = currentOffsetTop
    }
    // NOTE: 计算scrollTop滚动 偏移百分比 * 容器可滚动高度
    containerEl.value!.scrollTo({
      top:
        (offsetTop.value / sliderRollableHeight.value) *
        containerRollableHeight.value,
    })
  }

  // 滚动事件 (计算offsetTop)
  function hdlScroll() {
    // NOTE: 拖动滑块时不用计算滑块顶部偏移
    if (!isDragSlider.value) {
      doPaint()
    }
  }

  function doPaint() {
    cancelAnimationFrame(requestId)
    requestId = requestAnimationFrame(calculateOffsetTop)
  }

  // NOTE: 计算offsetTop位置 偏移百分比 * 滑块可拖动高度
  function calculateOffsetTop() {
    if (containerEl.value) {
      scrollTop.value =
        performance.scrollTop?.value ?? containerEl.value.scrollTop
      offsetTop.value =
        (scrollTop.value / containerRollableHeight.value) *
        sliderRollableHeight.value
    }
  }

  function modifySliderEventListener(action: "add" | "remove") {
    let modifyFn = "addEventListener"
    if (action === "add") modifyFn = "addEventListener"
    else modifyFn = "removeEventListener"
    ;(sliderEl.value as any)?.[modifyFn]("pointerdown", hdlDown, {
      passive: true,
    })
    ;(window as any)[modifyFn]("pointermove", hdlMove, { passive: true })
    ;(window as any)[modifyFn]("pointerup", hdlUp, { passive: true })
  }

  // 观察容器和滑块高度变化
  const observer = new MutationObserver((mutationRecord) => {
    const cssText = mutationRecord.map((it) => it.oldValue).join()
    if (cssText.includes("height")) update()
  })

  // NOTE:更新滑块和容器参数
  function update() {
    containerRect.value.top =
      containerEl.value?.getBoundingClientRect().top ?? 0
    containerRect.value.scrollHeight = containerEl.value?.scrollHeight ?? 0
    containerRect.value.clientHeight = containerEl.value?.clientHeight ?? 0
  }

  function initSliderRect() {
    startScroll()
    setTimeout(() => {
      sliderRect.value.clientHeight = sliderEl.value?.clientHeight ?? 0
      scrollEnd()
    }, 150)
  }

  function hideScrollBar() {
    document.styleSheets[0].insertRule(
      ".hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }",
      0,
    )
    document.styleSheets[0].insertRule(
      ".hide-scrollbar::-webkit-scrollbar{ display: none }",
      0,
    )
    containerEl.value?.classList.add("hide-scrollbar")
  }

  function init() {
    if (containerEl.value && sliderEl.value) {
      hideScrollBar()
      containerEl.value.addEventListener("scroll", hdlScroll, {
        passive: true,
      })
      modifySliderEventListener("add")
      observer.observe(containerEl.value, {
        subtree: true,
        attributeOldValue: true,
        attributeFilter: ["style"],
      })
      setTimeout(() => {
        update()
      }, 100)
      initSliderRect()
    } else {
      console.error("useScrollBar:", "初始化失败!", { containerEl, sliderEl })
    }
  }

  watch(scrollTop, () => {
    startScroll()
    scrollEndByDebounce()
  })

  return {
    isScrollEnd,
    isDragSlider,
    scrollable,
    sliderPos,
    init,
    modifySliderEventListener,
  }
}
