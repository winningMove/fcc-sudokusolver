class SudokuSolver {
  #validatePuzzle(puzzleString) {
    const digitOrPeriodRegex = /^[?:1-9.]+$/;
    if (!digitOrPeriodRegex.test(puzzleString))
      return { error: "Invalid characters in puzzle" };
    if (puzzleString.length !== 81)
      return {
        error: "Expected puzzle to be 81 characters long",
      };
    return { error: "" };
  }

  #validateCoordinateAndValue(coordinate, value) {
    const coordRegex = /^[?:A-I][?:1-9]$/;
    if (!coordRegex.test(coordinate)) return { error: "Invalid coordinate" };
    const valueRegex = /^[?:1-9]$/;
    if (!valueRegex.test(value)) return { error: "Invalid value" };
    return { error: "" };
  }

  #checkRowPlacement(board, row, value) {
    for (let i = 0; i < 9; i++) {
      if (board[row * 9 + i] === value) return false;
    }
    return true;
  }

  #checkColPlacement(board, col, value) {
    for (let i = 0; i < 9; i++) {
      if (board[i * 9 + col] === value) return false;
    }
    return true;
  }

  #checkRegionPlacement(board, row, col, value) {
    const firstRow = Math.floor(row / 3) * 3;
    const firstCol = Math.floor(col / 3) * 3;

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[(firstRow + i) * 9 + (firstCol + j)] === value) return false;
      }
    }

    return true;
  }

  // called by /api/check
  checkPlacementInString(puzzleString, coordinate, value) {
    const validationResultPuzzle = this.#validatePuzzle(puzzleString);
    if (validationResultPuzzle.error) return validationResultPuzzle;
    const validationResultRest = this.#validateCoordinateAndValue(
      coordinate,
      value
    );
    if (validationResultRest.error) return validationResultRest;

    const board = this.#getBoard(puzzleString);
    const index =
      (coordinate.charCodeAt(0) - 65) * 9 + parseInt(coordinate[1]) - 1;
    const placementCheckResult = this.#checkPlacementOnBoard(
      board,
      index,
      value
    );

    return placementCheckResult;
  }

  #checkPlacementOnBoard(board, index, value) {
    const row = Math.floor(index / 9);
    const col = index % 9;
    const conflict = [];

    const rowCheck = this.#checkRowPlacement(board, row, value);
    if (!rowCheck) conflict.push("row");
    const colCheck = this.#checkColPlacement(board, col, value);
    if (!colCheck) conflict.push("column");
    const regionCheck = this.#checkRegionPlacement(board, row, col, value);
    if (!regionCheck) conflict.push("region");

    if (conflict.length !== 0) return { valid: false, conflict };

    return { valid: true };
  }

  #getBoard(puzzleString) {
    return puzzleString.split("");
  }

  #recursiveSolve(board) {
    for (let i = 0; i < 81; i++) {
      if (board[i] === ".") {
        for (let val = 1; val <= 9; val++) {
          if (this.#checkPlacementOnBoard(board, i, String(val)).valid) {
            board[i] = String(val);

            if (this.#recursiveSolve(board)) return true; // recursive solve
            board[i] = "."; // undo move otherwise
          }
        }
        return false;
      }
    }
    return true;
  }

  // called by /api/solve with string puzzle, returns solution property with solved string
  // validation returns error property with message, failed solve also
  solve(puzzleString) {
    const validationResult = this.#validatePuzzle(puzzleString);
    if (validationResult.error) return validationResult;

    const board = this.#getBoard(puzzleString);
    const solved = this.#recursiveSolve(board);

    if (!solved) return { error: "Puzzle cannot be solved" };
    return { solution: board.join("") };
  }
}

module.exports = SudokuSolver;
