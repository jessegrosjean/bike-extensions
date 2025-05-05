import { Outline, Row } from "outline";

export function getOrCreateCalendarRow(outline: Outline, date: Date): Row {
    let dateComponents = getDateComponents(date);
    let dateRow = outline.getRowById(dateComponents.dayId);

    if (dateRow) {
        return dateRow;
    }

    return outline.transaction({ animate: "default" }, () => {
        let calendarRow = getOrCreateRow("caledar", "Calendar", outline.root, outline);
        let yearRow = getOrCreateRow(dateComponents.yearId, dateComponents.yearName, calendarRow, outline);
        let monthRow = getOrCreateRow(dateComponents.monthId, dateComponents.monthName, yearRow, outline);
        let dayRow = getOrCreateRow(dateComponents.dayId, dateComponents.dayName, monthRow, outline);
        return dayRow;
    });    
}

function getOrCreateRow(id: string, text: string, parent: Row, outline: Outline): Row {
    let row = outline.getRowById(id);

    if (row) {
        return row;
    }

    let insertBefore: Row | undefined;
    let dateIdPattern = /\d{4}\/\d{2}\/\d{2}/;

    for (const child of parent.children) {
        if (child.id.match(dateIdPattern) && id < child.id) {
            insertBefore = child;
            break;
        }
    }

    return outline.insertRows([{
        id: id,
        text: text,
    }], parent, insertBefore)[0];
}

function getDateComponents(date: Date): {
    yearName: string;
    yearId: string;
    monthName: string;
    monthId: string;
    dayName: string;
    dayId: string;
    timeName: string;
} {
    const yearName = date.getFullYear().toString();
    const yearId = `${yearName}/00/00`;
    const monthName = date.toLocaleString('default', { month: 'long' }) + `, ${yearName}`;
    const monthId = `${yearName}/${String(date.getMonth() + 1).padStart(2, '0')}/00`;
    const dayName = date.toLocaleString('default', { month: 'long' }) + ` ${String(date.getDate()).padStart(2, '0')}, ${yearName}`;
    const dayId = `${yearName}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours === 0 ? 12 : hours;
    const timeName = `${hours}:${minutes} ${ampm}`;
    
    return { yearName, yearId, monthName, monthId, dayName, dayId, timeName };
}
