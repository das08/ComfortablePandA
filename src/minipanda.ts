import { Kadai, LectureInfo } from "./kadai";
import { nowTime, getDaysUntil, getTimeRemain, createElem, appendChildAll, createLectureIDMap } from "./utils";
import { miniPandA, hamburger, KadaiEntryDom, DueGroupDom, defaultTabCount, defaultTab } from "./dom";
import { toggleSideNav, toggleKadaiTab, toggleExamTab, toggleMemoBox } from "./eventListener";


function createHanburgerButton(): void {
  const topbar = document.getElementById("mastLogin");
  try {
    topbar?.appendChild(hamburger);
  } catch (e) {
    console.log("could not launch miniPandA.");
  }
}

function createMiniPandA(fetchedTime: number): void {
  const miniPandALogo = createElem("img", { className: "logo", alt: "logo", src: chrome.extension.getURL("img/logo.png")});

  const miniPandACloseBtn = createElem("a", { href: "#", id: "close_btn", textContent: "×" });
  miniPandACloseBtn.classList.add("closebtn", "q");
  miniPandACloseBtn.addEventListener("click", toggleSideNav);

  const kadaiTab = createElem("input", { type: "radio", id: "kadaiTab", name: "cp_tab", checked: true });
  kadaiTab.addEventListener("click", toggleKadaiTab);
  const kadaiTabLabel = createElem("label", { htmlFor: "kadaiTab", innerText: "課題一覧" });
  const examTab = createElem("input", { type: "radio", id: "examTab", name: "cp_tab", checked: false });
  examTab.addEventListener("click", toggleExamTab);
  const examTabLabel = createElem("label", { htmlFor: "examTab", innerText: "テスト・クイズ一覧" });
  const addMemoButton = createElem("button", { className: "plus-button", innerText: "+" });
  addMemoButton.addEventListener("click", toggleMemoBox, true);

  const fetchedTimestamp = new Date(fetchedTime);
  const fetchedTimeString = createElem("p", { className: "kadai-time" });
  fetchedTimeString.innerText = "取得日時： " + fetchedTimestamp.toLocaleDateString() + " " + fetchedTimestamp.getHours() + ":" + ("00" + fetchedTimestamp.getMinutes()).slice(-2) + ":" + ("00" + fetchedTimestamp.getSeconds()).slice(-2);

  appendChildAll(miniPandA, [
    miniPandALogo,
    miniPandACloseBtn,
    kadaiTab,
    kadaiTabLabel,
    examTab,
    examTabLabel,
    addMemoButton,
    fetchedTimeString
  ]);

  const parent = document.getElementById("pageBody");
  const ref = document.getElementById("toolMenuWrap");

  parent?.insertBefore(miniPandA, ref);
}

