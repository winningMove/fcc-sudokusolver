"use strict";

const SudokuSolver = require("../controllers/sudoku-solver.js");

module.exports = function (app) {
  const solver = new SudokuSolver();

  app.route("/api/check").post((req, res) => {
    const { puzzle: puzzleString, coordinate, value } = req.body;
    if (!puzzleString || !coordinate || !value)
      return { error: "Required field(s) missing" };

    const checked = solver.checkPlacementInString(
      puzzleString,
      coordinate,
      value
    );
    return checked;
  });

  app.route("/api/solve").post((req, res) => {
    if (!req.body.puzzle) return { error: "Required field missing" };
    const puzzleString = req.body.puzzle;
    const solution = solver.solve(puzzleString);
    return solution;
  });
};
