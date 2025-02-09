import { DueCategory, getClosestTime, getDaysUntil } from "../utils";
import { Settings } from "../features/setting/types";
import { EntityProtocol, EntryProtocol } from "../features/entity/type";
import { MaxTimestamp } from "../constant";

const dueCategoryClassMap: { [key in DueCategory]: string } = {
    dueVerySoon: "cs-tab-danger",
    dueSoon: "cs-tab-warning",
    dueMiddle: "cs-tab-success",
    dueLater: "cs-tab-other",
    duePassed: ""
};

type CourseMap = Map<string, { entries: EntryProtocol[]; isRead: boolean }>;
type DueMap = Map<string, { due: DueCategory; isRead: boolean }>;

const createCourseMap = (entities: EntityProtocol[]): CourseMap => {
    const courseMap = new Map<string, { entries: EntryProtocol[]; isRead: boolean }>();
    for (const entity of entities) {
        let entries = courseMap.get(entity.course.id);
        if (entries === undefined) {
            entries = { entries: [], isRead: true };
            courseMap.set(entity.course.id, entries);
        }
        entries.entries.push(...entity.entries);
        entries.isRead = entries.isRead && (entity.isRead || entity.entries.length === 0);
    }
    return courseMap;
};

const createDueMap = (settings: Settings, courseMap: CourseMap): DueMap => {
    const dueMap = new Map<string, { due: DueCategory; isRead: boolean }>();
    for (const [courseID, entries] of courseMap.entries()) {
        if (entries.entries.length === 0) continue;
        const closestTime = getClosestTime(settings, entries.entries);
        if (closestTime === MaxTimestamp) continue;
        const daysUntilDue = getDaysUntil(settings, settings.appInfo.currentTime, closestTime);
        dueMap.set(courseID, { due: daysUntilDue, isRead: entries.isRead });
    }
    return dueMap;
};

/**
 * Add notification badge for new Assignment/Quiz
 */
export async function createFavoritesBar(settings: Settings, entities: EntityProtocol[]): Promise<void> {
    const defaultTab = document.querySelectorAll(".Mrphs-sitesNav__menuitem");
    const defaultTabCount = Object.keys(defaultTab).length;

    const courseMap = createCourseMap(entities);
    const dueMap = createDueMap(settings, courseMap);

    for (let j = 0; j < defaultTabCount; j++) {
        const aTag = defaultTab[j].getElementsByClassName("link-container")[0] as HTMLAnchorElement | undefined;
        const href = aTag?.href;
        const hrefContent = href?.match("(https?://[^/]+)/portal/site-?[a-z]*/([^/]+)");
        if (hrefContent === undefined || hrefContent === null) {
            continue;
        }
        const courseID = hrefContent[2];
        if (courseID === undefined) continue;
        const courseInfo = dueMap.get(courseID);
        if (courseInfo === undefined) continue;

        const tabClass = dueCategoryClassMap[courseInfo.due];
        const aTagCount = defaultTab[j].getElementsByTagName("a").length;
        // Apply color to course button
        if(tabClass !== "") {   // If not duePassed
            for (let i = 0; i < aTagCount; i++) {
                defaultTab[j].getElementsByTagName("a")[i].classList.add(tabClass);
            }
        }
        defaultTab[j].classList.add(tabClass);
        // Put notification badge
        if (!courseInfo.isRead) {
            defaultTab[j].classList.add("cs-notification-badge");
        }
    }
}

export const resetFavoritesBar = (): void => {
    const classList = ["cs-notification-badge", "cs-tab-danger", "cs-tab-warning", "cs-tab-success", "cs-tab-other"];
    for (const c of classList) {
        const q = document.querySelectorAll(`.${c}`);
        // @ts-ignore
        for (const _ of q) {
            _.classList.remove(`${c}`);
            _.style = "";
        }
    }
}