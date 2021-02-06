//
// 16-bit architecture
// Be careful when adjusting these constants.
// Existing programs can break easily.
// I made these values adjustable constants for testing purposes.
// There are many calculated values and sanity checks.
// I do not indicate whether values are configurable or hard calculated.
// That requires an understanding of their usage.
// Just because an error is not triggered, does not mean the program will work.
//

//
// Video configuration
//
export const FRAME_RATE = 60.0;
export const SCREEN_WIDTH = 480;
export const SCREEN_HEIGHT = 240;
export const SCAN_WIDTH = 480; // Used for timing
export const SCAN_HEIGHT = 240;
export const SCREEN_AREA = SCREEN_WIDTH * SCREEN_HEIGHT;
export const SCAN_AREA = SCAN_WIDTH * SCAN_HEIGHT;
if (SCAN_WIDTH < SCREEN_WIDTH || SCAN_HEIGHT < SCREEN_HEIGHT)
    throw new Error('Scan dimensions must equal or exceed screen.');

//
// CPU configuration
//
export const CPU_CYCLES_PER_PIXEL = 1;
export const CPU_CLOCK_RATE_LIMIT = 40;
export const CPU_CYCLES_PER_LINE = SCAN_WIDTH * FRAME_RATE * CPU_CYCLES_PER_PIXEL;
export const CPU_CLOCK_RATE = SCAN_AREA * FRAME_RATE * CPU_CYCLES_PER_PIXEL;
export const CPU_CLOCK_RATE_MHZ = CPU_CLOCK_RATE / 1024 / 1024;

export const ADDRESS_BIT_WIDTH = 16;
export const ADDRESS_SIZE = 1 << ADDRESS_BIT_WIDTH;
export const ADDRESS_MASK = ADDRESS_SIZE - 1;
// Determines general use RAM.
export const RAM_ADDRESS = 0x0000;
export const RAM_SIZE = 0x10000;
export const RAM_ADDRESS_END = RAM_ADDRESS + RAM_SIZE;
// Determines where the ROM is loaded.
export const PROGRAM_ADDRESS = 0x8000;
export const PROGRAM_SIZE = 0x8000;
export const PROGRAM_ADDRESS_END = PROGRAM_ADDRESS + PROGRAM_SIZE;

// !! Sanity Checks !! //
if (CPU_CLOCK_RATE_MHZ > CPU_CLOCK_RATE_LIMIT)
    throw new Error(`Attempt to configure CPU at ${CPU_CLOCK_RATE_MHZ}MHz.
This exceeds the limit of ${CPU_CLOCK_RATE_LIMIT}MHz.
If you would like to surpass the limit, change the constant.
Otherwise, reduce the scan area or cycles per pixel.`);
if (RAM_ADDRESS_END > ADDRESS_SIZE)
    throw new Error(`RAM end ${RAM_ADDRESS_END} exceeds address size ${ADDRESS_SIZE}`);
if (PROGRAM_ADDRESS_END > ADDRESS_SIZE)
    throw new Error(`Program end ${PROGRAM_ADDRESS_END} exceeds address size ${ADDRESS_SIZE}`);

//
// PPU configuration
//
export const PPU_ADDRESS = 0x0000;
export const TILE_WIDTH = 8;
export const TILE_HEIGHT = 8;
export const TILE_AREA = TILE_WIDTH * TILE_HEIGHT;
export const BITS_PER_PIXEL = 1;
export const TILE_SIZE = TILE_AREA * BITS_PER_PIXEL / 8;

export const TILESET_ADDRESS = 0x0000;
export const TILESET_ENTRIES = 256;
export const TILESET_SIZE = TILE_SIZE * TILESET_ENTRIES;
export const TILESET_END = TILESET_ADDRESS + TILESET_SIZE;

export const TILEMAP_ADDRESS = 0x1000;
if (TILESET_END > TILEMAP_ADDRESS)
    throw new Error('Tileset and Tilemap overlapping memory.');
export const TILEMAP_ENTRY_SIZE = 2;
// Multiply width or height by 2 to enable scrolling
export const TILEMAP_WIDTH = Math.ceil(SCREEN_WIDTH / TILE_WIDTH);
export const TILEMAP_HEIGHT = Math.ceil(SCREEN_HEIGHT / TILE_HEIGHT);
export const TILEMAP_SIZE = TILEMAP_WIDTH * TILEMAP_HEIGHT * TILEMAP_ENTRY_SIZE;
export const TILEMAP_END = TILEMAP_ADDRESS + TILEMAP_SIZE;

console.log(`Fantasy console configured:
Address space size: ${ADDRESS_SIZE}
RAM Size: ${RAM_SIZE}
Program Address: ${PROGRAM_ADDRESS}
Screen size: ${SCREEN_WIDTH}x${SCREEN_HEIGHT}
CPU clock speed: ${CPU_CLOCK_RATE_MHZ}MHz
`);
