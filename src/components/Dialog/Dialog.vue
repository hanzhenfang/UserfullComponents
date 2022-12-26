<template>
  <div
    @click.stop="closeDialog"
    class="w-full h-full absolute z-[9999] bg-[rgba(0,0,0,0.4)] flex items-center justify-center"
  >
    <div
      class="flex flex-col items-center pt-[22px] pb-[24px] px-[24px] w-[290px] h-[183px] rounded-[10px] bg-[#FEFFFF]"
    >
      <div class="">
        <span class="text-[18px] text-[#333333] font-semibold">{{
          title
        }}</span>
      </div>
      <div class="grow">
        <span class="text-[14px] text-[#333333]">{{ content }}</span>
      </div>
      <div class="flex w-full items-center justify-between text-[14px]">
        <div
          @click.stop="cancleBtn"
          class="w-[110px] h-[40px] bg-[#F5F5F5] rounded-[20px] flex items-center justify-center"
        >
          <span>取消</span>
        </div>
        <div
          @click.stop="confirmBtn"
          class="w-[110px] h-[40px] bg-[#2ec1cc] rounded-[20px] flex items-center justify-center"
        >
          <span class="text-[#FFFFFF]">确定</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from "vue";

interface DialogOptions {
  title: string;
  content: string;
  confirmCallBackFn: () => void;
  closeDialogFn: () => void;
}

const props = defineProps<DialogOptions>();

function closeDialog() {
  props.closeDialogFn();
}

function confirmBtn() {
  props.confirmCallBackFn();
  closeDialog();
}

function cancleBtn() {
  closeDialog();
}

onMounted(() => {
  console.log("props", props);
});
</script>
