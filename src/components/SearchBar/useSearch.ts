import { ref, watch, onMounted, nextTick } from "vue"
import { SearchBarCreator } from "./SerachBarCreator"

export type SearchModelType = "filename" | "content"

const searchBar = new SearchBarCreator() // 生成一个全局的搜索框，全局唯一
const searchKeyword = ref<string>("") // 搜索的关键词
const searchModel = ref<SearchModelType>("filename") // 搜索的模式:1.按照文件名 2.按照内容搜索
const searchHistoryLists = ref<Array<string>>([])
//打开搜索框
function openSearchBar() {
  searchBar.present()
}
//关闭搜索框
function closeSearchBar() {
  searchBar.dismiss()
}
//清空搜索的关键词
function cleanSearchKeyword() {
  searchKeyword.value = ""
}

//tips: 搜索按钮只关心于路由跳转《传递参数》，并不真正的关心搜索的功能
//=> 需要 searchResult 页面自己通过《路由参数》然后通过参数去后端获取数据
function hdlSearchBtn(keyword: string) {
  const _keyword = keyword.trim()
  if (!_keyword) return
  closeSearchBar()
  // db.insert(_keyword)
}

// //tips: 获取搜索历史
// async function getHistoryLists() {
//   searchHistoryLists.value = await db.list()
// }

// //tips: 单独删除一条搜索历史纪录
// async function delOneSearchHistory(k: string) {
//   await db.removeOne(k)
//   await getHistoryLists()
// }

// //tips: 删除全部搜索历史纪录
// async function delAllSearchHistory() {
//   await db.removeAll()
//   await getHistoryLists()
// }

watch(searchKeyword, () => {
  console.log("searchKeyword.value", searchKeyword.value)
})

export default {
  openSearchBar, //打开搜索框
  closeSearchBar, //关闭搜索框
  searchKeyword, //搜索的关键词
  searchModel, //搜索的模式:1.按文件名 2.按文件内容
  cleanSearchKeyword, //清除搜索关键字
  hdlSearchBtn, //按下搜索按钮==> 开始搜索

  //<------------------- 搜索记录相关  ------------------->
  // searchHistoryLists, //搜索记录数组
  // getHistoryLists, //获取搜索记录
  // delOneSearchHistory, //删除其中一条搜索记录
  // delAllSearchHistory, //删除全部搜索记录
}
