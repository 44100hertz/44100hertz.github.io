import * as lex from './lex.js';

const parse_split = [
    ['Code',
     ' code a b',
     {code: 'code a b'}],
    ['Label',
     'label:',
     {label: 'label'}],
    ['Label No Colon',
     'label',
     {label: 'label'}],
    ['Comment',
     ';comment',
     {comment: 'comment'}],
    ['Label + Code + Comment',
     'label: code a b;comment',
     {label: 'label', code: 'code a b', comment: 'comment'}],
    ['Label No Colon + Code + Comment',
     'label code a b;comment',
     {label: 'label', code: 'code a b', comment: 'comment'}],
    ['Whitespace',
     '    label:     code a b     ;    comment    ',
     {label: 'label', code: 'code a b     ', comment: '    comment    '}],
    ['Extra colons and semicolons',
     'label:: code a b;;comment',
     {label: 'label', code: ': code a b', comment: ';comment'}],
    ['Zero-width label',
     ':code;comment',
     {label: '', code: 'code', comment: 'comment'}],
    ['Comment colon',
     'label: code a b;:comment',
     {label: 'label', code: 'code a b', comment: ':comment'}],
];

for (const [name, input, output] of parse_split) {
    it('Parse Fields -- ' + name, () => {
        expect(lex.split_fields(input)).toMatchObject(output);
    });
}

const column_field_offset = [
    ['Zero',
     'label:code', 0, 0, 0],
    ['Empty label',
     ':', 1, 1, 0],
    ['End of label',
     'label:code', 5, 0, 5],
    ['Start of code',
     'label:code', 6, 1, 0],
    ['End of code',
     'label:code', 10, 1, 4],
    ['No label End of Code',
     ':code;comment', 5, 1, 4],
    ['Start of comment',
     'label:code;comment', 11, 2, 0],
    ['End of comment',
     'label:code;comment', 18, 2, 7],
    ['Whitespace after code',
     'code    ;comment', 8, 1, 8],
    ['Comment after whitespace',
     'code    ;comment', 9, 2, 0],
];

for (const [name, linestr, column, field, offset] of column_field_offset) {
    it('Column to Field Offset -- ' + name, () => {
        expect(lex.column_to_field_offset(linestr, column)).toMatchObject({field, offset});
    });
    it('Field Offset to Column -- ' + name, () => {
        expect(lex.field_offset_to_column(linestr, field, offset)).toEqual(column);
    });
}
