import { h, render } from "vue"

import SearchBar from "./SearchBar.vue"
export class SearchBarCreator {
  container: HTMLElement
  appElement: HTMLElement | null
  showing: boolean
  _dismiss: () => void
  constructor() {
    this.container = document.createElement("div")
    this.showing = false
    this.appElement = document.body.querySelector("#app")
    this.present.bind(this)
    this.dismiss.bind(this)
    this._dismiss = this.dismiss.bind(this)
  }

  present() {
    if (this.showing) {
      this.dismiss()
    } else {
      const searchBar = h(h(SearchBar))
      render(searchBar, this.container)
      const searchBarWrapperDOM =
        this.container.querySelector("#searchBarWrapper")
      searchBarWrapperDOM?.classList.add("animate-searchInputAnimation")
      document.body.insertBefore(this.container, document.body.firstChild)
      this.showing = true
      this.appElement?.addEventListener("click", this._dismiss)
    }
  }

  dismiss() {
    if (this.showing && this.container) {
      render(null, this.container)
      document.body.removeChild(this.container)
      this.showing = false
      this.appElement?.removeEventListener("click", this._dismiss)
    } else {
      console.log("不需要关闭")
    }
  }
}
