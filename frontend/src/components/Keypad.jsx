import React from 'react';
import { RotateCcw } from 'lucide-react';

export default function Keypad({ onInput, onUndo }) {
    return (
        <div className="keypad">
            {[0, 1, 2, 3].map(n => <button key={n} className="key" onClick={() => onInput(n)}>{n}</button>)}
            <button className="key" style={{ color: 'var(--accent-run)' }} onClick={() => onInput(4)}>4</button>
            <button className="key" style={{ color: 'var(--primary)' }} onClick={() => onInput(6)}>6</button>
            <button className="key" onClick={() => onInput(0, 'WD')}>wd</button>
            <button className="key" onClick={() => onInput(0, 'NB')}>nb</button>
            <button className="key key-wkt" onClick={() => onInput(0, 'LEGAL', true)}>OUT</button>
            <button className="key key-undo" onClick={onUndo} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                <RotateCcw size={16} /> Undo
            </button>
        </div>
    );
}