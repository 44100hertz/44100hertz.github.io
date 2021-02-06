import React, {useRef, useState, useEffect} from 'react'

import {compile} from '../assembler/assemble.js'
import Emulator from '../hz16/Emulator.js'
import {SCREEN_WIDTH, SCREEN_HEIGHT} from '../hz16/constants.js'

function EmulatorPanel ({code}) {
    const canvas = useRef()
    const [binary, setBinary] = useState()

    useEffect(() => {
        if (binary && canvas.current) {
            const emulator = new Emulator(binary, canvas.current.getContext('2d'))
            emulator.frame()
            return () => {
                emulator.break = true
            }
        }
    }, [canvas, binary])

    return (
        <div id="emulator" tabIndex="1">
          <canvas ref={canvas} id="screen" width={SCREEN_WIDTH} height={SCREEN_HEIGHT} />
          <div id="emu-buttons">
            <button className="emu-button" id="run-button" onClick={() => setBinary(compile(code))}>Run</button>
            <button className="emu-button" id="stop-button" onClick={() => setBinary(null)}>Stop</button>
          </div>
        </div>
    )
}

export default EmulatorPanel
