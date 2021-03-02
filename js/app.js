let rows
let cols
let boneCounterLeft
let boneCollected
let boneInterval
let glueInterval
let gBoard;
let gGamerPos;
let glueLastPos
let stepLeft


let isSticky = false
let isGameOn = null

const WALL = 'WALL';
const FLOOR = 'FLOOR';
const BONE = 'BONE';
const GAMER = 'GAMER';
const GLUE = 'GLUE'
const TARGET = 'TARGET'
const elBoneLeftCounter = document.querySelector('.bone-left')
const elBoneCollectedCounter = document.querySelector('.bone-collected')
const elStepCounter= document.querySelector('.step-left')
const elWinMsg = document.querySelector('.win-msg')
const elSpawnSpeed = document.querySelector('select[name=bone-spawn-speed]');
const elSpawnCount = document.querySelector('input[name=bone-spawn-count]');
const elBtnGame = document.querySelector('.btn-game-warper')

const GAMER_IMG = '🐶';
const BONE_IMG = '🦴';
const GLUE_IMG = '😾'



function initGame(row, col) {
	elWinMsg.style.display = 'none'
	elBoneCollectedCounter.style.display = 'none'
	elBoneLeftCounter.style.display = 'none'
	elStepCounter.style.display = 'none'
	elBtnGame.style.display = 'block'
	gGamerPos = { i: 2, j: 3 };
	rows = row
	cols = col
	boneCounterLeft = 7
	boneCollected = 0
	stepLeft = 100

	gBoard = buildBoard();
	renderBoard(gBoard);
}

function startGame(ev) {
	ev.preventDefault()
	elBtnGame.style.display = 'none'
	elBoneCollectedCounter.style.display = 'flex'
	elBoneLeftCounter.style.display = 'flex'
	elStepCounter.style.display = 'flex'
	isGameOn = true
	spawnNewGlue(gBoard)
	glueInterval = setInterval(function () { spawnNewGlue(gBoard) }, 3000)
	elBoneCollectedCounter.innerHTML = `You have Collected ${boneCollected} bones!`
	elBoneLeftCounter.innerHTML = `Only ${boneCounterLeft} left!`
	elStepCounter.innerHTML = ` ${stepLeft}/100 step!`


}
function buildBoard() {
	var board = createMat(rows, cols)
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[0].length; j++) {
			var cell = { type: FLOOR, gameElement: null };
			if (j <= 10 && i === 0 && j >= 3 || i <= 6 && j === 10 || i === 6 &&
				j === 11 || i >= 7 && j === board[0].length - 1 || i === board.length - 1
				|| j + 9 === board.length - 1 && i >= 1 ||
				j <= 3 && i === 1 && j >= 0 || j <= 3 && i === 3 && j >= 1
				|| j <= 4 && i === 4 && j >= 1 ||
				i === 5 && j === 3) {
				cell.type = WALL;
			}
			if (i === 2 && j === 2 || i === 3 && j === 9 || i === 5 && j === 5 || i === 5 && j === 5 || i === 4 && j === 1
				|| i === 7 && j === 10 || i === 6 && j === 7 || i === 8 && j === 7) {
				cell.type = TARGET
			}
			board[i][j] = cell;
		}
		board[3][5].gameElement = BONE;
		board[4][5].gameElement = BONE;
		board[7][1].gameElement = BONE;
		board[7][4].gameElement = BONE;
		board[7][5].gameElement = BONE;
		board[7][6].gameElement = BONE;
		board[6][9].gameElement = BONE;
	}
	board[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
	return board;
}

function spawnNewGlue(board) {
	if (glueLastPos && board[glueLastPos.i][glueLastPos.j].gameElement !== GAMER) {
		board[glueLastPos.i][glueLastPos.j].gameElement = null;
		renderCell(glueLastPos, null)
	}
	var allEmptyCells = getEmptyCells(board)
	var postionRandom = allEmptyCells[getRandomInt(0, allEmptyCells.length - 1)]
	glueLastPos = postionRandom
	board[postionRandom.i][postionRandom.j].gameElement = GLUE;
	renderCell(postionRandom, GLUE_IMG)
}

