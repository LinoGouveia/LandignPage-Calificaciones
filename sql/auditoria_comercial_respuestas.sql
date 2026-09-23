-- Auditoría de Eficiencia Operativa y Comercial (formulario a clientes sobre
-- el Ejecutivo de Ventas y el Departamento de RMA).
-- Ejecutar en supricom_panel. Las columnas p4..p11 guardan la clave de la
-- opción elegida (ver lib/auditoria.ts para el texto de cada una).

CREATE TABLE IF NOT EXISTS auditoria_comercial_respuestas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  razon_social VARCHAR(200) NOT NULL,
  nombre_cargo VARCHAR(200) DEFAULT NULL, -- pregunta retirada del formulario
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
