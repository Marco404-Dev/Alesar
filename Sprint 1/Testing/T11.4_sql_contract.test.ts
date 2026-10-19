import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const sql = readFileSync(fileURLToPath(new URL("../Codigo/T11.4_migracion_avisos_preparacion.sql", import.meta.url)), "utf8");
const roles = readFileSync(fileURLToPath(new URL("../Codigo/T11.4_privilegios_operativos.sql", import.meta.url)), "utf8");
const rollback = readFileSync(fileURLToPath(new URL("../Codigo/T11.4_reversion_avisos_preparacion.sql", import.meta.url)), "utf8");

describe("contrato SQL T11.4 sin acceso a Neon", () => {
  it("bloquea cada pedido antes de las tres operaciones concurrentes", () => {
    for (const name of ["terminar_preparacion", "confirmar_listo", "entregar_pedido"]) {
      const body = sql.match(new RegExp(`CREATE FUNCTION public\\.fn_t114_${name}\\([\\s\\S]*?END \\$fn\\$;`))?.[0];
      expect(body, name).toContain("FOR UPDATE");
    }
    expect(sql).toContain("UNIQUE REFERENCES public.pedidos");
    expect(sql).toContain("ON CONFLICT (pedido_id) DO NOTHING");
  });

  it("exige aviso confirmado y mantiene el historial T11.2/T11.3", () => {
    expect(sql).toContain("a.confirmado_en IS NOT NULL");
    expect(sql).toContain("CREATE TRIGGER trg_t114_exigir_aviso_listo");
    expect(sql).not.toContain("CREATE OR REPLACE FUNCTION public.fn_controlar_estado_pedido");
    expect(sql).not.toContain("DROP TRIGGER trg_historial");
  });

  it("resuelve los triggers históricos sin permitir sombras temporales y confirma una fila por transición", () => {
    expect(sql).toContain("El esquema public concede CREATE a PUBLIC");
    expect((sql.match(/SET search_path = pg_catalog, public, pg_temp AS \$fn\$/g) ?? []).length).toBe(7);
    expect(sql).toContain("La confirmación no actualizó exactamente un pedido");
    expect(sql).toContain("La entrega no actualizó exactamente un pedido");
  });

  it("roles operativos sin DML y reversión que conserva avisos", () => {
    expect(roles).toContain("CREATE ROLE allinstant_t114_kitchen NOLOGIN");
    expect(roles).toContain("CREATE ROLE allinstant_t114_dispatch NOLOGIN");
    expect(roles).not.toMatch(/GRANT\s+(INSERT|UPDATE|DELETE)\s+ON/i);
    expect(roles).toContain("Faltan permisos T11.4 necesarios para lectura, cocina o despacho");
    expect(roles).toContain("Algún rol T11.4 puede invocar funciones de otra área");
    const executableRollback = rollback.replace(/--[^\r\n]*/g, "");
    expect(executableRollback).not.toMatch(/DROP TABLE|DELETE FROM|TRUNCATE/i);
    expect(rollback).toContain("DROP TRIGGER IF EXISTS trg_t114_exigir_aviso_listo");
  });
});
