class Soldier {
    constructor(color) {
        this.color = color;
        this.type = "soldier";
        this.moved = false;
    }
    isReachable(p1, p2) {
        return Math.abs(p2.i - p1.i) + Math.abs(p2.j - p1.j) === 1 &&
            !board[p2.i][p2.j];
    }
}

class Horse {
    constructor(color) {
        this.color = color;
        this.type = "horse";
        this.moved = false;
    }
    isReachable(p1, p2) {
        return (Math.abs(p2.i - p1.i) + Math.abs(p2.j - p1.j) <= 2) &&
            !(Math.pow(p2.i - p1.i, 2) + Math.pow(p2.j - p1.j, 2) === 4) &&
            !board[p2.i][p2.j];
    }
}

class Chariot {
    constructor(color) {
        this.color = color;
        this.type = "chariot";
        this.moved = false;
    }
    isReachable(p1, p2) {
        return Math.abs(p2.i - p1.i) + Math.abs(p2.j - p1.j) === 1 &&
            !board[p2.i][p2.j];
    }
}

const type_table = {
    "soldier": "兵",
    "horse": "马",
    "chariot": "车"
}

let board = [];
let boardElement;
let current_i = 0;
let current_j = 0;
let gameover = false;
let selected = false;

let edit_mode = false;

const audio = new Audio("./piece.ogg");


const getYellowPositions = (p) => {
    let result = [];
    let b_p = board[p.i][p.j];
    const isLegal = (p) => p.i >= 0 && p.i <= 5 && p.j >= 0 && p.j <= 5;
    if (isLegal({ i: p.i + 1, j: p.j }) && isLegal({ i: p.i + 2, j: p.j }))
        if (board[p.i + 1][p.j]?.color === { "red": "black", "black": "red" }[b_p.color] && !board[p.i + 2][p.j])
            result.push({ i: p.i + 1, j: p.j });
    if (isLegal({ i: p.i - 1, j: p.j }) && isLegal({ i: p.i - 2, j: p.j }))
        if (board[p.i - 1][p.j]?.color === { "red": "black", "black": "red" }[b_p.color] && !board[p.i - 2][p.j])
            result.push({ i: p.i - 1, j: p.j });
    if (isLegal({ i: p.i, j: p.j + 1 }) && isLegal({ i: p.i, j: p.j + 2 }))
        if (board[p.i][p.j + 1]?.color === { "red": "black", "black": "red" }[b_p.color] && !board[p.i][p.j + 2])
            result.push({ i: p.i, j: p.j + 1 });
    if (isLegal({ i: p.i, j: p.j - 1 }) && isLegal({ i: p.i, j: p.j - 2 }))
        if (board[p.i][p.j - 1]?.color === { "red": "black", "black": "red" }[b_p.color] && !board[p.i][p.j - 2])
            result.push({ i: p.i, j: p.j - 1 });
    return result;
}

const getGreenPositions = (p) => {
    let positions = [];
    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 6; j++) {
            if (board[p.i][p.j]?.isReachable(p, { i, j })) {
                positions.push({ i, j });
            }
        }
    }
    return positions;
}

