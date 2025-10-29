import { saveHostName } from "./features/storage";
import { createMiniSakai, createMiniSakaiBtn } from "./minisakai";
import { isLoggedIn, miniSakaiReady } from "./utils";
import submitDetect from "./features/submitDetect";
// Example in a content script file (e.g., content.ts or part of your main extension logic)
import { injectPdfThumbnails, injectThumbnailsToOngoingAssignment } from './thumbnails';

async function main() {
    if (isLoggedIn()) {
        createMiniSakaiBtn();
        const hostname = window.location.hostname;
        createMiniSakai(hostname);

        miniSakaiReady();
        await saveHostName(hostname);
        submitDetect(hostname);
        injectPdfThumbnails();
        injectThumbnailsToOngoingAssignment();
    }
}

main();
