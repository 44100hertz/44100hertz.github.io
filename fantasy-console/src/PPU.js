import {
    SCREEN_WIDTH,
    SCREEN_HEIGHT,
    SCREEN_AREA,
} from './constants.js'

// TODO: THIS. NOT IMPLEMENTED YET.
// Tileset layout:
//   Unlike an NES, each bit pair is adjacent.
//   Each tile is 16 bytes continuous, each row is 2 bytes or 4 pixels per byte.
//   Tiles are laid out sequentially.
//   The number of tiles is equal to TILESET_ENTRIES
//
// Tilemap layout:
//   Each tilemap tile consists of 1 word (2 bytes).
//   Tilemap size is calculated in constants.js
//   The low byte is the index of the tile within the tileset.
//   The high byte is currently unused.

export default class PPU {
    constructor (canvas) {
        this.canvas = canvas
        this.rgba_buffer = canvas.createImageData(SCREEN_WIDTH, SCREEN_HEIGHT)
        for (let i=0;i<SCREEN_AREA;++i) this.rgba_buffer.data[i*4+3] = 255
        this.color = 0
        this.video_buffer = new Uint8Array(SCREEN_AREA).fill(0)
        this.prepare_next_screen()
    }

    prepare_next_screen () {
        this.offset = 0
    }

    step_pixel () {
        this.video_buffer[this.offset++] = this.color
    }

    step_line () {
        while (this.offset % SCREEN_WIDTH > 0) {
            this.step_pixel()
        }
    }

    write (offset, word) {
        this.color = word >> 8
    }

    render () {
        for (let i=0; i<SCREEN_AREA; ++i) {
            for (let c=0; c<3; ++c) {
                this.rgba_buffer.data[i*4+c] = this.video_buffer[i]
            }
        }

        this.canvas.putImageData(this.rgba_buffer, 0, 0)
        this.prepare_next_screen()
    }
}
