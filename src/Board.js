// Board.js
import React, { useEffect, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './Board.css';
import ColorSelection from './ColorSelection';
import axios from 'axios';
import Rullet from './Rullet';
import BackgroundMusic from './BackgroundMusic';
const PieceTypes = {
    PIECE: 'piece',
};


// 배열 특성 상 이름 매칭을 위해 거꾸로
const nameBoard = [
    ['a8', 'b8', 'c8', 'd8', 'e8', 'f8', 'g8', 'h8'],
    ['a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'g7', 'h7'],
    ['a6', 'b6', 'c6', 'd6', 'e6', 'f6', 'g6', 'h6'],
    ['a5', 'b5', 'c5', 'd5', 'e5', 'f5', 'g5', 'h5'],
    ['a4', 'b4', 'c4', 'd4', 'e4', 'f4', 'g4', 'h4'],
    ['a3', 'b3', 'c3', 'd3', 'e3', 'f3', 'g3', 'h3'],
    ['a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2'],
    ['a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1'],
];

const initialBoard = [
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    ['.', '.', '.', '.', '.', '.', '.', '.'],
    ['.', '.', '.', '.', '.', '.', '.', '.'],
    ['.', '.', '.', '.', '.', '.', '.', '.'],
    ['.', '.', '.', '.', '.', '.', '.', '.'],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
];

const pieceColors = {
    'r': 'black', 'n': 'black', 'b': 'black', 'q': 'black', 'k': 'black', 'p': 'black',
    'R': 'white', 'N': 'white', 'B': 'white', 'Q': 'white', 'K': 'white', 'P': 'white',
};

const pieceImages = {
    'black_r': '/image/black_rook.png', 'black_n': '/image/black_knight.png', 
    'black_b': '/image/black_bishop.png', 'black_q': '/image/black_queen.png',
    'black_k': '/image/black_king.png', 'black_p': '/image/black_pawn.png',
    
    'white_R': '/image/white_rook.png', 'white_N': '/image/white_knight.png',
    'white_B': '/image/white_bishop.png', 'white_Q': '/image/white_queen.png',
    'white_K': '/image/white_king.png', 'white_P': '/image/white_pawn.png',
};

const Piece = ({ piece, position, isActive }) => {
    const [{ isDragging }, drag] = useDrag({
        type: PieceTypes.PIECE,
        item: { piece, position },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
        canDrag: isActive,
    });

    let imgName = pieceImages[pieceColors[piece] + "_" + piece]
    
    return (
        <div ref={drag} className={`piece ${pieceColors[piece]} ${isDragging ? 'dragging' : ''}`}>
            <img src={imgName} style={{width : '100%'}}/>
        </div>
    );
};

const Board = () => {
    const [board, setBoard] = useState(initialBoard);
    const [validMoves, setValidMoves] = useState([]);
    const [playerColor, setPlayerColor] = useState(null);
    const [moveLine, setMoveLine] = useState([]);
    const [loading, setLoading] = useState(0);
    const [fen, setFen] = useState("");
    const [turn, setTurn] = useState(playerColor)
    const [moveBlock, setMoveBlock] = useState([]);
    
    const [checkmate, setCheckmate] = useState(false);  // 체크메이트 상태 추가
    const [checkmateServer, setCheckmateServer] = useState("");
    const [result, setResult] = useState(null);
    const [thinking, setThinking] = useState("none");
    const [turnChance, setTurnChance] = useState(0);


    const size = 8; // 8x8 보드
    const rows = [8, 7, 6, 5, 4, 3, 2, 1]; // 행 번호 (8부터 1까지)
    const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']; // 열 알파벳 (A부터 H까지)

    useEffect(() => {
        let temp = [];
        for(let i = 0; i < moveLine.length; i++){
            let color = '';
            if((i + 1) % 2 === 0){
                color = 'Black'
            }else{
                color = 'White';
            }

            temp.push(
                <div className='moveBlock'>
                    <div className='moveColor'>
                        {color}
                    </div>
                    <div className='moveContent'>
                        {moveLine[i].slice(0,2)} - {moveLine[i].slice(2,4)}
                    </div>
                </div>
            )
        }
        setMoveBlock([...temp]);
    }, [moveLine]);

    useEffect(() => {
        if(playerColor !== null){
            setLoading(1);
            axios.post("http://localhost:3001/start", {
                color : playerColor
            })
            .then((response) => {
                console.log(response.data)
                setLoading(0);
                if(playerColor === "black"){
                    setMoveLine(response.data.move)
                }
                
                setBoard(response.data.board)
            })
        }
    }, [playerColor]);

    useEffect(() => {
        if (playerColor !== null) {
            const opponentColor = playerColor === "white" ? "black" : "white";
            if (isCheckmate(opponentColor)) {
                setCheckmate(true);
                alert(`${playerColor === 'white' ? '흑' : '백'}의 체크메이트! 게임이 종료되었습니다.`);
            } else {
                setCheckmate(false);
            }
        }
    }, [board]);

    useEffect(() => {
        if(result === "수상한안개"){
            console.log("수상한안개 발동")
        }else if(result === "한눈팔기"){
            setLoading(1);
            setTurn(playerColor === "black" ? "white" : "black")
            setTurnChance(0);
            axios.post("/move", {
                move : ""
            }).then((response) => {
                
                if(response.data.status === "fail"){
                    alert("체크메이트이오.")
                }else{
                    // 그냥 움직이고 나서 재요청해서 현재 보드상태 반영하기s
                    setLoading(0);
                    setCheckmateServer(response.data.checkmate)
                    setTurn(response.data.fen.split(" ")[1] === "b" ? "black" : "white")
                    setFen(response.data.fen)
                    setMoveLine(response.data.move)
                    setBoard(response.data.board)
                }            
            })
            console.log("한눈팔기")
        }
    }, [result]);


    // 캐슬링 가능 여부 상태
    const [castlingRights, setCastlingRights] = useState({
        white: { kingside: true, queenside: true },
        black: { kingside: true, queenside: true },
    });

    // 앙파상 타겟 위치 상태
    const [enPassantTarget, setEnPassantTarget] = useState(null);

    // 폰 승격 상태
    const [promotion, setPromotion] = useState(null);

    const calculateValidMoves = (row, col) => {
        const piece = board[row][col];
        if (!piece || piece === '.') return [];

        const moves = [];
        const directions = {
            'p': [[1, 0], [1, -1], [1, 1]],
            'P': [[-1, 0], [-1, -1], [-1, 1]],
            'n': [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]],
            'b': [[1, 1], [1, -1], [-1, 1], [-1, -1]],
            'r': [[1, 0], [0, 1], [-1, 0], [0, -1]],
            'q': [[1, 1], [1, -1], [-1, 1], [-1, -1], [1, 0], [0, 1], [-1, 0], [0, -1]],
            'k': [[1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]],
        };

        const color = pieceColors[piece].toLowerCase();

        // 폰 이동
        if (piece.toLowerCase() === 'p') {
            const direction = piece === 'p' ? 1 : -1;
            const startRow = piece === 'p' ? 1 : 6;

            // 기본 전진
            if (board[row + direction]?.[col] === '.') {
                moves.push([row + direction, col]);
                // 초기 위치에서 두 칸 전진
                if (row === startRow && board[row + direction * 2]?.[col] === '.') {
                    moves.push([row + direction * 2, col]);
                }
            }

            // 대각선 먹기
            // console.log("왼 " + board[row + direction]?.[col - 1])
            // console.log(pieceColors[board[row + direction][col - 1]])

            // console.log("오른 "+board[row + direction]?.[col + 1])
            // console.log(pieceColors[board[row + direction][col + 1]])
            if (board[row + direction]?.[col - 1] && pieceColors[board[row + direction][col - 1]] !== color &&
                board[row + direction][col - 1] !== '.' && board[row + direction][col - 1] !== color
            ) {
                moves.push([row + direction, col - 1]);
            }
            if (board[row + direction]?.[col + 1] && pieceColors[board[row + direction][col + 1]] !== color &&
                board[row + direction][col + 1] !== '.' && board[row + direction][col + 1] !== color
            ) {
                moves.push([row + direction, col + 1]);
            }

            // 앙파상 처리
            if (enPassantTarget) {
                const [epRow, epCol] = enPassantTarget;
                if (row + direction === epRow && Math.abs(col - epCol) === 1) {
                    moves.push([epRow, epCol]);
                }
            }
        }

        // 나이트 이동
        if (piece.toLowerCase() === 'n') {
            directions['n'].forEach(([dx, dy]) => {
                const newRow = row + dx;
                const newCol = col + dy;
                if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                    if (board[newRow][newCol] === '.' || pieceColors[board[newRow][newCol]] !== color) {
                        moves.push([newRow, newCol]);
                    }
                }
            });
        }

        // 비숍, 룩, 퀸, 킹의 이동은 방향별로 진행
        const addMovesInDirections = (dirs, infinite = false) => {
            
            dirs.forEach(([dx, dy]) => {
                let before = null;
                for (let i = 1; i < (infinite ? 8 : 2); i++) {
                    const newRow = row + dx * i;
                    const newCol = col + dy * i;
                    if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8) continue;
                    if(pieceColors[board[newRow][newCol]] === color) break;

                    if (board[newRow][newCol] && pieceColors[board[newRow][newCol]] === color) continue;
                    
                    if(pieceColors[board[newRow][newCol]] !== color && pieceColors[board[newRow][newCol]] !== undefined){
                        if(before === null){
                            moves.push([newRow, newCol]);
                        }
                        before = color;
                        
                    }
                    
                    if(before === null && pieceColors[board[newRow][newCol]] === undefined ){
                        moves.push([newRow, newCol]);
                    }
                    
                    if (board[newRow][newCol]) continue; // 상대 기물을 잡으면 멈춤
                }
            });
        };

        // 비숍 이동
        if (piece.toLowerCase() === 'b') {
            addMovesInDirections(directions['b'], true);
        }

        // 룩 이동
        if (piece.toLowerCase() === 'r') {
            addMovesInDirections(directions['r'], true);
        }

        // 퀸 이동
        if (piece.toLowerCase() === 'q') {
            // addMovesInDirections(directions['q'], true);
            addMovesInDirections(directions['r'], true);
            addMovesInDirections(directions['b'], true);
        }

        // 킹 이동 및 캐슬링 처리
        if (piece.toLowerCase() === 'k') {
            addMovesInDirections(directions['k']);

            // 캐슬링 가능 여부 확인
            if (castlingRights[color]?.kingside) {
                // 킹이 움직이지 않았고, 룩도 움직이지 않았으며, 중간 칸이 비어있어야 함
                if (
                    (color === 'white' && board[7][5] === '.' && board[7][6] === '.') &&
                    board[7][7].toLowerCase() === 'r'
                ) {
                    // 체크 상태 확인은 추가 구현 필요
                    moves.push([7, 6]); // 킹 사이드 캐슬링 위치
                }
                if (
                    (color === 'white' && board[7][1] === '.' && board[7][2] === '.' && board[7][3] === '.') &&
                    board[7][0].toLowerCase() === 'r'
                ) {
                    // 체크 상태 확인은 추가 구현 필요
                    moves.push([7, 2]); // 퀸 사이드 캐슬링 위치
                }
            }

            if (castlingRights[color]?.queenside) {
                if (
                    (color === 'black' && board[0][5] === '.' && board[0][6] === '.') &&
                    board[0][7].toLowerCase() === 'r'
                ) {
                    // 체크 상태 확인은 추가 구현 필요
                    moves.push([0, 6]); // 킹 사이드 캐슬링 위치
                }
                if (
                    (color === 'black' && board[0][1] === '.' && board[0][2] === '.' && board[0][3] === '.') &&
                    board[0][0].toLowerCase() === 'r'
                ) {
                    // 체크 상태 확인은 추가 구현 필요
                    moves.push([0, 2]); // 퀸 사이드 캐슬링 위치
                }
            }
        }

        return moves;
    };

    const isCheckmate = (color) => {
        let kingPosition = null;
        
        // 상대 킹 위치와 체크 상태를 확인
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece && pieceColors[piece]?.toLowerCase() === color && piece.toLowerCase() === 'k') {
                    kingPosition = [row, col];
                    break;
                }
            }
            if (kingPosition) break;
        }
    
        if (!kingPosition) {
            console.error("킹을 찾을 수 없습니다.");
            return false;
        }
    
        // 상대 킹이 체크 상태인지 확인
        if (isUnderAttack(kingPosition[0], kingPosition[1], color)) {
            // 킹이 체크 상태라면, 체크메이트를 확인
            return !canKingMoveOrBlock(kingPosition[0], kingPosition[1], color);
        }
        
        return false; // 체크 상태가 아니면 체크메이트 아님
    };

    // 킹이 체크 상태인지 확인하는 함수
    const isUnderAttack = (kingRow, kingCol, color) => {
        const opponentColor = color === "white" ? "black" : "white";
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (pieceColors[piece]?.toLowerCase() === opponentColor) {
                    const validMoves = calculateValidMoves(row, col);
                    if (validMoves.some(move => move[0] === kingRow && move[1] === kingCol)) {
                        return true; // 상대 기물이 킹을 공격 가능하면 체크 상태
                    }
                }
            }
        }
        return false; // 체크가 아니면 false
    };

    // 킹이 이동하거나 다른 기물이 체크를 차단할 수 있는지 확인
    const canKingMoveOrBlock = (kingRow, kingCol, color) => {
        const validKingMoves = calculateValidMoves(kingRow, kingCol, true); // 킹의 유효한 이동 계산
        if (validKingMoves.length > 0) {
            return true; // 킹이 이동할 수 있으면 체크메이트 아님
        }

        // 킹이 이동할 수 없다면, 다른 기물이 체크를 막을 수 있는지 확인
        // 상대의 공격 범위를 계산하고, 이를 차단할 수 있는 기물이 있는지 확인
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece && pieceColors[piece]?.toLowerCase() === color) {
                    const validMoves = calculateValidMoves(row, col);
                    // 이 기물이 체크를 차단할 수 있는지 확인
                    for (const move of validMoves) {
                        if (isBlockingAttack(move[0], move[1], kingRow, kingCol, color)) {
                            return true; // 기물이 체크를 차단하면 체크메이트 아님
                        }
                    }
                }
            }
        }

        return false; // 킹이 이동할 수 없고, 차단할 기물도 없으면 체크메이트
    };

    // 체크를 차단할 수 있는지 여부 확인
    const isBlockingAttack = (fromRow, fromCol, kingRow, kingCol, color) => {
        const opponentColor = color === "white" ? "black" : "white";
        const piece = board[fromRow][fromCol];
        // 특정 기물이 체크를 차단할 수 있는지 확인 (예: 킹, 룩, 비숍 등)
        // 예시로 룩과 킹이 체크를 차단할 수 있다고 가정
        if (piece.toLowerCase() === 'r' || piece.toLowerCase() === 'q' || piece.toLowerCase() === 'k') {
            // 이 기물이 체크를 차단할 수 있으면 true 리턴
            const validMoves = calculateValidMoves(fromRow, fromCol);
            return validMoves.some(move => move[0] === kingRow && move[1] === kingCol);
        }
        return false;
    };
    

    const movePiece = (from, to, color) => {
        const newBoard = board.map(arr => arr.slice());
        const [fromRow, fromCol] = from;
        const [toRow, toCol] = to;
        const piece = newBoard[fromRow][fromCol];
        const targetPiece = newBoard[toRow][toCol];
    
        // 앙파상 처리
        if (piece.toLowerCase() === 'p' && toCol !== fromCol && targetPiece === '.') {
            const epRow = piece === 'p' ? toRow - 1 : toRow + 1;
            newBoard[epRow][toCol] = '.'; // 앙파상 상대 폰 제거
        }
    
        // 캐슬링 처리
        if (piece.toLowerCase() === 'k') {
            if (toCol === 6) { // 킹 사이드 캐슬링
                const rookFrom = [fromRow, 7];
                const rookTo = [fromRow, 5];
                newBoard[rookTo[0]][rookTo[1]] = newBoard[rookFrom[0]][rookFrom[1]]; // 룩 이동
                newBoard[rookFrom[0]][rookFrom[1]] = '.'; // 원래 룩 위치 빈 칸으로 설정
            } else if (toCol === 2) { // 퀸 사이드 캐슬링
                const rookFrom = [fromRow, 0];
                const rookTo = [fromRow, 3];
                newBoard[rookTo[0]][rookTo[1]] = newBoard[rookFrom[0]][rookFrom[1]]; // 룩 이동
                newBoard[rookFrom[0]][rookFrom[1]] = '.'; // 원래 룩 위치 빈 칸으로 설정
            }
        }
    
        // 폰 승급 처리
        if (piece.toLowerCase() === 'p' && (toRow === 0 || toRow === 7)) {
            // 승급된 위치에 퀸 생성
            newBoard[toRow][toCol] = color === 'white' ? 'Q' : 'q'; // 흑은 소문자 퀸, 백은 대문자 퀸
            setPromotion([toRow, toCol]); // 승급된 상태 관리
        } else {
            // 일반적인 이동 처리
            newBoard[toRow][toCol] = newBoard[fromRow][fromCol]; // 기물 이동
            
            
            if(loading === 0){
                setLoading(1);
                setTurn(playerColor === "black" ? "white" : "black")
                setTurnChance(0);
                axios.post("/move", {
                    move : nameBoard[fromRow][fromCol] + "" + nameBoard[toRow][toCol]
                }).then((response) => {
                    if(response.data.status === "fail"){
                        alert("체크메이트이오.")
                    }else{
                        
                        axios.post("/ask", {
                            data : fen
                        }).then((response) => {
                            if(response.data.answer === "(none)"){
                                alert("게임이 끝났습니다.")
                                setPlayerColor(null);
                            }else{
                                setLoading(0);
                                setCheckmateServer(response.data.checkmate)
                                setTurn(playerColor === "black" ? "black" : "white")
                                setFen(response.data.fen)
                                setMoveLine(response.data.move)
                                setBoard(response.data.board)
                            }
                        })
                    }            
                })
            }
            

        }
    
        // 원래 위치를 빈 칸으로 설정
        newBoard[fromRow][fromCol] = '.'; // 기물이 이동한 원래 위치는 빈칸으로 설정
    
        // 앙파상 타겟 설정
        if (piece.toLowerCase() === 'p' && Math.abs(toRow - fromRow) === 2) {
            const epRow = (fromRow + toRow) / 2;
            setEnPassantTarget([epRow, fromCol]); // 앙파상 타겟 설정
        } else {
            setEnPassantTarget(null); // 앙파상 타겟이 아닌 경우 초기화
        }
    
        // 캐슬링 권한 업데이트
        const updatedCastlingRights = { ...castlingRights };
        if (piece.toLowerCase() === 'k') {
            updatedCastlingRights[color].kingside = false;
            updatedCastlingRights[color].queenside = false;
        }
        if (piece.toLowerCase() === 'r') {
            if (fromCol === 0) {
                updatedCastlingRights[color].queenside = false;
            }
            if (fromCol === 7) {
                updatedCastlingRights[color].kingside = false;
            }
        }
        setCastlingRights(updatedCastlingRights);
    
        // 최종 보드 상태 업데이트
        setBoard(newBoard);
        setValidMoves([]); // 유효한 이동 초기화
    
        // 체크메이트 여부 확인
        const opponentColor = color === 'white' ? 'black' : 'white';
        if (isCheckmate(opponentColor)) {
            alert(`${color === 'white' ? '흑' : '백'}의 체크메이트! 게임이 종료되었습니다.`);
            // 게임 종료 처리 로직 추가 (필요 시 게임을 리셋하거나 다른 화면을 띄울 수 있음)
        }
    }; 

    const handleSquareClick = (row, col) => {
        if (loading === 1) return;
        const piece = board[row][col];
        if (checkmate) {
            // 체크메이트 상태일 때 킹 외의 기물 클릭 방지
            if (piece.toLowerCase() !== 'k' || pieceColors[piece].toLowerCase() !== playerColor) {
                return;  // 킹이 아닌 기물 클릭 시 아무 동작도 하지 않음
            }
        }

        if (piece !== '.' && pieceColors[piece]) { // pieceColors[piece]가 정의된 경우만 처리
            if (pieceColors[piece].toLowerCase() === playerColor) {
                setValidMoves(calculateValidMoves(row, col));
            } else {
                setValidMoves([]);
            }
        } else {
            setValidMoves([]);
        }
    };

    const BoardSquare = ({ row, col, piece, movePiece, validMoves, isActive }) => {
        const [, drop] = useDrop({
            accept: PieceTypes.PIECE,
            drop: (item) => {
                if (validMoves.some(move => move[0] === row && move[1] === col)) {
                    movePiece(item.position, [row, col]);
                }
            },
        });

        return (
            <div
                ref={drop}
                className={`square ${validMoves.some(move => move[0] === row && move[1] === col) ? 'valid' : ''}`}
                onClick={() => handleSquareClick(row, col)}
            >
                {piece !== '.' && <Piece piece={piece} position={[row, col]} isActive={isActive} />}
            </div>
        );
    };

    const handleColorSelect = (color) => {
        setPlayerColor(color);
    };

    if (!playerColor) {
        return <ColorSelection onSelect={handleColorSelect} />;
    }

    


    return (
        <div id='boardPage'>
            <div id='turnLoading' style={{display : loading === 1 ? 'block' : 'none'}}>
                <img src='/image/thinking_king.png'/>
                <p style={{fontWeight : 'bold'}}>왕이 고뇌하고 있습니다.</p>
            </div>
            <div className='mainPage' id='rulletPage'>
                <Rullet fen={fen} result={result} setResult={setResult} 
                    thinking={thinking} setThinking={setThinking}
                    turnChance={turnChance} setTurnChance={setTurnChance}>
                </Rullet>
            </div>
            <div className='mainPage'>
                <h2 id='turnStatus'>
                    {turn === "black" ? "Black" : "White"}
                </h2>
                <DndProvider backend={HTML5Backend}>
                    <div className="board">
                        {board.map((row, rowIndex) => (
                            <div key={rowIndex} className="board-row">
                                {row.map((piece, colIndex) => (
                                    <BoardSquare
                                        key={colIndex}
                                        row={rowIndex}
                                        col={colIndex}
                                        piece={piece}
                                        movePiece={(from, to) => movePiece(from, to, playerColor)} // 색상 전달
                                        validMoves={validMoves}
                                        isActive={pieceColors[piece]?.toLowerCase() === playerColor}
                                    />

                                ))}
                            </div>
                        ))}
                    </div>
                </DndProvider>
                <div id='pog' style={{display : result === "수상한안개" ? "block" : "none"}}>
                    <img src='/image/pogBlock.png'/>
                </div>
                <BackgroundMusic></BackgroundMusic>
            </div>
            <div className='mainPage'>
                <div id='moveLine'>
                    {moveBlock}
                </div>
            </div>
        </div>
    );
};

export default Board;
