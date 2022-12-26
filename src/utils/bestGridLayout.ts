import { ref, onMounted, onBeforeUnmount, computed, nextTick } from "vue"

import type { Ref } from "vue"

/**
 * NOTE:需要搭配 grid 布局使用
 * 会返回最适合屏幕宽度的元素宽度 ,和一行的最佳数量
 * @params:1.元素容器 2.元素的最大宽度 3.元素的间距
 * @return:1.元素的宽度 2.一行排列几个
 */
export function useBestLayout(
  container: Ref<HTMLDivElement | undefined>,
  maxWidth: number,
  gap: number,
) {
  const pageWidth = ref<number>(0)
  const bestRowCounts = computed(() => {
    const _counts = Math.ceil(pageWidth.value / (maxWidth + gap))
    return _counts
  })
  const bestWidth = computed<number>(() => {
    if (pageWidth.value && bestRowCounts.value >= 2) {
      return (
        (pageWidth.value - (bestRowCounts.value - 1) * gap) /
        bestRowCounts.value
      )
    } else {
      return maxWidth
    }
  })

  function observerCallback(entries: any) {
    const _targetElement = entries[0]
    const _pageContentWidth = _targetElement.contentRect.width
    const _pageClientWidth = _targetElement.target.clientWidth
    pageWidth.value = _pageContentWidth || _pageClientWidth
  }
  const observer = new ResizeObserver(observerCallback)

  onMounted(() => {
    nextTick(() => {
      if (container.value) observer.observe(container.value)
    })
  })

  onBeforeUnmount(() => {
    observer.disconnect()
  })

  return {
    bestRowCounts,
    bestWidth,
  }
}
