import { FetchTime, Settings } from "./features/setting/types";
import { Course } from "./features/course/types";
import { Assignment } from "./features/entity/assignment/types";
import { Quiz } from "./features/entity/quiz/types";
import { Memo } from "./features/entity/memo/types";
import { getAssignments } from "./features/entity/assignment/getAssignment";
import { getQuizzes } from "./features/entity/quiz/getQuiz";
import { getMemos } from "./features/entity/memo/getMemo";
import { fromStorage } from "./features/storage";
import { AssignmentFetchTimeStorage, CurrentTime, MaxTimestamp, QuizFetchTimeStorage } from "./constant";
import { saveAssignments } from "./features/entity/assignment/saveAssignment";
import { EntryProtocol } from "./features/entity/type";

//export type DueCategory = "due24h" | "due5d" | "due14d" | "dueOver14d" | "duePassed";
export type DueCategory = "dueVerySoon" | "dueSoon" | "dueMiddle" | "dueLater" | "duePassed";

export async function getEntities(settings: Settings, courses: Array<Course>, cacheOnly = false) {
    // TODO: 並列化する
    const hostname = settings.appInfo.hostname;
    const currentTime = settings.appInfo.currentTime;
    const fetchTime = await getFetchTime(hostname);
    const assignment: Array<Assignment> = await getAssignments(
        hostname,
        courses,
        cacheOnly || shouldUseCache(fetchTime.assignment, currentTime, settings.cacheInterval.assignment)
    );
    const quiz: Array<Quiz> = await getQuizzes(
        hostname,
        courses,
        cacheOnly || shouldUseCache(fetchTime.quiz, currentTime, settings.cacheInterval.quiz)
    );
    const memo: Array<Memo> = await getMemos(hostname);
    return {
        assignment: assignment,
        quiz: quiz,
        memo: memo
    };
}

const decodeTimestamp = (data: any): number | undefined => {
    if (data === undefined) return undefined;
    return data as number;
};

export const shouldUseCache = (fetchTime: number | undefined, currentTime: number, cacheInterval: number): boolean => {
    if (fetchTime === undefined) return false;
    // console.log(currentTime, fetchTime);
    return currentTime - fetchTime <= cacheInterval;
};

export async function getFetchTime(hostname: string): Promise<FetchTime> {
    const assignmentTime = await fromStorage<number | undefined>(hostname, AssignmentFetchTimeStorage, decodeTimestamp);
    const quizTime = await fromStorage<number | undefined>(hostname, QuizFetchTimeStorage, decodeTimestamp);
    return {
        assignment: assignmentTime,
        quiz: quizTime
    };
}

/**
 * Calculate category of assignment due date
 * @param {Settings} settings
 * @param {number} dt1 standard time
 * @param {number} dt2 target time
 */
function getDaysUntil(settings: Settings, dt1: number, dt2: number): DueCategory {
    let diff = dt2 - dt1;
    let diffhour = diff / 3600;
    diff /= 3600 * 24;
    let category: DueCategory;
    if (diffhour > 0 && diffhour <= settings.timeUntilDeadline.dangerHours) {
        category = "dueVerySoon";
    } else if (diffhour > settings.timeUntilDeadline.dangerHours && diff <= settings.timeUntilDeadline.warningDays) {
        category = "dueSoon";
    } else if (diff > settings.timeUntilDeadline.warningDays && diff <= settings.timeUntilDeadline.middleDays) {
        category = "dueMiddle";
    } else if (diff > settings.timeUntilDeadline.middleDays) {
        category = "dueLater";
    } else {
        category = "duePassed";
    }
    return category;
}

/**
 * Format timestamp for displaying
 * @param {number | undefined} timestamp
 */
function formatTimestamp(timestamp: number | undefined): string {
    if (timestamp === undefined) return "---";
    const date = new Date(timestamp * 1000);
    return (
        date.toLocaleDateString() +
        " " +
        date.getHours() +
        ":" +
        ("00" + date.getMinutes()).slice(-2) +
        ":" +
        ("00" + date.getSeconds()).slice(-2)
    );
}

export const getClosestTime = (settings: Settings, entries: Array<EntryProtocol>): number => {
    const option = settings.miniSakaiOption;
    const appInfo = settings.appInfo;
    return entries
        .filter((e) => {
            if (!option.showCompletedEntry) {
                if (e.hasFinished) return false;
            }
            return settings.appInfo.currentTime <= e.getTimestamp(appInfo.currentTime, option.showLateAcceptedEntry);
        })
        .reduce(
            (prev, e) => Math.min(e.getTimestamp(appInfo.currentTime, option.showLateAcceptedEntry), prev),
            MaxTimestamp
        );
};

export const getLoggedInInfoFromScript = (): Array<HTMLScriptElement> => {
    return Array.from(document.getElementsByTagName("script"));
};

/**
 * Check if user is loggend in to Sakai.
 */
function isLoggedIn(): boolean {
    const scripts = getLoggedInInfoFromScript();
    let loggedIn = false;
    for (const script of scripts) {
        if (script.text.match("\"loggedIn\": true")) loggedIn = true;
    }
    return loggedIn;
}

/**
 * Get courseID of current site.
 */
export const getCourseSiteID = (url: string): string | undefined => {
    let courseID: string | undefined;
    const reg = new RegExp("(https?://[^/]+)/portal/site/([^/]+)");
    if (url.match(reg)) {
        courseID = url.match(reg)?.[2];
    }
    return courseID;
};

export const updateIsReadFlag = (currentHref: string, assignments: Array<Assignment>, hostname: string) => {
    const courseID = getCourseSiteID(currentHref);
    if (courseID === undefined) return;
    for (const assignment of assignments) {
        if (assignment.course.id === courseID && assignment.entries.length > 0) {
            assignment.isRead = true;
            saveAssignments(hostname, assignments);
        }
    }
};

/**
 * Change loading icon to hamburger button.
 */
function miniSakaiReady(): void {
    const loadingIcon = document.getElementsByClassName("cs-loading")[0];
    const hamburgerIcon = document.createElement("img");
    hamburgerIcon.src = chrome.runtime.getURL("img/miniSakaiBtn.png");
    hamburgerIcon.className = "cs-minisakai-btn";
    loadingIcon.className = "cs-minisakai-btn-div";
    loadingIcon.append(hamburgerIcon);
}

export function getRemainTimeString(dueInSeconds: number): string {
    if (dueInSeconds === MaxTimestamp) return chrome.i18n.getMessage("due_not_set");
    const seconds = dueInSeconds - CurrentTime;
    const day = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds - day * 3600 * 24) / 3600);
    const minutes = Math.floor((seconds - (day * 3600 * 24 + hours * 3600)) / 60);
    const args = [day.toString(), hours.toString(), minutes.toString()];
    return chrome.i18n.getMessage("remain_time", args);
}

export function createDateString(seconds: number | null | undefined): string {
    if (seconds === MaxTimestamp || seconds === undefined || seconds === null) return "----/--/--";
    const date = new Date(seconds * 1000);
    return date.toLocaleDateString() + " " + date.getHours() + ":" + ("00" + date.getMinutes()).slice(-2);
}

export { getDaysUntil, formatTimestamp, isLoggedIn, miniSakaiReady };
