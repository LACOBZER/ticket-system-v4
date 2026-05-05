import express from "express";
import cors from "cors";
import sql from "mssql";

const app = express();
app.use(cors());
app.use(express.json());

const config = {
  server: "VSRV-SQL\\SQLEXPRESS",
  database: "TicketDB",
  user: "sa",
  password: "DEIN_PASSWORT",
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

app.get("/api/tickets", async (req,res)=>{
  const pool = await sql.connect(config);
  const result = await pool.request().query("SELECT * FROM Tickets ORDER BY id DESC");
  res.json(result.recordset);
});

app.post("/api/tickets", async (req,res)=>{
  const t = req.body;
  const pool = await sql.connect(config);

  await pool.request()
    .input("number", sql.NVarChar, t.number)
    .input("participant", sql.NVarChar, t.participant)
    .input("subject", sql.NVarChar, t.subject)
    .input("description", sql.NVarChar, t.description)
    .input("status", sql.NVarChar, t.status)
    .input("notes", sql.NVarChar, t.notes)
    .query(`
      INSERT INTO Tickets(number,participant,subject,description,status,notes,created)
      VALUES(@number,@participant,@subject,@description,@status,@notes,GETDATE())
    `);

  res.json({ok:true});
});

app.listen(3000);
