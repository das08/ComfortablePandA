import { getCourseSiteID } from "../../utils";

/**
 * Limit maximum number of course sites
 * @type {int}
 */
const MAX_FAVORITES = 100;

const getSiteIdAndHrefSiteNameMap = (): Map<string, { href: string, title: string }> => {
    const sites = document.querySelectorAll(".fav-sites-entry");
    const map = new Map<string, { href: string; title: string }>();
    sites.forEach((site) => {
        const siteId = site.querySelector(".site-favorite-btn")?.getAttribute("data-site-id");
        if (siteId == null) return;
        const href = (site.querySelector(".fav-title")?.childNodes[1] as HTMLAnchorElement).href;
        const title = (site.querySelector(".fav-title")?.childNodes[1] as HTMLAnchorElement).title;
        map.set(siteId, { href: href, title: title });
    });
    return map;
};

/**
 * Get hrefs of sites in favorite bar
 */
const getCurrentFavoritesSite = (): Array<string> => {
    const topnav = document.querySelector("#topnav");
    if (topnav == null) return new Array<string>();
    const sites = topnav.querySelectorAll(".Mrphs-sitesNav__menuitem");
    const hrefs: Array<string> = [];
    for (const site of Array.from(sites)) {
        const href = (site.getElementsByClassName("link-container")[0] as HTMLAnchorElement).href;
        hrefs.push(href);
    }
    return hrefs;
};

/**
 * Add course sites to favorites bar (more than Sakai config)
 * @param {string} baseURL
 */
export const addFavoritedCourseSites = (baseURL: string): Promise<void> => {
    const topnav = document.querySelector("#topnav");
    if (topnav == null) return new Promise((resolve) => resolve());
    const request = new XMLHttpRequest();
    request.open("GET", baseURL + "/portal/favorites/list");
    request.responseType = "json";

    document.querySelector(".organizeFavorites")?.addEventListener("click", editFavoritesMessage);
    return new Promise((resolve, reject) => {
        request.addEventListener("load", (e) => {
            const res = request.response;
            if (res == null) {
                console.log("failed to fetch favorites list");
                reject();
            }
            const favorites = res.favoriteSiteIds as [string];
            const sitesInfo = getSiteIdAndHrefSiteNameMap();
            const currentFavoriteSite = getCurrentFavoritesSite();
            for (const favorite of favorites.slice(0, MAX_FAVORITES)) {
                // skip if favorite is the current site
                if (getCourseSiteID(window.location.href) === favorite) continue;

                const siteInfo = sitesInfo.get(favorite);
                if (siteInfo === undefined) continue;
                const href = siteInfo.href;
                const title = siteInfo.title;

                // skip if the site is already shown
                if (currentFavoriteSite.find((c) => c == href) != null) continue;

                const li = document.createElement("li");
                li.classList.add("Mrphs-sitesNav__menuitem");
                const anchor = document.createElement("a");
                anchor.classList.add("link-container");
                anchor.href = href;
                anchor.title = title;
                const span = document.createElement("span");
                span.innerText = title;
                anchor.appendChild(span);
                li.appendChild(anchor);
                topnav.appendChild(li);
            }
            resolve();
        });
        request.send();
    });
};

async function editFavoritesMessage(): Promise<void> {
    // Wait 200ms until jQuery finished generating message.
    await new Promise((r) => setTimeout(r, 200));
    try {
        const message = document.getElementsByClassName("favorites-max-marker")[0];
        message.innerHTML = `<i class='fa fa-bell warning-icon'></i><b>${chrome.i18n.getMessage("favorites", chrome.runtime.getManifest().name)}</b>`;
        const lectureTabs = document.getElementsByClassName("fav-sites-entry");
        const lectureTabsCount = lectureTabs.length;
        for (let i = 0; i < lectureTabsCount; i++) {
            lectureTabs[i].classList.remove("site-favorite-is-past-max");
        }
    } catch (e) {
        console.log("could not edit message");
    }
}
