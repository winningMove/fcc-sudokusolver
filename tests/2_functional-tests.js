const chai = require("chai");
const chaiHttp = require("chai-http");
const assert = chai.assert;
const server = require("../server");
import { puzzlesAndSolutions } from "../controllers/puzzle-strings.js";

chai.use(chaiHttp);

suite("Functional Tests", () => {
  let requester, validPuzzle, validSolution, samplePuzzle;
  suiteSetup(function connectionUp() {
    requester = chai.request(server).keepOpen();
    validPuzzle = puzzlesAndSolutions[0][0];
    validSolution = puzzlesAndSolutions[0][1];
    samplePuzzle =
      "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
  });
  suiteTeardown(function connectionDown() {
    requester.close();
  });
  suite("POST to /api/solve", () => {
    test("solves a puzzle with valid puzzle string", (done) => {
      requester
        .post("/api/solve")
        .set("content-type", "application/x-www-form-urlencoded")
        .send({ puzzle: validPuzzle })
        .end((err, res) => {
          assert.property(res.body, "solution");
          assert.strictEqual(res.body.solution, validSolution);
          done();
        });
    });
    test("rejects missing puzzle string", (done) => {
      requester
        .post("/api/solve")
        .set("content-type", "application/x-www-form-urlencoded")
        .send({ notPuzzle: "notPuzzle" })
        .end((err, res) => {
          assert.property(res.body, "error");
          assert.strictEqual(res.body.error, "Required field missing");
          done();
        });
    });
    test("rejects puzzle string with invalid characters", (done) => {
      requester
        .post("/api/solve")
        .set("content-type", "application/x-www-form-urlencoded")
        .send({ puzzle: Array(81).fill("a").join("") })
        .end((err, res) => {
          assert.property(res.body, "error");
          assert.strictEqual(res.body.error, "Invalid characters in puzzle");
          done();
        });
    });
    test("rejects puzzle string of incorrect length", (done) => {
      requester
        .post("/api/solve")
        .set("content-type", "application/x-www-form-urlencoded")
        .send({ puzzle: Array(88).fill("1").join("") })
        .end((err, res) => {
          assert.property(res.body, "error");
          assert.strictEqual(
            res.body.error,
            "Expected puzzle to be 81 characters long"
          );
          done();
        });
    });
    test("rejects puzzle string that cannot be solved", (done) => {
      requester
        .post("/api/solve")
        .set("content-type", "application/x-www-form-urlencoded")
        .send({ puzzle: validPuzzle.replace("1", "5") })
        .end((err, res) => {
          assert.property(res.body, "error");
          assert.strictEqual(res.body.error, "Puzzle cannot be solved");
          done();
        });
    });
  });
  suite("POST to /api/check", () => {
    test("checks a puzzle placement with all fields", (done) => {
      requester
        .post("/api/check")
        .set("content-type", "application/x-www-form-urlencoded")
        .send({ puzzle: samplePuzzle, coordinate: "A5", value: "2" })
        .end((err, res) => {
          assert.property(res.body, "valid");
          assert.isTrue(res.body.valid);
          done();
        });
    });
    test("rejects single placement conflict", (done) => {
      requester
        .post("/api/check")
        .set("content-type", "application/x-www-form-urlencoded")
        .send({ puzzle: samplePuzzle, coordinate: "A5", value: "9" })
        .end((err, res) => {
          assert.property(res.body, "conflict");
          assert.deepEqual(res.body.conflict, ["row"]);
          done();
        });
    });
    test("rejects multiple placement conflicts", (done) => {
      requester
        .post("/api/check")
        .set("content-type", "application/x-www-form-urlencoded")
        .send({ puzzle: samplePuzzle, coordinate: "A5", value: "1" })
        .end((err, res) => {
          assert.property(res.body, "conflict");
          assert.deepEqual(res.body.conflict, ["row", "column"]);
          done();
        });
    });
    test("rejects all placement conflicts", (done) => {
      requester
        .post("/api/check")
        .set("content-type", "application/x-www-form-urlencoded")
        .send({ puzzle: samplePuzzle, coordinate: "A2", value: "5" })
        .end((err, res) => {
          assert.property(res.body, "conflict");
          assert.deepEqual(res.body.conflict, ["row", "column", "region"]);
          done();
        });
    });
    test("rejects missing required fields", (done) => {
      requester
        .post("/api/check")
        .set("content-type", "application/x-www-form-urlencoded")
        .send({ notPuzzle: samplePuzzle, coordinate: "A2", value: "5" })
        .end((err, res) => {
          assert.property(res.body, "error");
          assert.strictEqual(res.body.error, "Required field(s) missing");
          done();
        });
    });
    test("rejects puzzle with invalid characters", (done) => {
      requester
        .post("/api/check")
        .set("content-type", "application/x-www-form-urlencoded")
        .send({
          puzzle: samplePuzzle.replace("1", "q"),
          coordinate: "A2",
          value: "5",
        })
        .end((err, res) => {
          assert.property(res.body, "error");
          assert.strictEqual(res.body.error, "Invalid characters in puzzle");
          done();
        });
    });
    test("rejects puzzle of incorrect length", (done) => {
      requester
        .post("/api/check")
        .set("content-type", "application/x-www-form-urlencoded")
        .send({
          puzzle: Array(20).fill("1").join(""),
          coordinate: "A2",
          value: "5",
        })
        .end((err, res) => {
          assert.property(res.body, "error");
          assert.strictEqual(
            res.body.error,
            "Expected puzzle to be 81 characters long"
          );
          done();
        });
    });
    test("rejects invalid coordinate", (done) => {
      requester
        .post("/api/check")
        .set("content-type", "application/x-www-form-urlencoded")
        .send({
          puzzle: samplePuzzle,
          coordinate: "ZQ",
          value: "5",
        })
        .end((err, res) => {
          assert.property(res.body, "error");
          assert.strictEqual(res.body.error, "Invalid coordinate");
          done();
        });
    });
    test("rejects invalid value", (done) => {
      requester
        .post("/api/check")
        .set("content-type", "application/x-www-form-urlencoded")
        .send({
          puzzle: samplePuzzle,
          coordinate: "A5",
          value: "q",
        })
        .end((err, res) => {
          assert.property(res.body, "error");
          assert.strictEqual(res.body.error, "Invalid value");
          done();
        });
    });
  });
});
