var check = document.querySelector('input');

function setAction (isBlack) {
  chrome.action.setIcon({
    path: {
      "16": isBlack ? 'icon/icon-black.png' : 'icon/icon.png',
      "32": isBlack ? 'icon/icon-black.png' : 'icon/icon.png',
      "48": isBlack ? 'icon/icon-black.png' : 'icon/icon.png',
      "128": isBlack ? 'icon/icon-black.png' : 'icon/icon.png'
    }
  });

  chrome.action.setTitle({
    title: isBlack ? 'Not That Colorful QRCode' : 'Colorful QRCode'
  });
}

check.onchange = function () {
  if (this.checked) {
    alert('好吧，已保存！');
  } else {
    alert('已保存，(♥◠‿◠)');
  }

  chrome.storage.sync.set({
    isBlack: this.checked
  });

  setAction(this.checked);

  chrome.tabs.getCurrent(function (tab) {
    chrome.tabs.remove(tab.id);
  });
};

chrome.storage.sync.get(function (options) {
  check.checked = !!options && options.isBlack;

  setAction(check.checked);
});
