import express from "express";
import { assertValid, validateEPkt } from "@hmpl/common";
import { hashObject } from "@hmpl/common";

const app = express();
app.use(express.json({ limit: "256kb" }));

app.get("/health", (_req, res) => res.json({ ok: true, service: "dash-gateway" }));

app.post("/v1/event", (req, res) => {
  try {
    assertValid(validateEPkt, req.body, "E-PKT");
    const digest = hashObject(req.body);
    res.json({ accepted: true, digest });
  } catch (e: any) {
    res.status(400).json({ accepted: false, error: e?.message ?? String(e) });
  }
});

app.listen(8080, () => console.log("dash-gateway on :8080"));
