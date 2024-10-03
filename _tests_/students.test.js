const request = require("supertest");
const app = require("../server/app.js");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

describe("Student API Authorization", () => {
  let instructor1;
  let instructor2;
  let student1;
  let student2;

  beforeAll(async () => {
    instructor1 = await prisma.instructor.create({
      data: {
        name: "Instructor One",
      },
    });

    instructor2 = await prisma.instructor.create({
      data: {
        name: "Instructor Two",
      },
    });

    student1 = await prisma.student.create({
      data: {
        name: "Student One",
        cohort: "Cohort A",
        instructorId: instructor1.id,
      },
    });

    student2 = await prisma.student.create({
      data: {
        name: "Student Two",
        cohort: "Cohort B",
        instructorId: instructor2.id,
      },
    });
  });

  afterAll(async () => {
    await prisma.student.deleteMany({});
    await prisma.instructor.deleteMany({});
    await prisma.$disconnect();
  });

  it("should not allow instructor 4 to access students of instructor 5", async () => {
    const resGet = await request(app)
      .get(`/students/${student2.id}`)
      .set("Authorization", `Bearer ${instructor1.token}`);

    expect(resGet.statusCode).toEqual(404);
    const resPost = await request(app)
      .post("/students")
      .send({ name: "Unauthorized Student", cohort: "Cohort C" })
      .set("Authorization", `Bearer ${instructor1.token}`);

    expect(resPost.statusCode).toEqual(403);

    const resPut = await request(app)
      .put(`/students/${student2.id}`)
      .send({ name: "Updated Student", cohort: "Cohort B" })
      .set("Authorization", `Bearer ${instructor1.token}`);

    expect(resPut.statusCode).toEqual(404);

    const resDelete = await request(app)
      .delete(`/students/${student2.id}`)
      .set("Authorization", `Bearer ${instructor1.token}`);

    expect(resDelete.statusCode).toEqual(404);
  });

  it("should allow instructor 1 to access their own student", async () => {
    const resGet = await request(app)
      .get(`/students/${student1.id}`)
      .set("Authorization", `Bearer ${instructor1.token}`);

    expect(resGet.statusCode).toEqual(200);
    expect(resGet.body.name).toEqual(student1.name);
  });
});
