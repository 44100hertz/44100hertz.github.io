export function split_fields (linestr) {
    let [, contents, comment] = linestr.match(/([^;]*);?(.*)/);
    let [, label, code] = contents.match(/^(\s*\w*:|\w*)(.*)/);
    label = label.replace(':', '');
    return {label: label.trim(), code: code.trimStart(), label_and_code: contents.trim(), comment};
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
    const {label, label_and_code} = split_fields(linestr);
    const label_len = label.length + 1; // for colon
    const contents_len = label_and_code.length + 1; // for colon and semicolon

    if (column < label_len) {
        return {field: 0, offset: column};
    } else if (column < contents_len) {
        return {field: 1, offset: column - label_len};
    } else {
        return {field: 2, offset: column - contents_len};
    }
}

// Given a assembly line, return the column offset of a specific field
export function field_offset (linestr, field) {
    const {label, label_and_code} = split_fields(linestr);
    switch (field) {
        case 0: return 0;
        case 1: return label.length+1;
        case 2: return label_and_code.length+1;
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
