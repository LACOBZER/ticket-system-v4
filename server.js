/*
 IT Support Ticket System
 Entwickelt von: Luciana Bezerra
 Jahr: 2026
 Backend mit Node.js + SQL Server
*/

import express from "express";
import cors from "cors";
import sql from "mssql";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

const dbConfig = {
  server: "VSRV-SQL\\SQLEXPRESS",
  database: "TicketDB",
  user: "sa",
  password: "DEIN_PASSWORT",
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

async function getConnection() {
  return await sql.connect(dbConfig);
}

app.get("/api/tickets", async (req, res) => {
  const pool = await getConnection();
  const result = await pool.request().query("SELECT * FROM Tickets ORDER BY id DESC");
  res.json(result.recordset);
});

app.post("/api/tickets", async (req, res) => {
  const t = req.body;
  const pool = await getConnection();

  await pool.request()
    .input("number", sql.NVarChar(50), t.number)
    .input("participant", sql.NVarChar(100), t.participant)
    .input("customer", sql.NVarChar(100), t.customer)
    .input("subject", sql.NVarChar(200), t.subject)
    .input("description", sql.NVarChar(sql.MAX), t.description)
    .input("priority", sql.NVarChar(50), t.priority)
    .input("status", sql.NVarChar(50), "open")
    .input("notes", sql.NVarChar(sql.MAX), "[]")
    .query(`
      INSERT INTO Tickets
      (number,participant,customer,subject,description,priority,status,notes,created)
      VALUES
      (@number,@participant,@customer,@subject,@description,@priority,@status,@notes,GETDATE())
    `);

  res.json({ success: true });
});

app.put("/api/tickets/:id", async (req, res) => {
  const pool = await getConnection();

  await pool.request()
    .input("id", sql.Int, req.params.id)
    .input("status", sql.NVarChar(50), req.body.status)
    .input("notes", sql.NVarChar(sql.MAX), req.body.notes)
    .query("UPDATE Tickets SET status=@status, notes=@notes WHERE id=@id");

  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log("Server läuft auf http://localhost:" + PORT);
});
