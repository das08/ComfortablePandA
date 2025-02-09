import React, { useMemo, useState } from "react";
import { Assignment, AssignmentEntry } from "../features/entity/assignment/types";
import { Course } from "../features/course/types";
import { Memo, MemoEntry } from "../features/entity/memo/types";
import { Quiz, QuizEntry } from "../features/entity/quiz/types";
import { getDaysUntil } from "../utils";
import AssignmentEntryView from "./assignment";
import { useTranslation, useTranslationArgsDeps, useTranslationDeps } from "./helper";
import MemoEntryView from "./memo";
import QuizEntryView from "./quiz";
import { CurrentTime, MaxTimestamp } from "../constant";
import { getSakaiCourses } from "../features/course/getCourse";
import { Settings } from "../features/setting/types";

// Every type in EntityUnion must implement IEntity
export type EntityUnion = Assignment | Quiz | Memo;
// Every type in EntryUnion must implement IEntry
export type EntryUnion = AssignmentEntry | QuizEntry | MemoEntry; // TODO: add Quiz, Memo, ...

export type DueType = "checked" | "danger" | "warning" | "success" | "other";

function MiniSakaiCourse(props: {
    courseID: string;
    coursePage: string;
    courseName: string;
    entries: EntryUnion[];
    dueType: DueType;
    isSubset: boolean;
    onCheck: (entry: EntryUnion, checked: boolean) => void;
    onDelete: (entry: EntryUnion) => void;
}) {
    const divClass = useMemo(() => `cs-assignment-${props.dueType}`, [props.dueType]);
    const aClass = useMemo(() => `cs-course-${props.dueType} cs-course-name`, [props.dueType]);

    const elements = useMemo(() => {
        const elems: JSX.Element[] = [];
        for (const entry of props.entries) {
            if (entry instanceof AssignmentEntry) {
                elems.push(
                    <AssignmentEntryView
                        key={entry.getID()}
                        isSubset={props.isSubset}
                        assignment={entry}
                        onCheck={(checked) => props.onCheck(entry, checked)}
                    />
                );
            } else if (entry instanceof QuizEntry) {
                elems.push(
                    <QuizEntryView
                        key={entry.getID()}
                        isSubset={props.isSubset}
                        quiz={entry}
                        onCheck={(checked) => props.onCheck(entry, checked)}
                    />
                );
            } else if (entry instanceof MemoEntry) {
                elems.push(
                    <MemoEntryView
                        key={entry.getID()}
                        isSubset={props.isSubset}
                        memo={entry}
                        onCheck={(checked) => props.onCheck(entry, checked)}
                        onDelete={() => props.onDelete(entry)}
                    />
                );
            }
        }
        return elems;
    }, [props]);

    return (
        // TODO: style
        <div className={divClass}>
            {/* TODO: subset a tag */}
            {props.isSubset ? (
                <button className={`${aClass} course-button`} onClick={() => {
                    chrome.tabs.create({
                        url: props.coursePage,
                        active: true
                    })
                }}>{props.courseName}</button>
            ) : (
                <a className={aClass} href={props.coursePage}>
                    {props.courseName}
                </a>
            )}

            {elements}
        </div>
    );
}

export type MemoAddInfo = { course: Course; content: string; due: number };

