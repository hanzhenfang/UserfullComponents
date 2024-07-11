import { time } from "console"
import { Ref, ref, MaybeRef, unref } from "vue"
import { useThrottleFn } from "@vueuse/core"

interface Info {
  element: null | HTMLDivElement
  initIndex: number
  desIndex: number
}

interface ElementInfo<T extends HTMLElement = HTMLDivElement> {
  element: null | T
  ltp: {
    //  left top  点坐标值
    x: number
    y: number
  } //right bottom 点坐标值
  rbp: {
    x: number
    y: number
  } //圆心坐标信息
  center: {
    x: number
    y: number
  }
  height: number
  width: number
}

interface CustomInitOption {
  specialTarget?: string | undefined //值需要一个类名选择器：如:(.boxes) 可以作用于指定容器元素中的子元素作为拖拽目标
}

interface DragSortOption<T> {
  delayTime?: number
  scaleRatio?: number
  additionalEl?: string
  onBeforeClonedElAppend?: (cloneEl: HTMLElement, dragedEl: HTMLElement) => any
  onIntersected?: (intersectdEl: ElementInfo<HTMLElement>) => any
  onAfterPointerUp?: (list: T[], dragedEL: HTMLElement) => any
}

//移动端的拖拽排序
export function useTouchDragSort<T = any>(elList: Ref<T[]>, option?: DragSortOption<T>) {
  const flag = Array.isArray(elList.value)
  if (!flag) throwError(`${elList.value} is not an Array,Please pass an correct Array! (请传递一个正确的数组)`)
  //被克隆的元素
  const dragedElInfo: Info = {
    element: null,
    initIndex: -1,
    desIndex: -1,
  }

  //克隆的元素
  const cloneElInfo: ElementInfo = {
    element: null,
    ltp: {
      x: 0,
      y: 0,
    },
    rbp: {
      x: 0,
      y: 0,
    },
    center: {
      x: 0,
      y: 0,
    },
    height: 0,
    width: 0,
  }

  // 最开始的触摸点，用来计算 scroll 的 值
  const initPointerInfo = {
    x: 0,
    y: 0,
  }

  //当前光标坐标信息
  const latestPointerInfo = {
    x: 0,
    y: 0,
  }

  //当前光标和之前的差值
  const diff = {
    x: 0,
    y: 0,
  }

  const scaleRatio = option?.scaleRatio ?? 1
  // 被相交的元素（也就是被交换位置的元素）
  let intersectedEl: ElementInfo | null = null

  let listChildrenArr: HTMLCollection //最初的元素列表
  let listItemRectArr: ElementInfo[] = [] //元素的位置坐标信息
  const targetElMap = new WeakMap() // 克隆元素和 wrapper 元素的映射关系
  let initOptions: CustomInitOption = {}

  const isDraging = ref<boolean>(false)

  let areaThreshold = { ver: 0, hor: 0 }
  let containerEl: HTMLElement | null = null
  let timerID = -1

  function onTouchStart(e: TouchEvent) {
    timerID = window.setTimeout(() => {
      if (e.target === containerEl) return //如果抓取的是容器元素则取消
      if (isDraging.value) return
      isDraging.value = true
      // 记录光标初始坐标信息
      const { clientX, clientY } = e.touches[0]
      initPointerInfo.x = clientX
      initPointerInfo.y = clientY
      latestPointerInfo.x = clientX
      latestPointerInfo.y = clientY

      dragedElInfo.element = e.target as HTMLDivElement
      const index = Array.prototype.indexOf.call(listChildrenArr, targetElMap.get(dragedElInfo.element) as any)
      dragedElInfo.initIndex = index
      dragedElInfo.desIndex = index

      //设置被克隆元素的初始位置
      const _currentClonedEl = listItemRectArr[index]
      if (!_currentClonedEl) return
      cloneElInfo.ltp = { ..._currentClonedEl.ltp }
      cloneElInfo.rbp = { ..._currentClonedEl.rbp }
      cloneElInfo.center = _currentClonedEl.center
      cloneElInfo.element = dragedElInfo.element.cloneNode(true) as HTMLDivElement

      option?.onBeforeClonedElAppend?.(cloneElInfo.element, dragedElInfo.element) //在挂载之前允许用户对克隆元素作特殊处理,如:添加类名以达到特殊样式
      document.body.appendChild(cloneElInfo.element)
      cloneElInfo.element.style.transform = `scale(${scaleRatio}) translate(${cloneElInfo.ltp.x / scaleRatio}px,${cloneElInfo.ltp.y / scaleRatio}px) `

      //   cloneElInfo.element.addEventListener("touchmove", onPointerMove)
      //   cloneElInfo.element.addEventListener("touchend", onPointerUp)
      //   cloneElInfo.element.setPointerCapture(e.pointerId) //转移 pointer 的捕获目标为 cloneEl
    }, option?.delayTime)
  }

  function onTouchMove(e: TouchEvent) {
    if (!isDraging.value || !cloneElInfo.element) return
    e.preventDefault()

    const y = e.touches[0].clientY
    const x = e.touches[0].clientX

    diff.x = x - latestPointerInfo.x
    diff.y = y - latestPointerInfo.y

    latestPointerInfo.x = x
    latestPointerInfo.y = y

    cloneElInfo.ltp.x += diff.x
    cloneElInfo.ltp.y += diff.y

    cloneElInfo.rbp.x += diff.x
    cloneElInfo.rbp.y += diff.y

    cloneElInfo.center.x += diff.x
    cloneElInfo.center.y += diff.y

    cloneElInfo.element.style.transform = `scale(${scaleRatio}) translate(${cloneElInfo.ltp.x / scaleRatio}px,${cloneElInfo.ltp.y / scaleRatio}px) `
    const result = checkIsIntersected()

    if (!result.isIntersected) return
    const elInfo = result.elInfo!

    const isPointerEnter = checkIsPointerEnterElArea(elInfo) //判断光标是否进入元素内部
    if (!isPointerEnter) return

    if (option?.additionalEl) {
      const stopflag = elInfo.element === document.querySelector(`#${option.additionalEl}`)
      console.log("elInfo.element", elInfo.element)
      const el2 = document.querySelector(`#${option.additionalEl}`)
      console.log("el2", el2)

      console.log("stopflag", stopflag)
      if (stopflag) {
        option?.onIntersected?.(elInfo)
        return
      }
    } // 找到当前与克隆元素相交的元素,准备改变 index
    console.log("继续环卫")
    const intersectedElIndex = listItemRectArr.findIndex(item => item.element === elInfo.element)
    const isBack = dragedElInfo.desIndex < intersectedElIndex
    const isForward = dragedElInfo.desIndex > intersectedElIndex
    if (isBack) {
      for (let i = dragedElInfo.desIndex; i < intersectedElIndex; i++) {
        if (i < dragedElInfo.initIndex) {
          listItemRectArr[i].element!.style.transform = "translate3d(0px,0px,0px)"
        } else {
          const curr = listItemRectArr[i + 1]
          const next = listItemRectArr[i]
          const x = next.ltp.x - curr.ltp.x
          const y = next.ltp.y - curr.ltp.y
          curr.element!.style.transition = "300ms ease-out"
          curr.element!.style.transform = `translate3d(${x}px,${y}px,0)`
        }
      }
      intersectedEl = listItemRectArr[intersectedElIndex + 1]
    } else if (isForward) {
      //在
      for (let i = intersectedElIndex; i < dragedElInfo.desIndex; i++) {
        if (i >= dragedElInfo.initIndex) {
          listItemRectArr[i + 1].element!.style.transform = "translate3d(0px,0px,0px)"
        } else {
          const curr = listItemRectArr[i]
          const next = listItemRectArr[i + 1]
          const x = next.ltp.x - curr.ltp.x
          const y = next.ltp.y - curr.ltp.y
          curr.element!.style.transition = "300ms ease-out"
          curr.element!.style.transform = `translate3d(${x}px,${y}px,0)`
        }
      }

      intersectedEl = listItemRectArr[intersectedElIndex]
    }
    const _x = listItemRectArr[intersectedElIndex].ltp.x - listItemRectArr[dragedElInfo.initIndex].ltp.x
    const _y = listItemRectArr[intersectedElIndex].ltp.y - listItemRectArr[dragedElInfo.initIndex].ltp.y
    dragedElInfo.element!.style.transition = "300ms ease-out"
    dragedElInfo.element!.style.transform = `translate(${_x}px,${_y}px)`
    dragedElInfo.desIndex = intersectedElIndex
  }

  function onTouchEnd() {
    if (!isDraging.value) {
      clearTimeout(timerID)
      return
    }
    isDraging.value = false
    if (!containerEl) return

    dragedElInfo.element?.classList.remove("current-item")
    cloneElInfo.element?.remove()

    for (let i = 0; i < listItemRectArr.length; i++) {
      const curEl = listItemRectArr[i].element
      curEl!.style.transition = "none"
      curEl!.style.transform = "translate(0,0)"
    }
    if (intersectedEl !== null) {
      const clonedFatherEl = targetElMap.get(dragedElInfo.element!) // 克隆元素的(真实最外层父元素)
      //巧妙利用 insertBefore 传 null 会自动在末尾添加的特性来完成最后一项换位置的功能
      containerEl.insertBefore(clonedFatherEl, intersectedEl === undefined ? null : targetElMap.get(intersectedEl.element!))
    }
    intersectedEl = null
    const swapedList: T[] = JSON.parse(JSON.stringify(elList.value)) //深拷贝原数组，传递排序后的数据给用户自行操作
    swapItem(swapedList, dragedElInfo.initIndex, dragedElInfo.desIndex)
    option?.onAfterPointerUp?.(swapedList, dragedElInfo.element!)
    getElListRect()
  }

  // 仅判断克隆元素是否与列表元素相交，返回相交的元素(不管指针是否进入相交元素内部)
  // 可以抽出来使用
  function checkIsIntersected() {
    let notIntersected = true
    let intersectedEl: ElementInfo | null = null
    const result: {
      isIntersected: boolean
      elInfo: null | ElementInfo
    } = {
      isIntersected: !notIntersected,
      elInfo: notIntersected ? null : intersectedEl,
    }

    for (let i = 0; i < listItemRectArr.length; i++) {
      if (i === dragedElInfo.desIndex) continue
      const item = listItemRectArr[i]
      notIntersected =
        cloneElInfo.rbp.x < item.ltp.x || //左侧
        cloneElInfo.ltp.x > item.rbp.x || //右侧
        cloneElInfo.ltp.y > item.rbp.y || //下侧
        cloneElInfo.rbp.y < item.ltp.y //上侧
      if (!notIntersected) {
        result.elInfo = item
        result.isIntersected = true
        break
      }
    }

    return result
  }

  //判断当前光标指针是否进入相交元素内部
  function checkIsPointerEnterElArea(el: ElementInfo) {
    if (!el) return
    const { x, y } = latestPointerInfo
    const min_left = x > el.ltp.x + areaThreshold.ver
    const min_right = x < el.rbp.x - areaThreshold.ver
    const min_top = y > el.ltp.y + areaThreshold.hor
    const min_bottom = y < el.rbp.y - areaThreshold.hor
    return min_left && min_right && min_top && min_bottom
  }

  // 交换数组的位置
  function swapItem(arrList: MaybeRef<T[]>, from: number, to: number) {
    const arr = unref(arrList)
    if (to >= 0 && to < arr.length) {
      const item = arr.splice(from, 1)[0]
      arr.splice(to, 0, item)
    }
    return arr
  }

  //  获取所有元素的坐标信息
  function getElListRect() {
    console.log("重新计算")
    if (!containerEl) return
    listItemRectArr.length = 0
    listChildrenArr = containerEl.children

    const childrenEls = Array.from(listChildrenArr) as HTMLDivElement[]
    for (const element of childrenEls) {
      let queryElement: HTMLElement | null = null
      const { specialTarget } = initOptions
      if (specialTarget) {
        //NOTE: 如果有指定元素，则抓取用户手动指定的子元素
        queryElement = element.querySelector<HTMLDivElement>(specialTarget)
      } else {
        queryElement = element
      }
      const elInfo = getElementInfo(queryElement as any)
      listItemRectArr.push(elInfo)
      targetElMap.set(queryElement!, element) //设定子元素和父元素的对应关系,目的是计算出正确的 index 值
    }
    console.log("执行结束")
  }

  //获取元素的左上角和右下角坐标信息
  function getElementInfo<T extends HTMLDivElement>(element: T): ElementInfo {
    const rectInfo = element.getBoundingClientRect()
    const { left, top, right, bottom, width, height } = rectInfo
    return {
      element: element,
      ltp: {
        x: left,
        y: top,
      },
      rbp: {
        x: right,
        y: bottom,
      },
      center: { x: left + width / 2, y: top + height / 2 },
      height: height,
      width: width,
    }
  }

  // 设置阈值，用户有可能不希望光标刚进入就交换位置
  function setAreaThreshold(threshold: typeof areaThreshold) {
    if (listItemRectArr.length === 0) return
    const elRectInfo = listItemRectArr[0]
    const max_vertical = elRectInfo.height / 2
    const max_horizontal = elRectInfo.width / 2
    if (threshold.hor > max_horizontal || threshold.ver > max_vertical) {
      throw new Error("请勿设置超过元素宽度(或高度)一半的数值")
    }
    areaThreshold = threshold
  }

  function getAddtionalElRect() {
    if (option?.additionalEl) {
      const el = document.querySelector(`#${option.additionalEl}`) as HTMLDivElement
      const info = getElementInfo(el)
      listItemRectArr.push(info)
      return true
    }
    return false
  }

  function init(containerElement: HTMLElement, option?: CustomInitOption) {
    if (!containerElement) throwError("不存在 containerElement 容器元素")
    containerEl = containerElement
    if (option?.specialTarget) {
      const targetEl = containerEl.querySelector(option.specialTarget)
      if (!targetEl) throwError("请检查 special 指定的元素是否是 containerEl 的子元素，且是否存在!")
      initOptions.specialTarget = option?.specialTarget //指定要选取的内部元素
    }
    getElListRect()
    getAddtionalElRect()
    console.log("listItemRectArr", listItemRectArr)
    containerEl.addEventListener("touchstart", onTouchStart)
    containerEl.addEventListener("touchmove", onTouchMove)
    containerEl.addEventListener("touchend", onTouchEnd)

    const observer = new ResizeObserver(() => {
      requestAnimationFrame(getElListRect)
    })

    observer.observe(containerEl)

    containerEl.addEventListener("scroll", () => {
      console.log("页面滚动")
    })
  }
  return {
    init,
    containerEl,
    isDraging,
    isIntersected: checkIsIntersected,
    setAreaThreshold,
    refreshListRect: getElListRect,
    draggingEl: dragedElInfo,
    cloneEl: cloneElInfo,
  }
}

function throwError(message: string): never {
  throw new Error(message)
}
