'use strict'

let rows
let cols
let boneCounterLeft
let boneCollected
let objectInterval
let gBoard;
let gGamerPos;
let glueLastPos
let clockLastPos
let magentLastPos
let goldLastPos
let stepLeft
let lastPlayerPose
let bounesStepCount


let point = 0
let isPasueGame = false
let isMagnetOn = false
let isLastMove = false
let isSticky = false
let isGameOn = null
let undoMoveArr = []
let gamerLastPos = []

const WALL = 'WALL';
const FLOOR = 'FLOOR';
const TARGET = 'TARGET'
const BONE = 'BONE';
const GAMER = 'GAMER';
const GLUE = 'GLUE'
const WATER = 'WATER'
const CLOCK = 'CLOCK'
const MAGENT = 'MAGENT'
const GOLD = 'GOLD'
const MAGENT_BONE = 'MAGENT_BONE'
const elBoneLeftCounter = document.querySelector('.bone-left')
const elBoneCollectedCounter = document.querySelector('.bone-collected')
const elStepCounter = document.querySelector('.step-left')
const elWinMsg = document.querySelector('.win-msg')
const elSpawnSpeed = document.querySelector('select[name=bone-spawn-speed]');
const elSpawnCount = document.querySelector('input[name=bone-spawn-count]');
const elBtnGame = document.querySelector('.btn-game-warper')
const elGameData = document.querySelector('.game-data-warper')
const elMagentBtn = document.querySelector('.magent')
const elPauseBtn = document.querySelector('.pause-game-btn')
const elPoint = document.querySelector('.point')
const elManualBtn = document.querySelector('.btn-manual-game')



const GAMER_IMG = '🐶';
const BONE_IMG = '🦴';
const GLUE_IMG = '😾'
const CLOCK_IMG = '⏰'
const MAGENT_IMG = '🧲'
const MAGENT_BONE_IMG = '🦴🧲'
const GOLD_IMG = '⭐️'




function initGame(row, col) {
	elWinMsg.style.display = 'none'
	elGameData.style.display = 'none'
	elBtnGame.style.display = 'block'
	elManualBtn.style.display = 'none'
	gGamerPos = { i: 2, j: 3 };
	rows = row
	cols = col
	boneCounterLeft = 7
	boneCollected = 0
	stepLeft = 100
	point = 0
	undoMoveArr = []
	gamerLastPos = []
	gBoard = buildBoardAuto();
	renderBoard(gBoard);
	toggleTargetClass()
	toggleMagentClass()
}
function startGameManually(ev) {
	ev.preventDefault()
	elManualBtn.style.display = 'flex'
	elBtnGame.style.display = 'none'
	gBoard = buildBoardManually();
	renderBoard(gBoard);
	document.querySelectorA(".cell").addEventListener("click", function () {
		document.getElementById("demo").innerHTML = "Hello World";
	});
}




function toggleMagentClass() {
	if (isMagnetOn) {
		elMagentBtn.disabled = false;
		elMagentBtn.classList.remove('btn-deactivate')
		elMagentBtn.classList.add('btn-active')
	}
	else {
		elMagentBtn.disabled = true;
		elMagentBtn.classList.remove('btn-active')
		elMagentBtn.classList.add('btn-deactivate')
	}

}


function pauseGame() {
	if (isPasueGame) {
		elPauseBtn.innerHTML = `Pause`
		isPasueGame = false
		objectInterval = setInterval(function () { spawnNewObject(gBoard) }, 3000)


	} else {
		elPauseBtn.innerHTML = `Continue`
		isPasueGame = true
		clearInterval(objectInterval)
	}
}

function startGameAuto(ev) {
	ev.preventDefault()
	elBtnGame.style.display = 'none'
	elGameData.style.display = 'flex'
	isGameOn = true
	bounesStepCount = 0
	spawnNewObject(gBoard)
	objectInterval = setInterval(function () { spawnNewObject(gBoard) }, 3000)
	elBoneCollectedCounter.innerHTML = `You have Collected ${boneCollected} bones!`
	elBoneLeftCounter.innerHTML = `Only ${boneCounterLeft} left!`
	elStepCounter.innerHTML = ` ${stepLeft}/100 step!`
	elPauseBtn.innerHTML = `Pause`
	toggleTargetClass()

}
function buildBoardManually() {
	var board = createMat(rows, cols)
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[0].length; j++) {
			var cell = { type: FLOOR, gameElement: null };
			board[i][j] = cell;
		}
	}
	board[gGamerPos.i][gGamerPos.j].gameElement = GAMER;

	return board;
}

