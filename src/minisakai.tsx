import React from "react";
import { createRoot } from "react-dom/client";
import { MiniSakaiRoot } from "./components/main";
import { Settings } from "./features/setting/types";

let toggle = false;
/**
 * Change visibility of miniSakai
 */
export const toggleMiniSakai = (): void => {
    if (toggle) {
        // Hide miniSakai
        miniSakai.classList.remove("cs-show");
        miniSakai.classList.add("cs-hide");
        document.getElementById("cs-cover")?.remove();
    } else {
        // Display miniSakai
        miniSakai.classList.remove("cs-hide");
        miniSakai.classList.add("cs-show");
        const cover = document.createElement("div");
        cover.id = "cs-cover";
        document.getElementsByTagName("body")[0].appendChild(cover);
        cover.onclick = toggleMiniSakai;
    }
    toggle = !toggle;
};

export const miniSakai = document.createElement("div");
miniSakai.id = "miniSakai";
miniSakai.classList.add("cs-minisakai", "cs-tab");

export const hamburger = document.createElement("div"); // buttonをdivに変更
hamburger.className = "cs-minisakai-btn-div";
hamburger.style.cursor = "pointer";
hamburger.addEventListener("click", toggleMiniSakai);

/**
 * Create a button to open miniSakai
 */
export function createMiniSakaiBtn(): void {
    const targetContainer = document.querySelector("#sakai-system-indicators");
    if (targetContainer) {
        const newListItem = document.createElement("li");
        newListItem.style.marginRight = "25px";
        newListItem.style.display = "flex";
        newListItem.style.alignItems = "center";

        const hamburgerIcon = document.createElement("img");
        hamburgerIcon.src = chrome.runtime.getURL("img/miniSakaiBtn.png");
        hamburgerIcon.className = "cs-minisakai-btn";

        hamburger.append(hamburgerIcon);
        newListItem.append(hamburger);
        targetContainer.append(newListItem);
    } else {
        console.log("could not launch miniSakai btn.");
    }
}

/**
 * Insert miniSakai into Sakai.
 */
export function createMiniSakai(hostname: string) {
    const parent = document.body;
    parent.appendChild(miniSakai);
    
    miniSakai.style.position = "fixed";
    miniSakai.style.top = "0px"; // 上からの隙間
    miniSakai.style.right = "15px"; // 右からの隙間
    miniSakai.style.zIndex = "99999"; // 最前面に出す

    const root = createRoot(miniSakai);
    root.render(<MiniSakaiRoot subset={false} hostname={hostname} />);
}

export const applyColorSettings = (settings: Settings, isSubSakai: boolean): void => {
    // 古いヘッダーを探すコードを消してdocument.bodyに書き換え
    let bodyStyles: HTMLElement = document.body; 

    for (const colorName of Object.getOwnPropertyNames(settings.color)) {
        // @ts-ignore
        const color = settings.color[colorName];
        bodyStyles.style.setProperty(`--${colorName}`, color);
    }
    bodyStyles.style.setProperty("--textColor", settings.getTextColor());
    bodyStyles.style.setProperty("--bgColor", settings.getBgColor());
    bodyStyles.style.setProperty("--dateColor", settings.getDateColor());
};
