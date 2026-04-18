const assert = require("node:assert/strict");
const app = require("../app");

async function run() {
  const server = app.listen(0);
  try {
    const { port } = server.address();
    const response = await fetch(`http://127.0.0.1:${port}/health`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(body, { status: "ok" });
    console.log("PASS health endpoint returns expected response");
  } finally {
    server.close();
  }
}

run().catch((error) => {
  console.error("FAIL health endpoint test:", error);
  process.exitCode = 1;
});
