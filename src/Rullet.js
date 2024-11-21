import './rullet.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
const sectors = ["실패", "조언", "실패", "수상한안개", "실패", "한눈팔기"];

export default function Rullet(props){
  const [rotation, setRotation] = useState(0);
  const [advice, setAdvice] = useState("");

  const spinWheel = () => {
    const randomIndex = Math.floor(Math.random() * sectors.length);
    const randomTurns = 3 + Math.floor(Math.random() * 2);  // 최소 3회전
    const angle = 360 * randomTurns + randomIndex * 60;  // 각 섹터가 60도 간격
    if(props.turnChance === 1) return;
    props.setTurnChance(1);
    setTimeout(() => {
      setRotation(0);
    }, 2000)
    setRotation(angle);

    // 2초 후에 결과 계산
    setTimeout(() => {
      props.setResult(sectors[randomIndex]);
      props.setThinking("block")
    }, 2000);  // 2초 후에 결과 표시
  };

    useEffect(() => {
    if(props.result === "조언"){
      setAdvice("잠시 기다려주시오.")
      if(props.fen !== ""){
        axios.post("/ask", {
            data : props.fen
        }).then((response) => {
            if(response.data.answer === "(none)"){
                setAdvice("내생각으로는 수를 생각할 수가 없군.")
            }else{
                setAdvice(response.data.answer+"을 추천하지.")
            }
        })
      }else{
        setAdvice("시작은 게임의 흐름. 첫수는 직접 해보시지요")
      }
    }else if(props.result === "수상한안개"){
        setAdvice("연구가 실패하여 안개가 가득찼습니다.")
    }else if(props.result === "한눈팔기"){
      setAdvice("이런, 한 눈 판 사이에 상대가 멋대로 진행했습니다.")
    }else if(props.result === "실패"){
      setAdvice("펑! 연구가 실패하였습니다.")
    }else{
      setAdvice("잠시 기다려주시오.")
    }
  }, [props.result])

  const sectors = ["실패", "조언", "실패", "수상한안개", "실패", "한눈팔기"];
  let thinkingImage = {
    '실패' : `/image/fail.png`,
    '조언' : `/image/thinking_alhemist.png`,
    '수상한안개' : `/image/pog.png`,
    '한눈팔기' : `/image/clumsy.png`
  };



  

  return (
    <div className="wheel-container">
      <div id='thinking' style={{display : props.thinking}}>
          <img src={thinkingImage[props.result]}/>
          <p>
            {advice}
          </p>
          <input type="button" id='thinkingBtn' value="닫기" onClick={() => {
            // props.setResult(null)
            props.setThinking('none')
          }}/>
      </div>

      <div
        className="wheel"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: 'transform 2s ease-out',
        }}
      >
        <div id='move'>
        {sectors.map((sector, index) => (
          <div
            key={index}
            className="sector"
            style={{
              transform: `rotate(${index * 60}deg)`, // 각 섹터를 60도 간격으로 배치
              backgroundImage: index % 2 === 0 ? `url('/image/lightWood.png')` : `url('/image/darkWood.png')`,
              color : index % 2 === 0 ? 'rgb(255,255,255)' : 'rgb(255,255,255)'
            }}
          >
            <span>{sector}</span>
          </div>
        ))}
        </div>
      </div>
      <button id='askBtn' value="연구" onClick={spinWheel}> </button>
      
    </div>
  );
};
