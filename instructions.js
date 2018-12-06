export const bytes = [
    [
        {},
        {name: 'and', args: ['dest', 'src', 'src']},
        {name: 'or', args:  ['dest', 'src', 'src']},
        {name: 'xor', args: ['dest', 'src', 'src']},
        // 0x4
        {name: 'add', args: ['dest', 'src', 'src']},
        {name: 'sub', args: ['dest', 'src', 'src']},
        {name: 'adc', args: ['dest', 'src', 'src']},
        {name: 'sbc', args: ['dest', 'src', 'src']},
        // 0x8
        {name: 'jeq', args: ['src', 'src', 'src']},
        {name: 'jne', args: ['src', 'src', 'src']},
        {name: 'jlt', args: ['src', 'src', 'src']},
        {name: 'jgt', args: ['src', 'src', 'src']},
        // 0xC
        {name: 'jls', args: ['src', 'src', 'src']},
        {name: 'jgs', args: ['src', 'src', 'src']},
        {name: '', args: []},
        {name: '', args: []},
    ],
    [
        {},
        {name: 'mov', args: ['dest', 'src']},
        {name: 'shr', args: ['dest', 'src']},
        {name: 'srs', args: ['dest', 'src']},
        // 0x4
        {name: 'ror', args: ['dest', 'src']},
        {name: 'shl', args: ['dest', 'src']},
        {name: 'rol', args: ['dest', 'src']},
        {name: 'squ', args: ['dest', 'src']},
        // 0x8
        {name: 'inc', args: ['dest', 'src']},
        {name: 'dec', args: ['dest', 'src']},
        {name: 'neg', args: ['dest', 'src']},
        {name: 'poke', args: ['src', 'src']},
        // 0xC
        {name: '', args: []},
        {name: '', args: []},
        {name: '', args: []},
        {name: '', args: []},
    ],
    [
        {},
        {name: 'push', args: ['src']},
        {name: 'pop', args: ['dest']},
        {name: 'call', args: ['src']},
        // 0x4
        {name: '', args: []},
        {name: '', args: []},
        {name: '', args: []},
        {name: '', args: []},
        // 0x8
        {name: 'jcc', args: ['dest']},
        {name: 'jcs', args: ['dest']},
        {name: '', args: []},
        {name: '', args: []},
        // 0xC
        {name: '', args: []},
        {name: '', args: []},
        {name: '', args: []},
        {name: '', args: []},
    ],
    [
        {},
        {name: 'nop', args: []},
        {name: 'clc', args: []},
        {name: 'sec', args: []},
        // 0x4
        {name: '', args: []},
        {name: '', args: []},
        {name: '', args: []},
        {name: '', args: []},
        // 0x8
        {name: '', args: []},
        {name: '', args: []},
        {name: '', args: []},
        {name: '', args: []},
        // 0xC
        {name: '', args: []},
        {name: 'brkline', args: []},
        {name: 'brkframe', args: []},
        {name: 'brk', args: []},
    ],
];

export const names = {};
for (let shelf of bytes) {
    for (let byte in shelf) {
        names[shelf[byte].name] = +byte;
    }
}
