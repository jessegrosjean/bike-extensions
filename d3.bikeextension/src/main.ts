import { AppExtensionContext, Window } from "bike";
import { DOMScriptName } from "domScript";
import { Sidebar, SidebarItem } from "sidebar";
import { Row } from "outline";

export async function activate(context: AppExtensionContext) {
    bike.commands.addCommands({
        source: "d3",
        commands: {
            "d3:show-tree-view": showTreeView,
            "d3:show-radial-view": showRadialView,
        }
    });
    
    bike.observeWindows(async (window: Window) => {
        window.sidebar.addItem(treeViewItem(window.sidebar));
        window.sidebar.addItem(radialViewItem(window.sidebar));
    });
}

function treeViewItem(sidebar: Sidebar): SidebarItem {
    return {
        id: "d3:tree-view",
        text: "Tree View",
        symbol: "tree",
        ordering: { section: "actions" },
        action: "d3:show-tree-view",
    };
}

function radialViewItem(sidebar: Sidebar): SidebarItem {
    return {
        id: "d3:radial-view",
        text: "Radial View",
        symbol: "tree.circle",
        ordering: { section: "actions" },
        action: "d3:show-radial-view",
    };
}

function showTreeView(): boolean {
    return showD3Sheet("tree-view.ts");
}

function showRadialView(): boolean {
    return showD3Sheet("radial-view.ts");
}

function showD3Sheet(domScriptName: DOMScriptName): boolean {
    let window = bike.frontmostWindow;
    if (window) {
        window.presentSheet(domScriptName).then((handle) => {
            let editor = window.currentOutlineEditor;
            if (editor) {
                let d3Hierarchy = buildD3Hiearchy(editor.focus)
                let d3HierarchyJSON = JSON.stringify(d3Hierarchy)
                handle.postMessage(d3HierarchyJSON);
            }
            handle.onmessage = (message) => {
                console.log(message);
            }
        });
    }
    return true
}

function buildD3Hiearchy(row: Row): any {
    let hierarchy = {
        id: row.id,
        name: trimString(row.text.string, 32),
        children: new Array(),
    };
    
    for (let child of row.children) {
        // Skip empty leaves
        if (child.firstChild || child.text.string.length > 0) {
            hierarchy.children.push(buildD3Hiearchy(child));
        }
    }
    
    return hierarchy;
}

function trimString(string: string, maxLength: number): string {
    if (string.length <= maxLength) {
        return string;
    }
    return string.slice(0, maxLength - 1) + '…';
}