function buildBoardAuto() {
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
				|| i === 7 && j === 10 || i === 6 && j === 8 || i === 8 && j === 7) {
				cell.type = TARGET
			}
			if (i <= 4 && j === 7 && i >= 2 || i <= 7 && j === 3 && i >= 6) {
				cell.type = WATER
			}
			if (i === 3 && j === 5 || i === 4 && j === 5 || i === 7 && j === 1 ||
				i === 7 && j === 4 || i === 7 && j === 5 || i === 7 && j === 6 ||
				i === 6 && j === 9) {
				cell.gameElement = BONE
			}
			board[i][j] = cell;
		}
	}
	board[gGamerPos.i][gGamerPos.j].gameElement = GAMER;

	return board;
}
function undoLastMove() {
	if (!undoMoveArr.length) return
	isLastMove = true
	gBoard = undoMoveArr[undoMoveArr.length - 1]
	renderBoard(gBoard)
	undoMoveArr.splice(-1, 1)
	gGamerPos.i = gamerLastPos[gamerLastPos.length - 1].i
	gGamerPos.j = gamerLastPos[gamerLastPos.length - 1].j
	gamerLastPos.splice(-1, 1)
	stepLeft++
	elStepCounter.innerHTML = ` ${stepLeft}/100 step!`
}
function spawnNewObject(board) {
	if (glueLastPos && board[glueLastPos.i][glueLastPos.j].gameElement !== GAMER) {
		board[glueLastPos.i][glueLastPos.j].gameElement = null;
		renderCell(glueLastPos, null)
	}
	if (clockLastPos && board[clockLastPos.i][clockLastPos.j].gameElement !== GAMER) {
		board[clockLastPos.i][clockLastPos.j].gameElement = null;
		renderCell(clockLastPos, null)
	}
	if (magentLastPos && board[magentLastPos.i][magentLastPos.j].gameElement !== GAMER) {
		board[magentLastPos.i][magentLastPos.j].gameElement = null;
		renderCell(magentLastPos, null)
	}
	if (goldLastPos && board[goldLastPos.i][goldLastPos.j].gameElement !== GAMER) {
		board[goldLastPos.i][goldLastPos.j].gameElement = null;
		renderCell(goldLastPos, null)
	}
	let allEmptyCells = getEmptyCells(board)
	let gluePostionRandom = allEmptyCells[getRandomInt(0, allEmptyCells.length - 1)]
	let clockPostionRandom = allEmptyCells[getRandomInt(0, allEmptyCells.length - 1)]
	let magentPostionRandom = allEmptyCells[getRandomInt(0, allEmptyCells.length - 1)]
	let goldPostionRandom = allEmptyCells[getRandomInt(0, allEmptyCells.length - 1)]
	glueLastPos = gluePostionRandom
	board[gluePostionRandom.i][gluePostionRandom.j].gameElement = GLUE;
	renderCell(gluePostionRandom, GLUE_IMG)
	clockLastPos = clockPostionRandom
	board[clockLastPos.i][clockLastPos.j].gameElement = CLOCK;
	renderCell(clockPostionRandom, CLOCK_IMG)
	magentLastPos = magentPostionRandom
	board[magentLastPos.i][magentLastPos.j].gameElement = MAGENT;
	renderCell(magentPostionRandom, MAGENT_IMG)
	goldLastPos = goldPostionRandom
	board[goldLastPos.i][goldLastPos.j].gameElement = GOLD;
	renderCell(goldPostionRandom, GOLD_IMG)
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
			cellClass += checkCurrCellType(currCell.type)
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
		case WATER:
			return ' water'
		default:
			return ' floor'
	}

}