export function EntryTab(props: {
    isSubset: boolean;
    showMemoBox: boolean;
    entities: EntityUnion[];
    settings: Settings;
    onCheck: (entry: EntryUnion, checked: boolean) => void;
    onDelete: (entry: EntryUnion) => void;
    onMemoAdd: (memo: MemoAddInfo) => void;
}) {
    type EntryWithCourse = {
        entry: EntryUnion;
        course: Course;
    };

    const checkedElements: EntryWithCourse[] = [];
    const dangerElements: EntryWithCourse[] = [];
    const warningElements: EntryWithCourse[] = [];
    const successElements: EntryWithCourse[] = [];
    const otherElements: EntryWithCourse[] = [];

    for (const entity of props.entities) {
        const course = entity.getCourse();
        for (const entry of entity.entries) {
            const hasfinished = entry.hasFinished;
            if (hasfinished){
                checkedElements.push({
                    entry: entry,
                    course: course
                });
                continue;
            }
            const daysUntilDue = getDaysUntil(props.settings, CurrentTime, entry.getDueDate(props.settings.miniSakaiOption.showLateAcceptedEntry));

            switch (daysUntilDue) {
                //case "due24h":
                case "dueVerySoon":
                    dangerElements.push({
                        entry: entry,
                        course: course
                    });
                    break;
                //case "due5d":
                case "dueSoon":
                    warningElements.push({
                        entry: entry,
                        course: course
                    });
                    break;
                //case "due14d":
                case "dueMiddle":
                    successElements.push({
                        entry: entry,
                        course: course
                    });
                    break;
                //case "dueOver14d":
                case "dueLater":
                    otherElements.push({
                        entry: entry,
                        course: course
                    });
                    break;
            }
        }
    }

    return (
        <>
            {props.isSubset ? null : (
                <AddMemoBox
                    shown={!props.isSubset && props.showMemoBox}
                    courses={getSakaiCourses()}
                    onMemoAdd={props.onMemoAdd}
                />
            )}

            {dangerElements.length === 0 ? null : (
                <>
                    <MiniSakaiEntryHeader dueType="danger" settings={props.settings} />
                    <MiniSakaiEntryList
                        dueType="danger"
                        isSubset={props.isSubset}
                        settings={props.settings}
                        entriesWithCourse={dangerElements}
                        onCheck={props.onCheck}
                        onDelete={props.onDelete}
                    />
                </>
            )}
            {warningElements.length === 0 ? null : (
                <>
                    <MiniSakaiEntryHeader dueType="warning" settings={props.settings} />
                    <MiniSakaiEntryList
                        dueType="warning"
                        isSubset={props.isSubset}
                        settings={props.settings}
                        entriesWithCourse={warningElements}
                        onCheck={props.onCheck}
                        onDelete={props.onDelete}
                    />
                </>
            )}
            {successElements.length === 0 ? null : (
                <>
                    <MiniSakaiEntryHeader dueType="success" settings={props.settings} />
                    <MiniSakaiEntryList
                        dueType="success"
                        isSubset={props.isSubset}
                        settings={props.settings}
                        entriesWithCourse={successElements}
                        onCheck={props.onCheck}
                        onDelete={props.onDelete}
                    />
                </>
            )}
            {otherElements.length === 0 ? null : (
                <>
                    <MiniSakaiEntryHeader dueType="other" settings={props.settings} />
                    <MiniSakaiEntryList
                        dueType="other"
                        isSubset={props.isSubset}
                        settings={props.settings}
                        entriesWithCourse={otherElements}
                        onCheck={props.onCheck}
                        onDelete={props.onDelete}
                    />
                </>
            )}
            {checkedElements.length === 0 ? null : (
                <>
                    <MiniSakaiEntryHeader dueType="checked" settings={props.settings} />
                    <MiniSakaiEntryList
                        dueType="checked"
                        isSubset={props.isSubset}
                        settings={props.settings}
                        entriesWithCourse={checkedElements}
                        onCheck={props.onCheck}
                        onDelete={props.onDelete}
                    />
                </>
            )}
        </>
    );
}

function AddMemoBox(props: { shown: boolean; courses: Course[]; onMemoAdd: (memo: MemoAddInfo) => void }) {
    const defaultDueDate = (): string => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return d.toISOString().substr(0, 16);
    };

    const courseName = useTranslation("todo_box_course_name");
    const memoLabel = useTranslation("todo_box_memo");
    const dueDate = useTranslation("todo_box_due_date");
    const addBtnLabel = useTranslation("todo_box_add");

    const [selectedCourseID, setSelectedCourseID] = useState(props.courses[0].id ?? "");
    const [todoContent, setTodoContent] = useState("");
    const [todoDue, setTodoDue] = useState(defaultDueDate);

    const options = useMemo(() => {
        return props.courses.map((course) => {
            return (
                <option value={course.id} key={`memo-option-${course.id}`}>
                    {course.name}
                </option>
            );
        });
    }, [props.courses]);

    if (!props.shown) {
        return <div></div>;
    }

    return (
        <div className='cs-memo-box addMemoBox'>
            <div className='cs-memo-item'>
                <p>{courseName}</p>
                <label>
                    <select
                        className='todoLecName'
                        value={selectedCourseID}
                        onChange={(ev) => setSelectedCourseID(ev.target.value)}
                    >
                        {options}
                    </select>
                </label>
            </div>
            <div className='cs-memo-item'>
                <p>{memoLabel}</p>
                <label>
                    <input
                        type='text'
                        className='todoContent'
                        value={todoContent}
                        onChange={(ev) => setTodoContent(ev.target.value)}
                    />
                </label>
            </div>
            <div className='cs-memo-item'>
                <p>{dueDate}</p>
                <label>
                    <input
                        type='datetime-local'
                        className='todoDue'
                        value={todoDue}
                        onChange={(ev) => setTodoDue(ev.target.value)}
                    />
                </label>
            </div>
            <div className='cs-memo-item'>
                <button
                    type='submit'
                    id='todo-add'
                    onClick={() => {
                        if (selectedCourseID === "" || todoDue === "") return;

                        let selectedCourse: Course | undefined = undefined;
                        for (const course of props.courses) {
                            if (course.id === selectedCourseID) {
                                selectedCourse = course;
                                break;
                            }
                        }
                        if (selectedCourse === undefined) return;

                        props.onMemoAdd({
                            course: selectedCourse,
                            content: todoContent,
                            due: Date.parse(todoDue) / 1000
                        });
                    }}
                    disabled={selectedCourseID === "" || todoDue === ""}
                >
                    {addBtnLabel}
                </button>
            </div>
        </div>
    );
}

