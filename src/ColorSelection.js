import React from 'react';
import './color.css'

const ColorSelection = ({ onSelect }) => {
    return (
        <div className="color-selection">
            <h2>진영을 고르시오.</h2>
            <div id='colorSelectionBox'>
                <div className='selectionColorBtn' id='black_selection' onClick={() => {
                    onSelect('black')
                }}></div>

                <div className='selectionColorBtn' id='white_selection' onClick={() => {
                    onSelect('white')
                }}></div>
            </div>
            
            <div id='decoColor'>
                <img src='./image/black_ani.png' id='blackAni' style={{float : 'left'}}/>
                <img src='./image/white_ani.png' id='whiteAni' style={{float :'right'}}/>
            </div>
        </div>
    );
};

export default ColorSelection;
