import {
    SCREEN_WIDTH,
    SCREEN_HEIGHT,
    SCREEN_AREA,
    TILE_SIZE,
    TILESET_ADDRESS,
    TILESET_SIZE,
    TILESET_END,
    TILEMAP_ADDRESS,
    TILEMAP_WIDTH,
    TILEMAP_SIZE,
    TILEMAP_END,
    PALETTE_ADDRESS,
    PALETTE_SIZE,
    PALETTE_END,
} from './constants.js'

import console_font from './console-rom/consolefont.png'

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
        // Set alpha pixel to 255
        for (let i=0;i<SCREEN_AREA;++i) this.rgba_buffer.data[i*4+3] = 255

        // Create tileset from console font
        const img = new Image()
        img.src = console_font
        img.onload = () => this.tileset = PPU.image_to_2bpp(img)

        this.tilemap = new Uint16Array(TILEMAP_SIZE)

        const palette = [
            0,0,30,0,
            88,61,90,0,
            169,143,150,0,
            255,241,214,0
        ]
        this.palette = new Uint8Array(palette)
    }

    get loaded () {
        return this.tileset
    }

    static image_to_rgba (image) {
        const canvas = document.createElement('canvas')
        canvas.width = image.width
        canvas.height = image.height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(image, 0, 0)
        return ctx.getImageData(0, 0, image.width, image.height)
    }

    static image_to_2bpp (image) {
        const rgba = PPU.image_to_rgba(image)
        const rgba_size = rgba.width * rgba.height
        const out = new Uint16Array(TILESET_SIZE)

        const lightness = (i) => (rgba.data[i*4] + rgba.data[i*4+1] + rgba.data[i*4+2]) / 256 / 3

        for (let pos = 0, tpos = 0;
             pos*4 < rgba_size && pos < out.length;
             ++tpos)
        {
            const tx = (tpos * 8) % image.width
            const ty = Math.floor(tpos * 8 / image.width) * 8
            for (let y=0; y<8; ++y, ++pos) {
                for (let x=0; x<8; ++x) {
                    const pixel = lightness(image.width * (y + ty) + x + tx)
                    out[pos] |= Math.floor(pixel*4) << (x*2)
                }
            }
        }

        return out
    }

    write (offset, word) {
        if (!this.loaded) return

        if (offset >= TILESET_ADDRESS && offset < TILESET_END) {
            offset -= TILESET_ADDRESS
            this.tileset[offset] = word
        } else if (offset >= TILEMAP_ADDRESS && offset < TILEMAP_END) {
            offset -= TILEMAP_ADDRESS
            this.tilemap[offset] = word
        } else if (offset >= PALETTE_ADDRESS && offset < PALETTE_END) {
            offset -= PALETTE_ADDRESS
            this.palette[offset] = word // Cuts off top 8 bits
        } else {
            throw new Error(`Bad GPU write: ${offset}`)
        }
    }

    render () {
        if (!this.loaded) return

        for (let y=0; y<SCREEN_HEIGHT; ++y) {
            for (let x=0; x<SCREEN_WIDTH; ++x) {
                // Get tile pixel
                const [tx, ty] = [Math.floor(x/8), Math.floor(y/8)]
                const [itx, ity] = [x%8, y%8]
                const tile = this.tilemap[ty * TILEMAP_WIDTH + tx]
                const pixel = (this.tileset[tile*TILE_SIZE + ity] >> (itx*2)) & 3
                // Write to screen pixel
                const ppos = y * SCREEN_WIDTH + x;
                for (let c=0;c<3;++c) {
                    this.rgba_buffer.data[ppos*4+c] = this.palette[pixel*4 + c]
                }
            }
        }

        this.canvas.putImageData(this.rgba_buffer, 0, 0)
    }
}