function getEmptyCells(board) {
	var allEmptyCell = []
	board.length
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[i].length; j++) {
			var currCell = board[i][j]
			if (currCell.type === FLOOR && currCell.gameElement === null) {
				allEmptyCell.push({ i: i, j: j })
			}
		}
	}
	return allEmptyCell
}


function renderBoard(board) {

	var strHTML = '';
	for (var i = 0; i < board.length; i++) {
		strHTML += '<tr>\n';
		for (var j = 0; j < board[0].length; j++) {
			var currCell = board[i][j];
			var cellClass = getClassName({ i: i, j: j })
			cellClass += checkCurrCellType(currCell.type)//(currCell.type === FLOOR) ? ' floor' : ' wall'
			strHTML += '\t<td class="cell ' + cellClass +
				'"  onclick="moveTo(' + i + ',' + j + ')" >\n';
			if (currCell.gameElement === GAMER) {
				strHTML += GAMER_IMG;
			} else if (currCell.gameElement === BONE) {
				strHTML += BONE_IMG;
			}

			strHTML += '\t</td>\n';
		}
		strHTML += '</tr>\n';
	}


	var elBoard = document.querySelector('.board');
	elBoard.innerHTML = strHTML;
}

function checkCurrCellType(currCell) {
	switch (currCell) {
		case WALL:
			return ' wall'
		case TARGET:
			return ' target'
		default:
			return ' floor'
	}

}

function moveTo(i, j) {
	var targetCell = gBoard[i][j];
	let diffI = i - gGamerPos.i
	let diffJ = j - gGamerPos.j
	if (targetCell.type === WALL || targetCell.type === TARGET && targetCell.gameElement === BONE) return;
	let isAbleMove = true
	var iAbsDiff = Math.abs(i - gGamerPos.i);
	var jAbsDiff = Math.abs(j - gGamerPos.j);

	if ((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0)) {
		if (targetCell.gameElement === GLUE) {
			stepLeft -=5
			targetCell.gameElement = GAMER
			isSticky = true
			setTimeout(function () { glueTimeOut(); }, 5000);
		}
		if (targetCell.gameElement === BONE) {
			let loc = { i: i + diffI, j: j + diffJ }
			if (gBoard[loc.i][loc.j].type !== WALL && !gBoard[loc.i][loc.j].gameElement) {
				gBoard[loc.i][loc.j].gameElement = BONE
				renderCell(loc, BONE_IMG);
				if (gBoard[loc.i][loc.j].type === TARGET) {
					boneCounterLeft -= 1
					boneCollected += 1
					elBoneLeftCounter.innerHTML = `Only ${boneCounterLeft} left!`
					elBoneCollectedCounter.innerHTML = `You have Collected ${boneCollected} bones!`
					if (!boneCounterLeft) gameOver('win')
				}
			} else {
				isAbleMove = false
			}
		}
		if (isAbleMove) {
			gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;
			renderCell(gGamerPos, '');
			gGamerPos.i = i;
			gGamerPos.j = j;

			gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
			renderCell(gGamerPos, GAMER_IMG);
			stepLeft--
			elStepCounter.innerHTML = ` ${stepLeft}/100 step!`
			if(!stepLeft) gameOver('lose')
		}

	}

}

function glueTimeOut() {
	return isSticky = false
}


function gameOver(msg) {
	isGameOn = false
	clearInterval(glueInterval)
	clearInterval(boneInterval)
	elWinMsg.style.display = 'flex'
	elWinMsg.innerHTML = `You ${msg}! play again? <button onclick="initGame(10,12)">Reset game</button>`
}

function renderCell(location, value) {
	var cellSelector = '.' + getClassName(location)
	var elCell = document.querySelector(cellSelector);
	elCell.innerHTML = value;
}


function handleKey(event) {
	if (!isGameOn || isSticky) return
	var i = gGamerPos.i;
	var j = gGamerPos.j;


	switch (event.key) {
		case 'ArrowLeft':
			moveTo(i, j - 1);
			break;
		case 'ArrowRight':
			moveTo(i, j + 1);
			break;
		case 'ArrowUp':
			moveTo(i - 1, j);
			break;
		case 'ArrowDown':
			moveTo(i + 1, j);
			break;

	}

}

function getClassName(location) {
	var cellClass = 'cell-' + location.i + '-' + location.j;
	return cellClass;
}