function* gameGenerator() {
    let counter = 0;
    const getTurn = () => {
        return Math.floor(counter / 2) + 1;
    }
    const redOrBlack = () => (getTurn() - 1) % 2 ? "red" : "black";
    const turn_element = document.getElementById("turn");

    const playAudio = () => audio.play();

    let p1, b_p1;
    while (true) {
        if (counter % 2 === 0) {
            turn_element.innerHTML = `${{ "black": "Black", "red": "Red" }[redOrBlack()]}'s Turn`;
            for (let i = 0; i < 6; i++) {
                for (let j = 0; j < 6; j++) {
                    if (board[i][j] === null) continue;
                    board[i][j].moved = false;
                }
            }
        }
        {
            lose = true;
            for (let i = 0; i < 6; i++) {
                for (let j = 0; j < 6; j++) {
                    if (board[i][j] === null) continue;
                    if (board[i][j].color !== redOrBlack()) continue;
                    if (getGreenPositions({ i, j }).length !== 0 && !board[i][j].moved) {
                        lose = false;
                    }
                }
            }
            if (lose) {
                turn_element.innerHTML = `${{ "black": "Red", "red": "Black" }[redOrBlack()]}'s Win`;
                alert(`${redOrBlack()} lose`);
                gameover = true;
                return;
            }
        }

        selected = false;
        while (true) {
            yield;
            p1 = { i: current_i, j: current_j };
            b_p1 = board[p1.i][p1.j];
            if (!b_p1 || b_p1?.color !== redOrBlack()) continue;
            if (b_p1 && b_p1.moved) continue;
            break;
        }
        selected = true;

        if (b_p1.type === "chariot") {
            let movepushc = 2;
            let p2;
            while (movepushc) {
                let yellow_positions = getYellowPositions(p1);
                let green_positions = getGreenPositions(p1);
                if (green_positions.length + yellow_positions.length === 0) {
                    counter--;
                    break;
                }
                draw(yellow_positions, "yellow");
                draw(green_positions, "green");

                while (true) {
                    yield;
                    p2 = { i: current_i, j: current_j };
                    if (p1.i === p2.i && p1.j === p2.j) break;
                    if (positionIn(p2, [...yellow_positions, ...green_positions]))
                        break;
                }
                if (p1.i === p2.i && p1.j === p2.j) {
                    if (movepushc === 2) counter--;
                    refreshBoard();
                    break;
                }

                if (positionIn(p2, green_positions)) {
                    move(p1, p2);
                    p1 = p2;
                } else {
                    push(p1, p2);
                }
                movepushc--;
                judgeDeath({ "red": "black", "black": "red" }[redOrBlack()]);
                playAudio();
            }
        } else {
            let green_positions = getGreenPositions(p1);
            if (green_positions.length === 0) return;
            green_positions.forEach(e => {
                drawBackgroundColor(e, "green");
            });

            let p_new;
            while (true) {
                yield;
                p_new = { i: current_i, j: current_j };
                if (p1.i === p_new.i && p1.j === p_new.j) break;
                if (!move(p1, p_new)) {
                    continue;
                };
                break;
            }
            if (p1.i === p_new.i && p1.j === p_new.j) {
                counter--;
                refreshBoard();
            } else {
                judgeDeath({ "red": "black", "black": "red" }[redOrBlack()]);
                playAudio()
            };
        }
        counter++;
    }
}

const positionIn = (p, positions) => positions.some(e => e.i === p.i && e.j === p.j);

let game = gameGenerator();

const draw = (positions, color) => {
    positions.forEach(e => {
        drawBackgroundColor(e, color);
    });
}

const drawBackgroundColor = (p, color) => {
    boardElement.children[p.i].children[p.j].style.backgroundColor = color;
}

const move = (p1, p2) => {
    b_p1 = board[p1.i][p1.j];
    if (!b_p1.isReachable(p1, p2)) return false;
    [board[p1.i][p1.j], board[p2.i][p2.j]] = [board[p2.i][p2.j], board[p1.i][p1.j]];
    refreshBoard();
    if (board[p2.i][p2.j]) board[p2.i][p2.j].moved = true;
    return true;
}

const push = (p1, p2) => {
    let yellow_positions = getYellowPositions(p1);
    yellow_positions.forEach(position => {
        if (p2.i === position.i && p2.j === position.j) {
            let direction = {
                i: (position.i - p1.i) > 0 ? 1 : (position.i - p1.i < 0 ? -1 : 0),
                j: (position.j - p1.j) > 0 ? 1 : (position.j - p1.j < 0 ? -1 : 0)
            };
            let pp1 = p2;
            let pp2 = { i: p2.i + direction.i, j: p2.j + direction.j };
            [board[pp1.i][pp1.j], board[pp2.i][pp2.j]] = [board[pp2.i][pp2.j], board[pp1.i][pp1.j]];
            refreshBoard();
            board[p1.i][p1.j].moved = true;
            return true;
        };
    });
    return false;
}

const refreshBoard = () => {
    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 6; j++) {
            const piece = boardElement.children[i].children[j];
            piece.style.backgroundColor = null;
            piece.innerHTML = null;
            if (!board[i][j]) continue;
            piece.innerHTML = type_table[board[i][j].type];
            piece.style.color = board[i][j].color;
        }
    }
}

