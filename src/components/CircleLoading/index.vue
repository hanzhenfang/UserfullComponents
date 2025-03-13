<template>
  <div class="circle-progress" :style="containerStyle">
    <svg :width="size" :height="size" viewBox="0 0 100 100">
      <!-- 背景圆环 -->
      <circle
        :r="radius"
        cx="50"
        cy="50"
        fill="none"
        :stroke="backgroundColor"
        :stroke-width="strokeWidth"
        stroke-linecap="round"
        :style="circleStyle"
      />
      <!-- 进度圆环 -->
      <circle
        :r="radius"
        cx="50"
        cy="50"
        fill="none"
        :stroke="color"
        :stroke-width="strokeWidth"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
        stroke-linecap="round"
        :style="circleStyle"
        transform="rotate(-90 50 50)"
      />
    </svg>
    <div class="progress-text" :style="textStyle">{{ percentage }}%</div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue"

interface Props {
  percentage: number
  size?: number
  strokeWidth?: number
  color?: string
  backgroundColor?: string
  textSize?: number
  startAngle?: number // 开始角度
  endAngle?: number // 结束角度
}

const props = withDefaults(defineProps<Props>(), {
  size: 100,
  strokeWidth: 8,
  color: "#1890ff",
  backgroundColor: "#f5f5f5",
  textSize: 20,
  startAngle: 0,
  endAngle: 300, // 设置为300度，留出60度的缺口
})

const radius = computed(() => 50 - props.strokeWidth / 2)
const circumference = computed(() => {
  const angleRange = props.endAngle - props.startAngle
  return (2 * Math.PI * radius.value * angleRange) / 360
})

const dashOffset = computed(() => {
  if (props.percentage === 0) return circumference.value
  if (props.percentage === 100) return 0
  return circumference.value * (1 - props.percentage / 100)
})

const circleStyle = computed(() => ({
  transform: `rotate(${props.startAngle}deg)`,
  transformOrigin: "center",
  strokeDasharray: `${circumference.value} ${2 * Math.PI * radius.value}`,
}))

const containerStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  position: "relative" as const,
}))

const textStyle = computed(() => ({
  fontSize: `${props.textSize}px`,
  color: "#333",
}))
</script>

<style scoped>
.circle-progress {
  display: inline-block;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

circle {
  transition: stroke-dashoffset 0.3s ease;
}
</style>
