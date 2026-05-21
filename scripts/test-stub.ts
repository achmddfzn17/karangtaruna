// Delete DATABASE_URL to force build stub
delete process.env.DATABASE_URL;

import prisma from "../src/lib/prisma";

async function test() {
  console.log("Testing build-safe prisma proxy...");
  console.log("Is build stub?", (prisma as any).isBuildStub);

  try {
    // Try to access and invoke nested properties on the stub
    console.log("Accessing prisma.anggota...");
    const anggota = (prisma as any).anggota;
    console.log("typeof anggota:", typeof anggota);

    console.log("Accessing prisma.anggota.count...");
    const countFn = anggota.count;
    console.log("typeof countFn:", typeof countFn);

    console.log("Invoking prisma.anggota.count()...");
    const result = await countFn();
    console.log("Result of count():", result);

    console.log("Invoking prisma.anggota.findMany()... ");
    const resultMany = await (prisma as any).anggota.findMany({ where: { id: 1 } });
    console.log("Result of findMany():", resultMany);

    console.log("SUCCESS! The build-safe proxy works flawlessly.");
  } catch (error) {
    console.error("FAILED! Error encountered:", error);
  }
}

test();