function moveTo(i, j) {
	if (!isGameOn || isSticky || isPasueGame) return
	var targetCell = gBoard[i][j];
	if (targetCell.type === WALL || targetCell.type === TARGET && targetCell.gameElement === BONE) return;
	let diffI = i - gGamerPos.i
	let diffJ = j - gGamerPos.j
	let isAbleMove = true
	var iAbsDiff = Math.abs(i - gGamerPos.i);
	var jAbsDiff = Math.abs(j - gGamerPos.j);

	if ((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0)) {
		if (targetCell.gameElement === GLUE) {
			stepLeft -= 5
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
				if (gBoard[loc.i][loc.j].type === WATER) {
					gBoard[loc.i][loc.j].gameElement = null
					renderCell(loc, null);
					let afterWaterSlide = { i: loc.i, j: loc.j }
					while (gBoard[afterWaterSlide.i][afterWaterSlide.j].type === WATER) {
						afterWaterSlide.i++
						stepLeft--
					}
					gBoard[afterWaterSlide.i][afterWaterSlide.j].gameElement = BONE
					renderCell(afterWaterSlide, BONE_IMG)
					i = afterWaterSlide.i - 1
					j = afterWaterSlide.j
				}
			}

			else {
				isAbleMove = false
			}
		}

		if (targetCell.gameElement === CLOCK) {
			bounesStepCount += 10
		}
		if (targetCell.gameElement === GOLD) {
			point += 100
			elPoint.innerHTML = `Point:${point}`
		}
		if (targetCell.gameElement === MAGENT) {
			isMagnetOn = true
			toggleMagentClass()
		}
		if (isAbleMove) {
			if (!isLastMove) {
				undoMoveArr.push(JSON.parse(JSON.stringify(gBoard)))
				isLastMove = false
			}
			gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;
			renderCell(gGamerPos, '');
			let lastPos = { i: gGamerPos.i, j: gGamerPos.j }
			gamerLastPos.push(lastPos)
			gGamerPos.i = i;
			gGamerPos.j = j;
			gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
			renderCell(gGamerPos, GAMER_IMG);

			if (!bounesStepCount) {
				stepLeft--
				elStepCounter.innerHTML = ` ${stepLeft}/100 step!`
			}
			else {
				bounesStepCount--
				elStepCounter.innerHTML = ` Bonues Step! ${bounesStepCount} steps left`
			}

			if (!stepLeft) gameOver('lose')
		}

	}

}

function activeMagnet() {
	let boneNearArr = []
	for (var i = gGamerPos.i - 1; i <= gGamerPos.i + 1; i++) {
		if (i < 0 || i >= gBoard.length) continue
		for (var j = gGamerPos.j - 1; j <= gGamerPos.j + 1; j++) {
			if (i === gGamerPos.i && j === gGamerPos.j || j < 0 || j >= gBoard[0].length ||
				i === gGamerPos.i - 1 && j === gGamerPos.j - 1 || i === gGamerPos.i - 1 && j === gGamerPos.j + 1 ||
				i === gGamerPos.i - 1 && j === gGamerPos.j + 1 || i === gGamerPos.i + 1 && j === gGamerPos.j + 1 ||
				i === gGamerPos.i + 1 && j === gGamerPos.j - 1) continue;

			if (gBoard[i][j].gameElement === BONE) {
				let currCell = { i: i, j: j }
				let elCell = document.querySelector(`.cell-${i}-${j}`)
				console.log('elCell:', elCell)
				elCell.classList.add('flash')
				elCell.addEventListener("click", function () {
					selectMagentCell(currCell);
				})
				boneNearArr.push(currCell)
			}
		}
	}
	if (boneNearArr.length) {
		elPauseBtn.disabled = true
		isPasueGame = true
		clearInterval(objectInterval)
	}
}
function selectMagentCell(currCell) {
	elPauseBtn.disabled = false
	isPasueGame = false
	objectInterval = setInterval(function () { spawnNewObject(gBoard) }, 3000)
	renderCell(currCell, MAGENT_BONE_IMG)
	const elCell = document.querySelectorAll(".cell")
	gBoard[currCell.i][currCell.j].gameElement = MAGENT_BONE
	elCell.forEach(target =>
		target.classList.remove('flash')
	)
	isMagnetOn = false
	toggleMagentClass()
}

function glueTimeOut() {
	return isSticky = false
}


function gameOver(msg) {
	isGameOn = false
	clearInterval(objectInterval)
	elWinMsg.style.display = 'flex'
	elWinMsg.innerHTML = `You ${msg}! play again? <button onclick="initGame(10,12)">Reset game</button>`
}

function renderCell(location, value) {
	var cellSelector = '.' + getClassName(location)
	var elCell = document.querySelector(cellSelector);
	elCell.innerHTML = value;
}


function handleKey(event) {

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

function toggleTargetClass() {
	const elTarget = document.querySelectorAll(".target")
	elTarget.forEach(target =>
		target.classList.toggle('flash')
	)
}