function updateMiniPandA(kadaiList: Array<Kadai>, lectureIDList: Array<LectureInfo>) {
  const dueGroupHeaderName = ["締め切り２４時間以内", "締め切り５日以内", "締め切り１４日以内", "その他"];
  const dueGroupColor = ["danger", "warning", "success", "other"];
  const initLetter = ["a", "b", "c", "d"];
  const kadaiDiv = createElem("div", { className: "kadai-tab" });
  const examDiv = createElem("div", { className: "exam-tab" });
  const lectureIDMap = createLectureIDMap(lectureIDList);

  // 0: <24h, 1: <5d, 2: <14d, 3: >14d
  for (let i = 0; i < 4; i++) {
    let entryCount = 0;
    // 色別のグループを作成する
    const dueGroupHeader = DueGroupDom.header.cloneNode(true);
    const dueGroupHeaderTitle = DueGroupDom.headerTitle.cloneNode(true);
    dueGroupHeader.className = `sidenav-${dueGroupColor[i]}`;
    dueGroupHeader.style.display = "none";
    dueGroupHeaderTitle.textContent = `${dueGroupHeaderName[i]}`;
    dueGroupHeader.appendChild(dueGroupHeaderTitle);
    const dueGroupContainer = DueGroupDom.container.cloneNode(true);
    dueGroupContainer.classList.add(`sidenav-list-${dueGroupColor[i]}`);
    dueGroupContainer.style.display = "none";

    // 各講義についてループ
    for (const item of kadaiList) {
      // 課題アイテムを入れるやつを作成
      const dueGroupBody = DueGroupDom.body.cloneNode(true);
      dueGroupBody.className = `kadai-${dueGroupColor[i]}`;
      dueGroupBody.id = initLetter[i] + item.lectureID;
      const dueGroupLectureName = DueGroupDom.lectureName.cloneNode(true);
      dueGroupLectureName.className = `lecture-${dueGroupColor[i]}`;
      dueGroupLectureName.textContent = "" + lectureIDMap.get(item.lectureID);
      dueGroupBody.appendChild(dueGroupLectureName);

      // 各講義の課題一覧についてループ
      let cnt = 0;
      for (const kadai of item.kadaiEntries) {
        let kadaiCheckbox = KadaiEntryDom.checkbox.cloneNode(true);
        const kadaiLabel = KadaiEntryDom.label.cloneNode(true);
        const kadaiDueDate = KadaiEntryDom.dueDate.cloneNode(true);
        const kadaiRemainTime = KadaiEntryDom.remainTime.cloneNode(true);
        const kadaiTitle = KadaiEntryDom.title.cloneNode(true);

        const _date = new Date(kadai.dueDateTimestamp * 1000);
        const dispDue = _date.toLocaleDateString() + " " + _date.getHours() + ":" + ("00" + _date.getMinutes()).slice(-2);
        const timeRemain = getTimeRemain((kadai.dueDateTimestamp * 1000 - nowTime) / 1000);

        const daysUntilDue = getDaysUntil(nowTime, kadai.dueDateTimestamp * 1000);
        if ((daysUntilDue <= 1 && i === 0) || (daysUntilDue > 1 && daysUntilDue <= 5 && i === 1) || (daysUntilDue > 5 && daysUntilDue <= 14 && i === 2) || (daysUntilDue > 14 && i === 3)) {
          kadaiDueDate.textContent = "" + dispDue;
          kadaiRemainTime.textContent = `あと${timeRemain[0]}日${timeRemain[1]}時間${timeRemain[2]}分`;
          kadaiTitle.textContent = "" + kadai.assignmentTitle;
          if (kadai.isFinished) kadaiCheckbox = true;
          kadaiCheckbox.id = kadai.kadaiID;
          kadaiCheckbox.lectureID = item.lectureID;
          // kadaiCheckbox.addEventListener('change', updateKadaiTodo, false);
          kadaiLabel.htmlFor = kadai.kadaiID;
          appendChildAll(dueGroupBody, [kadaiCheckbox, kadaiLabel, kadaiDueDate, kadaiRemainTime, kadaiTitle]);
          cnt++;
        }
      }
      // 各講義の課題で該当するものがある場合はグループに追加
      if (cnt > 0) {
        dueGroupContainer.appendChild(dueGroupBody);
        entryCount++;
      }
    }
    if (entryCount > 0) {
      dueGroupHeader.style.display = "";
      dueGroupContainer.style.display = "";
    }
    appendChildAll(miniPandA, [kadaiDiv, examDiv]);
    appendChildAll(kadaiDiv, [dueGroupHeader, dueGroupContainer]);
  }

  // 何もない時はRelaxPandAを表示する
  if (kadaiList.length === 0) {
    const kadaiTab = kadaiDiv;
    const relaxDiv = createElem("div", { className: "relaxpanda" });
    const relaxPandaP = createElem("p", { className: "relaxpanda-p", innerText: "現在表示できる課題はありません" });
    const relaxPandaImg = createElem("img", { className: "relaxpanda-img", alt: "logo", src: chrome.extension.getURL("img/relaxPanda.png")});
    appendChildAll(relaxDiv, [relaxPandaP, relaxPandaImg]);
    kadaiTab.appendChild(relaxDiv);
  }

}


function createNavBarNotification(lectureIDList: Array<LectureInfo>, kadaiList: Array<Kadai>) {
  for (const lecture of lectureIDList){
    for (let j = 2; j < defaultTabCount; j++) {
      let lectureID = defaultTab[j].getElementsByTagName('a')[1].getAttribute('data-site-id');
      if (lectureID === null) lectureID = defaultTab[j].getElementsByTagName('a')[0].getAttribute('data-site-id');
      const q = kadaiList.findIndex((kadai) => {
        return (kadai.lectureID === lectureID);
      });
      if (q !== -1) {
        if (!kadaiList[q].isRead) {
          defaultTab[j].classList.add("badge");
        }
        const daysUntilDue = getDaysUntil(nowTime, kadaiList[q].closestDueDateTimestamp * 1000);
        console.log("days until", daysUntilDue);
        if (daysUntilDue <= 1) {
          defaultTab[j].classList.add("nav-danger");
          defaultTab[j].getElementsByTagName('a')[0].classList.add('nav-danger');
          defaultTab[j].getElementsByTagName('a')[1].classList.add('nav-danger');
        } else if (daysUntilDue <= 5) {
          defaultTab[j].classList.add("nav-warning");
          defaultTab[j].getElementsByTagName('a')[0].classList.add('nav-warning');
          defaultTab[j].getElementsByTagName('a')[1].classList.add('nav-warning');
        } else if (daysUntilDue <= 14) {
          defaultTab[j].classList.add("nav-safe");
          defaultTab[j].getElementsByTagName('a')[0].classList.add('nav-safe');
          defaultTab[j].getElementsByTagName('a')[1].classList.add('nav-safe');
        }
      }
    }
  }
}


export { createHanburgerButton, createMiniPandA, updateMiniPandA, createNavBarNotification };
