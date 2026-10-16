-- AllInstant / T02.2: pruebas controladas, con ROLLBACK final.
-- Ejecutar DESPUÉS de 03_disponibilidad_producto_sede.sql.
BEGIN;

INSERT INTO productos (nombre) VALUES
('T02.2 PRUEBA: Menú A'),
('T02.2 PRUEBA: Bebida B');

-- Menú A está disponible en SMP y agotado en La Molina.
INSERT INTO disponibilidad_producto_sede (sede_id, producto_id, disponible)
SELECT s.sede_id, p.producto_id, (s.codigo = 'SMP')
FROM sedes s CROSS JOIN productos p
WHERE s.codigo IN ('SMP','LM')
  AND p.nombre = 'T02.2 PRUEBA: Menú A';

-- Bebida B se registra en SMP y queda agotada por defecto.
INSERT INTO disponibilidad_producto_sede (sede_id, producto_id)
SELECT s.sede_id, p.producto_id
FROM sedes s CROSS JOIN productos p
WHERE s.codigo = 'SMP'
  AND p.nombre = 'T02.2 PRUEBA: Bebida B';

DO $$
DECLARE
  estado_smp BOOLEAN;
  estado_lm BOOLEAN;
  estado_bebida BOOLEAN;
BEGIN
  SELECT d.disponible INTO STRICT estado_smp
  FROM disponibilidad_producto_sede d
  JOIN sedes s USING (sede_id)
  JOIN productos p USING (producto_id)
  WHERE s.codigo='SMP' AND p.nombre='T02.2 PRUEBA: Menú A';

  SELECT d.disponible INTO STRICT estado_lm
  FROM disponibilidad_producto_sede d
  JOIN sedes s USING (sede_id)
  JOIN productos p USING (producto_id)
  WHERE s.codigo='LM' AND p.nombre='T02.2 PRUEBA: Menú A';

  SELECT d.disponible INTO STRICT estado_bebida
  FROM disponibilidad_producto_sede d
  JOIN sedes s USING (sede_id)
  JOIN productos p USING (producto_id)
  WHERE s.codigo='SMP' AND p.nombre='T02.2 PRUEBA: Bebida B';

  IF NOT estado_smp OR estado_lm OR estado_bebida THEN
    RAISE EXCEPTION 'FALLÓ: estados iniciales o valor por defecto';
  END IF;
END;
$$;

-- Reponer Menú A en LM, sin afectar el valor de SMP.
UPDATE disponibilidad_producto_sede d
SET disponible = TRUE
FROM sedes s, productos p
WHERE d.sede_id = s.sede_id AND d.producto_id = p.producto_id
  AND s.codigo='LM' AND p.nombre='T02.2 PRUEBA: Menú A';

DO $$
DECLARE
  disponibles INTEGER;
BEGIN
  SELECT count(*) INTO disponibles
  FROM disponibilidad_producto_sede d
  JOIN sedes s USING(sede_id)
  JOIN productos p USING(producto_id)
  WHERE p.nombre='T02.2 PRUEBA: Menú A'
    AND s.codigo IN ('SMP','LM') AND d.disponible;

  IF disponibles <> 2 THEN
    RAISE EXCEPTION 'FALLÓ: restablecimiento en LM o independencia por sede';
  END IF;
END;
$$;

-- No se puede duplicar una combinación sede-producto.
DO $$
BEGIN
  BEGIN
    INSERT INTO disponibilidad_producto_sede(sede_id,producto_id,disponible)
    SELECT s.sede_id,p.producto_id,TRUE
    FROM sedes s CROSS JOIN productos p
    WHERE s.codigo='SMP' AND p.nombre='T02.2 PRUEBA: Menú A';
    RAISE EXCEPTION 'FALLÓ: permitió duplicar sede-producto';
  EXCEPTION
    WHEN unique_violation THEN NULL;
  END;
END;
$$;

SELECT 'T02.2: validaciones completadas; se revertirán los datos ficticios' AS resultado;
ROLLBACK;
