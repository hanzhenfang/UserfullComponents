import { h, render } from "vue";

import Dialog from "./Dialog.vue";

interface DialogOptions {
  title: string;
  content: string;
  confirmCallBackFn: () => void;
}

interface DialogOptionsType extends DialogOptions {
  closeDialogFn: () => void;
}

export class DialogCreator {
  options: DialogOptionsType;
  containerEl: HTMLDivElement;
  isShow: boolean;
  constructor(options: DialogOptions) {
    const _options: DialogOptionsType = {
      ...options,
      closeDialogFn: this.dismiss.bind(this),
    };
    this.options = _options;
    this.containerEl = document.createElement("div");
    this.isShow = false;
  }

  present() {
    if (this.isShow) return;
    const vNode = h(Dialog, this.options);
    render(vNode, this.containerEl);
    document.body.insertBefore(this.containerEl, document.body.firstChild);
    this.isShow = true;
  }
  dismiss() {
    if (!this.isShow) return;
    render(null, this.containerEl);
    document.body.removeChild(this.containerEl);
    this.isShow = false;
  }
}
