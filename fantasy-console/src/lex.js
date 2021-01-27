export function split_fields (linestr) {
    let [, contents, comment] = linestr.match(/([^;]*);?(.*)/);
    let [, label, code] = contents.match(/^(\s*\w*:|\w*)(.*)/);
    label = label.replace(':', '').trim();
    code = code.trimStart();
    return {label, code, comment};
}

export function extract_field (linestr, field) {
    const {label, code, comment} = split_fields(linestr);
    return [label, code, comment][field];
}

export function cleanup_line (linestr) {
    const {label, code, comment} = split_fields(linestr);
    return (label + ':') + code + (';' + comment);
}

export function column_to_field_offset (linestr, column) {
    const {label, comment} = split_fields(linestr);
    const code_pos = label.length + 1; // for colon
    const comment_pos = linestr.length - comment.length; // for semicolon

    if (column < code_pos) {
        return {field: 0, offset: column};
    } else if (comment.length === 0 || column < comment_pos) {
        return {field: 1, offset: column - code_pos};
    } else {
        return {field: 2, offset: column - comment_pos};
    }
}

// Given a assembly line, return the column offset of a specific field
export function field_offset (linestr, field) {
    const {label, comment} = split_fields(linestr);
    switch (field) {
        case 0: return 1;
        case 1: return label.length+1;
        case 2: return linestr.length - comment.length;
        default: throw new Error('Unknown Column');
    }
}

export function field_offset_to_column (linestr, field, offset) {
    return field_offset(linestr, field) + offset;
}

// Take a field,offset and put it within bounds
export function clamp_field_offset (linestr, field, offset) {
    return Math.min(offset, extract_field(linestr, field).length);
}
