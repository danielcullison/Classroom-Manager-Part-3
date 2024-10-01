// An instructor can only access their own students' data.
const router = require("express").Router();
const db = require("../db");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Deny access if user is not logged in
router.use((req, res, next) => {
  if (!req.user) {
    return res.status(401).send("You must be logged in to do that.");
  }
  next();
});

// Get all students
router.get("/", async (req, res, next) => {
  try {
    /* const { rows: students } = await db.query(
      "SELECT * FROM student WHERE instructorId = $1",
      [req.user.id]
    );*/
    const students = await prisma.student.findMany();
    res.send(students);
  } catch (error) {
    next(error);
  }
});

// Get a student by id
router.get("/:id", async (req, res, next) => {
  try {
    /* const {
      rows: [student],
    } = await db.query(
      "SELECT * FROM student WHERE id = $1 AND instructorId = $2",
      [req.params.id, req.user.id]
    ); */

    const student = await prisma.student.findUnique({
      where: {
        id: parseInt(req.params.id),
        instructorId: req.user.id,
      },
    });

    if (!student) {
      return res.status(404).send("Student not found.");
    }

    res.send(student);
  } catch (error) {
    next(error);
  }
});

// Create a new student
router.post("/", async (req, res, next) => {
  try {
    /* const {
      rows: [student],
    } = await db.query(
      "INSERT INTO student (name, cohort, instructorId) VALUES ($1, $2, $3) RETURNING *",
      [req.body.name, req.body.cohort, req.user.id]
    ); */

    const { name, cohort } = req.body;

    const student = await prisma.student.create({
      data: {
        name,
        cohort,
        instructorId: req.user.id,
      },
    });

    res.status(201).send(student);
  } catch (error) {
    next(error);
  }
});

// Update a student
router.put("/:id", async (req, res, next) => {
  try {
    /* const {
      rows: [student],
    } = await db.query(
      "UPDATE student SET name = $1, cohort = $2 WHERE id = $3 AND instructorId = $4 RETURNING *",
      [req.body.name, req.body.cohort, req.params.id, req.user.id]
    ); */

    const { name, cohort } = req.body;

    const student = await prisma.student.update({
      where: {
        id: parseInt(req.params.id),
        instructorId: req.user.id,
      },
      data: {
        name,
        cohort,
      },
    });

    if (!student) {
      return res.status(404).send("Student not found.");
    }

    res.send(student);
  } catch (error) {
    next(error);
  }
});

// Delete a student by id
router.delete("/:id", async (req, res, next) => {
  try {
    /* const {
      rows: [student],
    } = await db.query(
      "DELETE FROM student WHERE id = $1 AND instructorId = $2 RETURNING *",
      [req.params.id, req.user.id]
    ); */

    const student = await prisma.student.delete({
      where: {
        id: parseInt(req.params.id),
        instructorId: req.user.id,
      },
    });

    if (!student) {
      return res.status(404).send("Student not found.");
    }

    res.send(student);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
