// Take a line of code and split it at : and ; if they exist.
export function split_fields (linestr, params = {}) {
    const match1 = linestr.match(/^([^;]*);(.*)$/);
    const [contents, comment] = match1 ? match1.slice(1) : [linestr, ''];
    const match2 = contents.match(/^([^:]*):(.*)$/);
    const [label, code] = match2 ? match2.slice(1) : ['', contents];
    if (params.trim) {
        return {label: label.trim(), code: code.trim(), comment};
    } else {
        return {label, code, comment};
    }
}

// Take a field,offset and convert it into an x position or column
export function extract_field (linestr, field, params = {}) {
    const {label, code, comment} = split_fields(linestr, params);
    return [label, code, comment][field];
}

// Take a field,offset and put it within bounds to avoid overflowing edits
export function clamp_field_offset (linestr, field, offset) {
    return Math.min(offset, extract_field(linestr, field).length);
}

// Take a line which may or may not have a colon and semicolon, and put them
// into the correct place. This makes it easier to process the line information.
export function cleanup_line (linestr, params) {
    const {label, code, comment} = split_fields(linestr, params);
    return `${label}:${code};${comment}`;
}

// Take a column/x position and convert it into field,offset
export function column_to_field_offset (linestr, column) {
    const {label, comment} = split_fields(linestr);
    const code_pos = label.length + 1; // for colon
    const comment_pos = linestr.length - comment.length; // for semicolon

    if (column < code_pos) {
        return {field: 0, offset: column};
    } else if (column < comment_pos) {
        return {field: 1, offset: column - code_pos};
    } else {
        return {field: 2, offset: column - comment_pos};
    }
}

// Return the column offset of a specific field
export function field_offset (linestr, field) {
    const {label, comment} = split_fields(linestr);
    switch (field) {
        case 0: return 0;
        case 1: return label.length+1; // For colon
        case 2: return linestr.length - comment.length;
        default: throw new Error('Unknown Column');
    }
}

// Take a field,offset and convert it into an x position or column
export function field_offset_to_column (linestr, field, offset) {
    return field_offset(linestr, field) + offset;
}
