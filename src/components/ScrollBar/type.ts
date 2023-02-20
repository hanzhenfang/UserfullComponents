import type { Ref } from "vue"

export type ScrollBarOptions = {
  containerEl: Ref<HTMLElement | null>
  sliderEl: Ref<HTMLElement | null>
  autoHeight?: boolean
  performance?: {
    scrollTop?: Ref<number>
  }
  maxHeightRatio?: number
}
