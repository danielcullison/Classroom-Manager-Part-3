const { PrismaClient } = require("@prisma/client");
const { faker } = require("@faker-js/faker");

const prisma = new PrismaClient();

async function seed() {
  console.log("Seeding the database.");
  try {
    // Clear the database
    await prisma.student.deleteMany();
    await prisma.instructor.deleteMany();

    // Add 5 instructors
    const instructors = await Promise.all(
      [...Array(5)].map(() =>
        prisma.instructor.create({
          data: {
            username: faker.internet.userName(),
            password: faker.internet.password(),
          },
        })
      )
    );

    // Add 4 students for each instructor
    await Promise.all(
      [...Array(20)].map((_, i) =>
        prisma.student.create({
          data: {
            name: faker.person.fullName(),
            cohort: `Cohort ${faker.number.int({ min: 1, max: 10 })}`,
            instructorId: instructors[i % instructors.length].id,
          },
        })
      )
    );

    console.log("Database is seeded.");
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

// Seed the database if we are running this file directly
if (require.main === module) {
  seed();
}

module.exports = seed;