function MiniSakaiEntryHeader(props: { dueType: DueType, settings: Settings }) {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const dueTypeTitleMap: { [key in DueType]: string } = {
        checked: useTranslation("checked"),
        danger: useTranslationArgsDeps("dueVerySoon", [props.settings.timeUntilDeadline.dangerHours.toString()], []),
        warning: useTranslationArgsDeps("dueSoon", [props.settings.timeUntilDeadline.warningDays.toString()], []),
        success: useTranslationArgsDeps("dueMiddle", [props.settings.timeUntilDeadline.middleDays.toString()], []),
        other: useTranslationArgsDeps("dueLater", [props.settings.timeUntilDeadline.middleDays.toString()], []),
    };
    const className = useMemo(() => {
        return `cs-minisakai-${props.dueType}`;
    }, [props.dueType]);
    const headerTitle = useMemo(() => {
        return dueTypeTitleMap[props.dueType];
    }, [dueTypeTitleMap, props.dueType]);

    return (
        <div className={className}>
            <span className="cs-minisakai-entry-header">{headerTitle}</span>
        </div>
    );
}

function MiniSakaiEntryList(props: {
    dueType: DueType;
    entriesWithCourse: {
        entry: EntryUnion;
        course: Course;
    }[];
    settings: Settings;
    isSubset: boolean;
    onCheck: (entry: EntryUnion, checked: boolean) => void;
    onDelete: (entry: EntryUnion) => void;
}) {
    const className = useMemo(() => {
        const baseClass = "cs-minisakai-list";
        const clazz = `cs-minisakai-list-${props.dueType}`;
        return `${baseClass} ${clazz}`;
    }, [props.dueType]);

    // console.log("course", props.entriesWithCourse)

    // group entries by course
    let courseIdMap = new Map<string, EntryUnion[]>(); // map courseID -> EntryUnions
    const courseNameMap = new Map<string, string>(); // map courseID -> courseName
    for (const ewc of props.entriesWithCourse) {
        let entries: EntryUnion[];
        const courseID = ewc.course.id;
        if (!courseIdMap.has(courseID)) {
            entries = [];
            courseIdMap.set(courseID, entries);
        } else {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            entries = courseIdMap.get(courseID)!;
        }
        entries.push(ewc.entry);
        courseNameMap.set(courseID, ewc.course.name ?? "unknown course");
    }

    courseIdMap = new Map([...courseIdMap.entries()].sort(sortCourseIdMap(props.settings)));

    const courses: JSX.Element[] = [];
    for (const [courseID, entries] of courseIdMap.entries()) {
        const courseName = courseNameMap.get(courseID) ?? "<unknown>";
        courses.push(
            <MiniSakaiCourse
                key={courseID}
                courseID={courseID}
                courseName={courseName}
                coursePage={"https://" + props.settings.appInfo.hostname + "/portal/site/" + courseID}
                isSubset={props.isSubset}
                dueType={props.dueType}
                entries={entries.sort(sortEntries)}
                onCheck={(entry, checked) => props.onCheck(entry, checked)}
                onDelete={(entry) => props.onDelete(entry)}
            />
        );
    }

    return <div className={className}>{courses}</div>;
}

const sortCourseIdMap = (settings: Settings) => {
    return function (a: [string, EntryUnion[]], b: [string, EntryUnion[]]): number {
        const showLate = settings.miniSakaiOption.showLateAcceptedEntry;
        const aMin = a[1].reduce((prev, e) => Math.min(e.getDueDate(showLate), prev), MaxTimestamp);
        const bMin = b[1].reduce((prev, e) => Math.min(e.getDueDate(showLate), prev), MaxTimestamp);
        return aMin - bMin;
    };
};

const sortEntries = (a: EntryUnion, b: EntryUnion): number => {
    if (a.dueTime === b.dueTime) {
        if (a.title > b.title) return 1;
        else return -1;
    }
    return a.dueTime - b.dueTime;
};
