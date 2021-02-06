import * as lex from './lex.js'

it('Strict split clean string', () =>
    expect(lex.split_fields(' first part : second part ; third part ', {strict: true}))
              .toMatchObject({label: ' first part ',
                              code: ' second part ',
                              comment: ' third part '}))

it('Strict split comment colon', () =>
    expect(lex.split_fields('label:code;;comment:comment;', {strict: true}))
              .toMatchObject({label: 'label',
                              code: 'code',
                              comment: ';comment:comment;'}))

it('Strict split empty line', () =>
    expect(lex.split_fields(':;', {strict: true}))
              .toMatchObject({label: '',
                              code: '',
                              comment: ''}))

const cleanup_code = [
    ['Label',
     'label:',
     'label:;'
    ],
    ['Code',
     'code a b',
     ':code a b;',
    ],
    ['Comment',
     ';comment',
     ':;comment',
    ],
    ['Label + Code + Comment',
     'label: code a b;comment',
     'label:code a b;comment',
    ],
    ['Whitespace',
     '    label:     code a b     ;    comment    ',
     'label:code a b;    comment    ',
    ],
    ['Extra colons and semicolons',
     'label: : :code a b; ;comment',
     'label:: :code a b; ;comment',
     ],
    ['Comment colon',
     'label: code a b ;a:comment',
     'label:code a b;a:comment'],
]

for (const [name, input, output] of cleanup_code) {
    it('Cleanup line ' + name, () => {
        expect(lex.cleanup_line(input, {trim: true})).toEqual(output)
    })
}

const column_field_offset = [
    ['Zero',
     'label:code;', 0, 0, 0],
    ['Empty label',
     ':;', 1, 1, 0],
    ['Empty comment',
     ':;', 2, 2, 0],
    ['End of label',
     'label:code;', 5, 0, 5],
    ['Start of code',
     'label:code;', 6, 1, 0],
    ['End of code',
     'label:code;', 10, 1, 4],
    ['No label End of Code',
     ':code;comment', 5, 1, 4],
    ['Start of comment',
     'label:code;comment', 11, 2, 0],
    ['End of comment',
     'label:code;comment', 18, 2, 7],
    ['Whitespace after code',
     ':code    ;comment', 9, 1, 8],
    ['Comment after whitespace',
     ':code    ;comment', 10, 2, 0],
]

for (const [name, linestr, column, field, offset] of column_field_offset) {
    it('Column to Field Offset ' + name, () => {
        expect(lex.column_to_field_offset(linestr, column)).toMatchObject({field, offset})
    })
    it('Field Offset to Column ' + name, () => {
        expect(lex.field_offset_to_column(linestr, field, offset)).toEqual(column)
    })
}
