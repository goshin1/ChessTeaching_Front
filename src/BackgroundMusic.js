import React, { useState } from 'react';
import ReactHowler from 'react-howler';

const BackgroundMusic = () => {
  const [isPlaying, setIsPlaying] = useState(true);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div>
      {/* react-howler로 배경음악 재생 */}
      <ReactHowler
        src="/music/once-upon-a-time-179341.mp3"
        playing={isPlaying}
        loop={true}
        volume={0.5} // 볼륨 설정
      />
      <button onClick={togglePlayPause} id='musicBtn'>
        {isPlaying ? '음악 끄기' : '음악 켜기'}
      </button>
    </div>
  );
};

export default BackgroundMusic;
