export function parse_fields (line) {
    const [, contents, comment] = line.match(/([^;]*);?(.*)/);
    const [, label, code] = contents.match(/^(\w+|):?\s*(.*)/);
    return {label, code, label_and_code: contents, comment};
}

// return which field cursor is in, and offset within that field
// fields = output of parse_fields on particular line
export function field_pos (cursor_x, line) {
    const {label, code, comment, label_and_code} = parse_fields(line);
    if (cursor_x <= label.length) {
        return {field: 0, field_text: label, offset: cursor_x};
    } else if (cursor_x <= label_and_code.length) {
        return {field: 1, field_text: code, offset: cursor_x - label.length - 1};
    } else {
        return {field: 2, field_text: comment, offset: cursor_x - label_and_code.length};
    }
}

export function get_field_offset (line, index) {
    const {label, label_and_code} = parse_fields(line);
    switch (index) {
        case 0: return 0;
        case 1: return label.length+1;
        case 2: return label_and_code.length+1;
    }
}
