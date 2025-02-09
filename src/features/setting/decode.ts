import { Settings } from "./types";

export const decodeSettings = (data: any): Settings => {
    const settings = new Settings();
    if (typeof data === "undefined") return settings;
    // If the data is not valid, return default settings
    settings.appInfo = data.appInfo ?? settings.appInfo;
    settings.fetchTime = data.fetchTime ?? settings.fetchTime;
    settings.cacheInterval = data.cacheInterval ?? settings.cacheInterval;
    settings.miniSakaiOption = data.miniSakaiOption ?? settings.miniSakaiOption;
    settings.timeUntilDeadline = data.timeUntilDeadline ?? settings.timeUntilDeadline;

    // For backward compatibility
    for (const colorName of Object.getOwnPropertyNames(settings.color)) {
        if (typeof data.color[colorName] !== "undefined") {
            // @ts-ignore
            settings.color[colorName] = data.color[colorName];
        }
    }
    return settings;
};
