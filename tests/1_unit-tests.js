const chai = require("chai");
const assert = chai.assert;
import { puzzlesAndSolutions } from "../controllers/puzzle-strings.js";

const Solver = require("../controllers/sudoku-solver.js");
let solver, samplePuzzle;

suite("Unit Tests", () => {
  suite("SudokuSolver object", () => {
    suiteSetup(function setupSolver() {
      solver = new Solver();
      samplePuzzle =
        "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
    });
    suiteTeardown(function dealloc() {
      solver = samplePuzzle = null;
    });

    test("handles a valid puzzle string of 81 characters", () => {
      const validPuzzle = puzzlesAndSolutions[0][0];
      const solution = solver.solve(validPuzzle);
      assert.notProperty(solution, "error");
      // assert.strictEqual(solution.solution, validSolution);
    });
    test("handles a puzzle string with invalid characters", () => {
      const invalid = Array(81)
        .fill("a", 0, 20)
        .fill("Q", 20, 40)
        .fill("*", 40, 81)
        .join("");
      const solution = solver.solve(invalid);
      assert.property(solution, "error");
      assert.strictEqual(solution.error, "Invalid characters in puzzle");
    });
    test("handles a puzzle string that is not 81 characters", () => {
      const tooShort = Array(20).fill("1").join("");
      const solution = solver.solve(tooShort);
      assert.property(solution, "error");
      assert.strictEqual(
        solution.error,
        "Expected puzzle to be 81 characters long"
      );
    });
    test("handles a valid row placement", () => {
      const checked = solver.checkPlacementInString(samplePuzzle, "A5", "2");
      assert.property(checked, "valid");
      assert.strictEqual(checked.valid, true);
    });
    test("handles an invalid row placement", () => {
      const checked = solver.checkPlacementInString(samplePuzzle, "A5", "9");
      assert.property(checked, "valid");
      assert.strictEqual(checked.valid, false);
      assert.deepEqual(checked.conflict, ["row"]);
    });
    test("handles a valid column placement", () => {
      const checked = solver.checkPlacementInString(samplePuzzle, "A5", "2");
      assert.property(checked, "valid");
      assert.strictEqual(checked.valid, true);
    });
    test("handles an invalid column placement", () => {
      const checked = solver.checkPlacementInString(samplePuzzle, "A5", "6");
      assert.property(checked, "valid");
      assert.strictEqual(checked.valid, false);
      assert.deepEqual(checked.conflict, ["column"]);
    });
    test("handles a valid region placement", () => {
      const checked = solver.checkPlacementInString(samplePuzzle, "A5", "2");
      assert.property(checked, "valid");
      assert.strictEqual(checked.valid, true);
    });
    test("handles an invalid region placement", () => {
      const checked = solver.checkPlacementInString(samplePuzzle, "A5", "4");
      assert.property(checked, "valid");
      assert.strictEqual(checked.valid, false);
      assert.deepEqual(checked.conflict, ["region"]);
    });
    test("valid puzzle strings pass the solver", () => {
      const validPuzzle = puzzlesAndSolutions[0][0];
      const validSolution = puzzlesAndSolutions[0][1];
      const solution = solver.solve(validPuzzle);
      assert.strictEqual(solution.solution, validSolution);
    });
    test("invalid puzzle strings fail the solver", () => {
      const invalidPuzzle = puzzlesAndSolutions[0][0].replace("1", "5");
      const solution = solver.solve(invalidPuzzle);
      assert.property(solution, "error");
      assert.strictEqual(solution.error, "Puzzle cannot be solved");
    });
    test("returns the expected solution for an incomplete puzzle", () => {
      const validPuzzle = puzzlesAndSolutions[1][0];
      const validSolution = puzzlesAndSolutions[1][1];
      const solution = solver.solve(validPuzzle);
      assert.strictEqual(solution.solution, validSolution);
    });
  });
});
