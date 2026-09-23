import mysql from "mysql2/promise";

// El pool se guarda en `globalThis` para que el hot-reload de `next dev` no
// abra un pool nuevo en cada recarga de este módulo.
const globalForDb = globalThis as unknown as { dbPool?: mysql.Pool };

export const db =
  globalForDb.dbPool ??
  mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.dbPool = db;
}

// Mismo contenido que sql/auditoria_comercial_respuestas.sql.
const CREATE_TABLE = `CREATE TABLE IF NOT EXISTS auditoria_comercial_respuestas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  razon_social VARCHAR(200) NOT NULL,
  nombre_cargo VARCHAR(200) DEFAULT NULL,
  email VARCHAR(255) DEFAULT NULL,
  ejecutivo VARCHAR(200) NOT NULL,
  p4_tiempo_respuesta VARCHAR(40) NOT NULL,
  p5_precision_tecnica VARCHAR(40) NOT NULL,
  p6_seguimiento VARCHAR(40) NOT NULL,
  p7_observacion TEXT DEFAULT NULL,
  p8_tramito_rma TINYINT(1) NOT NULL,
  p9_tiempo_resolucion VARCHAR(40) DEFAULT NULL,
  p10_claridad VARCHAR(40) DEFAULT NULL,
  p11_resolucion VARCHAR(40) DEFAULT NULL,
  p12_comentario TEXT DEFAULT NULL,
  p13_mejora TEXT DEFAULT NULL,
  ip_origen VARCHAR(64) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_created (created_at),
  INDEX idx_ejecutivo (ejecutivo),
  INDEX idx_tramito_rma (p8_tramito_rma)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`;

let tablaLista: Promise<void> | null = null;

function asegurarTabla(): Promise<void> {
  if (!tablaLista) {
    tablaLista = db
      .execute(CREATE_TABLE)
      // La pregunta "Nombre y cargo" se quitó del formulario. En tablas creadas
      // antes la columna era NOT NULL; se deja opcional (sin borrar datos
      // viejos). MODIFY con la misma definición no hace nada.
      .then(() =>
        db.execute(
          "ALTER TABLE auditoria_comercial_respuestas MODIFY nombre_cargo VARCHAR(200) DEFAULT NULL"
        )
      )
      .then(() => undefined)
      .catch((error) => {
        tablaLista = null; // reintentar en el próximo envío
        throw error;
      });
  }
  return tablaLista;
}

export interface NuevaRespuesta {
  razonSocial: string;
  email: string | null;
  ejecutivo: string;
  p4: string;
  p5: string;
  p6: string;
  p7: string | null;
  tramitoRma: boolean;
  p9: string | null;
  p10: string | null;
  p11: string | null;
  p12: string | null;
  p13: string | null;
  ipOrigen: string | null;
}

export async function guardarRespuesta(r: NuevaRespuesta): Promise<number> {
  await asegurarTabla();
  const [result] = await db.execute<mysql.ResultSetHeader>(
    `INSERT INTO auditoria_comercial_respuestas (
      razon_social, email, ejecutivo,
      p4_tiempo_respuesta, p5_precision_tecnica, p6_seguimiento, p7_observacion,
      p8_tramito_rma, p9_tiempo_resolucion, p10_claridad, p11_resolucion,
      p12_comentario, p13_mejora, ip_origen
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      r.razonSocial,
      r.email,
      r.ejecutivo,
      r.p4,
      r.p5,
      r.p6,
      r.p7,
      r.tramitoRma ? 1 : 0,
      r.p9,
      r.p10,
      r.p11,
      r.p12,
      r.p13,
      r.ipOrigen,
    ]
  );
  return result.insertId;
}
