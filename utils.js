export const findDeadA = (map) => {
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
export const positionIn = (p, positions) => positions.some(e => e.i === p.i && e.j === p.j);
export const reverse = { "red": "black", "black": "red" };
