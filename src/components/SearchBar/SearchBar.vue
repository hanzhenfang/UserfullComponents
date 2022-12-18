<script lang="ts" setup>
import { ref, computed, nextTick, type CSSProperties } from "vue"

import useSearch from "./useSearch"

const {
  searchKeyword,
  hdlSearchBtn,
  closeSearchBar,
  searchModel,
  cleanSearchKeyword,
  // searchHistoryLists,
  // getHistoryLists,
  // delOneSearchHistory,
  // delAllSearchHistory,
} = useSearch
const searchBarWrapper = ref<HTMLDivElement>()
const currentHoverItem = ref<string>()
const inputModal = ref<HTMLInputElement>()
const isShowChangeModelBar = ref<boolean>(false)
const searchHistoryLists: any = []

const searchBarStyle = computed<CSSProperties>(() => {
  return {
    position: `absolute`,
    top: `120px`,
    left: `calc(50% - 310px)`,
  }
})

//tips: 搜索模式文字
const searchText = computed<string>(() => {
  return searchModel.value === "content" ? "按内容" : "按文件"
})

//tips: 搜索内容为空时的占位提示
const inputPlaceholder = computed<string>(() => {
  return searchModel.value === "content" ? "输入内容搜索" : "输入文件名搜索"
})

function hdlShowSearchModel() {
  isShowChangeModelBar.value = !isShowChangeModelBar.value
}

//tips: 改变搜索模式
function changeSearchModel(model: "content" | "filename") {
  searchModel.value = model
  isShowChangeModelBar.value = false
}

//tips: 当鼠标进入底部选项的时候
function onMouseEnterEvent(item: string | undefined) {
  currentHoverItem.value = item
}

//tips: 当鼠标离开底部选项的时候
function onMouseLeaveEvent() {
  currentHoverItem.value = ""
}

function isHover(index: number) {
  if (!currentHoverItem.value) return false
  const _isHover = Boolean
  return _isHover
}

//tips: 当 input 框获取焦点以后，关闭切换模式的小方块
function inputElementOnFocus() {
  isShowChangeModelBar.value = false
}

nextTick(() => {
  cleanSearchKeyword()
  inputModal.value?.focus()
})
</script>
<template>
  <div
    id="searchBarWrapper"
    ref="searchBarWrapper"
    class="w-[620px] cursor-pointer bg-[#FFFFFF] border-[1px] border-[#D7D7D7] rounded-[8px] shadow-[0_4px_16px_0px_rgba(187,192,198,0.2)] flex flex-col z-[99999]"
    :style="searchBarStyle"
  >
    <div
      class="basis-[64px] w-full px-[24px] text-[#A2A2A2] text-[16px] flex items-center justify-between"
    >
      <div
        @click="hdlShowSearchModel"
        class="flex relative mr-[12px] items-center justify-between"
      >
        <span class="mr-[12px]">{{ searchText }}</span>
        <SvgIcon
          class="mr-[12px]"
          name="下拉"
          color="#A2A2A2"
          :width="10"
          :height="5"
          :style="[
            isShowChangeModelBar ? { transform: `rotate(0.5turn)` } : {},
          ]"
        />
        <!-- //tips: 界面上的分割线 -->
        <div class="h-[14px] border-r-[1px] border-[#D8D8D8]"></div>
        <div
          v-show="isShowChangeModelBar"
          class="absolute left-[-24px] top-[52px] w-[110px] h-[82px] px-[5px] pt-[5px] border-[1px] rounded-[8px] z-[9999] shadow-[0_4px_16px_0px_rgba(187,192,198,0.2)] bg-[white] border-[#E9E9E9] flex flex-col"
        >
          <div
            @click.stop="changeSearchModel('filename')"
            class="w-full h-[36px] leading-[36px] rounded-[4px]"
            :class="searchModel === 'filename' ? `bg-[#E9E9E9]` : `static`"
          >
            <span class="ml-[11px]">按文件</span>
          </div>
          <div
            @click.stop="changeSearchModel('content')"
            class="w-full h-[36px] leading-[36px] rounded-[4px]"
            :class="searchModel === 'content' ? `bg-[#E9E9E9]` : `static`"
          >
            <span class="ml-[11px]">按内容</span>
          </div>
        </div>
      </div>
      <div class="grow flex items-center justify-between mr-[18px]">
        <input
          ref="inputModal"
          class="w-full text-[14px] text-[#333333] align-middle font-semibold placeholder:text-[#D1D1D1] placeholder:text-[16px]"
          @keyup.enter="hdlSearchBtn(searchKeyword)"
          @focus="inputElementOnFocus"
          :placeholder="inputPlaceholder"
          v-model="searchKeyword"
        />
        <div v-show="!!searchKeyword" class="w-[30px]">
          <span @click="cleanSearchKeyword" class="text-[14px]">清空</span>
        </div>
      </div>

      <div
        @click="closeSearchBar"
        class="flex h-full items-center justify-between"
      >
        <!-- //tips: 界面上的分割线 -->
        <div class="mr-[18px] h-[14px] border-r-[1px] border-[#D8D8D8]"></div>
        <SvgIcon name="错号" color="black" :width="12" :height="12" />
      </div>
    </div>

    <div class="w-full text-[16px] flex flex-col justify-center">
      <div class="">
        <!-- //如果用户处于输入中的话 -->

        <div
          v-if="!searchKeyword && searchHistoryLists.length > 0"
          class="max-h-[230px] overflow-y-auto"
        >
          <div
            class="flex text-[#999999] px-[24px] border-t-[1px] border-[#F6F6F6] items-center justify-between h-[42px]"
          >
            <div>
              <span>历史记录</span>
            </div>
            <div class="h-full flex items-center" @click="">
              <SvgIcon name="清空" :widht="12" :height="12" />
              <span>清空</span>
            </div>
          </div>
          <div
            @click="hdlSearchBtn(item)"
            v-for="(item, index) in searchHistoryLists"
            :key="item"
            class="h-[36px] px-[24px] w-full flex items-center justify-between"
            :class="isHover(index) ? `bg-[#F7F8F9]` : `static`"
            :style="
              index === searchHistoryLists.length - 1
                ? { paddingBottom: '8px' }
                : {}
            "
            @mouseenter="onMouseEnterEvent(item)"
            @mouseleave="onMouseLeaveEvent"
          >
            <span class="text-[14px] font-medium">{{ item }}</span>
            <SvgIcon
              v-show="isHover(index)"
              name="错号"
              color="#B6B6B6"
              :height="10"
              :width="10"
            />
          </div>
        </div>
        <div
          v-if="!!searchKeyword"
          class="px-[24px] border-t-[1px] border-[#F6F6F6] h-[48px] flex items-center"
          @click="hdlSearchBtn(searchKeyword)"
        >
          <SvgIcon name="放大镜搜索" />
          <span class="text-[14px] ml-[18px]"
            >查看全部“{{ searchKeyword }}”的搜索结果</span
          >
        </div>
      </div>
    </div>
  </div>
</template>
