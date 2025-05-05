import { AppExtensionContext, Window } from "bike";
import { getOrCreateCalendarRow } from "./calendar";

export async function activate(context: AppExtensionContext) {
    bike.commands.addCommands({
        commands: {
            "calendar:today": todayCommand
        }
    });
    
    bike.observeWindows(async (window: Window) => {
        window.sidebar.addItem({
            id: "calendar:today",
            text: "Today",
            symbol: "calendar",
            ordering: { section: "actions" },
            action: "calendar:today",
        });
    });
}

function todayCommand(): boolean {
    let editor = bike.frontmostWindow?.outlineEditors[0];
    if (editor) {
        editor.outline.transaction({ animate: "default" }, () => {
            let outline = editor.outline;
            let todayRow = getOrCreateCalendarRow(outline, new Date());
            if (!todayRow.firstChild) { outline.insertRows([{}], todayRow) }
            editor.focus = todayRow;
            editor.selectCaret(todayRow.firstChild!, 0);
        });
    }
    return true;
}