
const fs = require("fs")


let manifest = JSON.parse(fs.readFileSync("./manifest.json", "utf-8"))

test(`[none Manifest] Same version on student-client and teacher-server`, async () => {
    expect(manifest.apps.client.version).toBe(manifest.apps.server.version)
});
test(`[none Manifest] Same date on student-client and teacher-server`, async () => {
    expect(manifest.apps.client.date).toBe(manifest.apps.server.date)
});
test(`[none Manifest] Same author on student-client and teacher-server`, async () => {
    expect(manifest.apps.client.author).toBe("Sylicium")
    expect(manifest.apps.server.author).toBe("Sylicium")
});