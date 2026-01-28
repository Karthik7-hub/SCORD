import React from 'react';

export default function BallStrip({ history }) {
    const recent = history.slice(-8);
    return (
        <div className="ball-strip">
            {recent.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No balls bowled</span>}
            {recent.map(b => {
                let css = 'ball';
                let txt = b.val;
                if (b.val === 4) css += ' four';
                if (b.val === 6) css += ' six';
                if (b.isWicket) { css += ' out'; txt = 'W'; }
                if (b.type === 'WD') { css += ' wd'; txt = 'wd'; }
                if (b.type === 'NB') { css += ' nb'; txt = 'nb'; }
                return <div key={b.id} className={css}>{txt}</div>
            })}
        </div>
    );
}