const getSelectedPiece = () => {
    let result = {
        color: null,
        type: null
    };
    let color_elements = document.getElementsByName("color");
    let type_elements = document.getElementsByName("type");
    color_elements.forEach((e) => {
        if (e.checked) result.color = e.value;
    });
    type_elements.forEach((e) => {
        if (e.checked) result.type = e.value;
    });
    if (result.color === "blank") return null;
    return {
        "soldier": new Soldier(result.color),
        "horse": new Horse(result.color),
        "chariot": new Chariot(result.color)
    }[result.type];
}

const reset = () => {
    if (edit_mode) return;

    gameover = false;
    selected = false;

    boardElement = document.querySelector("#board");
    boardElement.innerHTML = null;
    board = [
        [null, null, null, null, null, null],
        [null, new Soldier("red"), new Soldier("red"), new Soldier("red"), new Soldier("red"), null],
        [null, new Horse("red"), new Chariot("red"), new Chariot("red"), new Horse("red"), null],
        [null, new Horse("black"), new Chariot("black"), new Chariot("black"), new Horse("black"), null],
        [null, new Soldier("black"), new Soldier("black"), new Soldier("black"), new Soldier("black"), null],
        [null, null, null, null, null, null]
    ];
    for (let i = 0; i < 6; i++) {
        const tr = document.createElement('tr');
        for (let j = 0; j < 6; j++) {
            const td = document.createElement('td');
            td.onclick = () => {
                if (edit_mode) {
                    let p = getSelectedPiece();
                    board[i][j] = p;
                    refreshBoard();
                    return;
                }

                if (gameover) return;
                current_i = i;
                current_j = j;
                game.next();
            }
            tr.appendChild(td);
        }
        boardElement.appendChild(tr);
    }
    refreshBoard();
    game = gameGenerator();
    game.next();
}

const edit = () => {
    if (selected) return;
    edit_mode = !edit_mode;
    document.getElementById("edit_btn").innerHTML = edit_mode ? "关闭编辑模式" : "开启编辑模式";
    if (edit_mode) {
        document.getElementById("edit_board").style.visibility = "visible";
    } else {
        document.getElementById("edit_board").style.visibility = "hidden";
    }
}

const init = () => {
    reset();
}

const judgeDeath = (color) => {
    const findDeadA = (map) => {
        let linkedBlocksGroups = new Array();
        const isInLinkedBlocksGroups = (block) => {
            for (let blocks of linkedBlocksGroups) if (blocks.some((b) => b.position.i === block.i && b.position.j === block.j)) return true;
            return false;
        }
        const lookAround = (block, linkedBlocks) => {
            const aroundBlocks = [[block.i - 1, block.j], [block.i + 1, block.j], [block.i, block.j - 1], [block.i, block.j + 1]];
            linkedBlocks.push({ position: block, alive: !!(aroundBlocks.some((b) => map[b[0]]?.[b[1]] === "C")) });
            for (const [nr, nc] of aroundBlocks) {
                if (map[nr]?.[nc] === "A") {
                    if (!isInLinkedBlocksGroups({ i: nr, j: nc }))
                        lookAround({ i: nr, j: nc }, linkedBlocks);
                }
            }
        }
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 6; j++) {
                if (map[i][j] === "A") {
                    if (isInLinkedBlocksGroups({ i, j })) continue;
                    let linkedBlocks = new Array();
                    linkedBlocksGroups.push(linkedBlocks);
                    lookAround({ i, j }, linkedBlocks);
                }
            }
        }
        return linkedBlocksGroups;
    }

    let map = Array(6).fill(0).map(() => Array(6).fill("C"));
    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 6; j++) {
            if (board[i][j]?.color === color) {
                map[i][j] = "A";
            }
        }
    }
    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 6; j++) {
            if (board[i][j]?.color !== color && board[i][j]) {
                map[i][j] = "B";
            }
        }
    }
    const linkedBlocksGroups = findDeadA(map);

    for (const linkedBlocks of linkedBlocksGroups) {
        if (linkedBlocks.some((b) => b.alive)) continue;
        for (const block of linkedBlocks) board[block.position.i][block.position.j] = null;
    }
    refreshBoard();
}
