import React, {useRef, useState, useEffect} from 'react';

import {compile} from './compile.js';
import Emulator from './Emulator';

function EmulatorPanel ({code}) {
    const canvas = useRef();
    const [binary, setBinary] = useState();

    function compile_and_run () {
        setBinary(compile(code));
    }

    useEffect(() => {
        if (binary && canvas.current) {
            const emulator = new Emulator(binary, 0, canvas.current.getContext('2d'));
            emulator.frame();
            return {
                if (emulator) {
                    emulator.break = true;
                }
            }
        }
    }, [canvas, binary]);

    return (
        <div id="emulator" tabIndex="1">
          <canvas ref={canvas} id="screen" width="60" height="60" />
          <button id="runbutton" onClick={compile_and_run}>▶</button>
        </div>
    );
}

export default EmulatorPanel;
