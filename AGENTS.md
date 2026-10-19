# AllInstant / ALESAR — instrucciones del repositorio

## Contexto y fuentes de verdad

- AllInstant gestiona pedidos anticipados de alimentos para recojo presencial en ALESAR: San Martín de Porres (`SMP`) y La Molina (`LM`). El trabajo se organiza por Scrum, historias, criterios BDD y evidencias por Sprint.
- Hay dos aplicaciones separadas: el prototipo de clientes Vite en `Sprint 1/Codigo/frontend/` y la aplicación operativa Next.js/TypeScript en la raíz. PostgreSQL está alojado en Neon; la aplicación operativa usa SSE y `LISTEN/NOTIFY`. No presupongas que ambos frontends están integrados ni que una funcionalidad documentada está implementada.
- Usa el código, las historias aprobadas y el esquema real como fuentes de verdad. Comprueba qué migraciones están aplicadas antes de depender de ellas. Para T11.2–T11.4, consulta la documentación y SQL específicos en `Sprint 1/Documentacion/`, `Sprint 1/Codigo/` y `Sprint 1/Testing/` según la tarea.

## Flujo de trabajo autónomo

- Inspecciona el estado de Git y los archivos relevantes; protege el trabajo local ajeno. Resuelve decisiones técnicas y defectos corregibles dentro del alcance, implementa, documenta y verifica lo necesario antes de informar. Solicita aclaración solo para decisiones funcionales de alcance sin respuesta aprobada o bloqueos reales.
- Reutiliza componentes y convenciones existentes. No cambies reglas de negocio establecidas ni afirmes que algo funciona sin verificación. Distingue entre implementado, revisado estáticamente, probado localmente, validado en Neon y pendiente.
- Delega solo cuando la sesión disponga de subagentes y existan tareas independientes que justifiquen su coste. El coordinador integra y revisa el resultado. Los agentes de proyecto en `.codex/agents/` son `desarrollo`, `base_datos`, `documentacion` y `revision_seguridad`; asigna archivos sin solapamiento y evita agentes para cambios pequeños. Si no hay subagentes, ejecuta estas revisiones secuencialmente.
- Al iniciar una sesión, lee primero `_codex_memoria/LEEME_PRIMERO.md`, `05_TAREA_ACTIVA.md` y `06_PENDIENTES.md`. Comprueba después Git y los archivos locales; contrasta Neon cuando afecte la tarea. Los archivos reales y el estado vigente de Git/Neon prevalecen sobre la memoria. Actualiza solo los documentos de memoria afectados al iniciar una tarea, tras cambios relevantes, migraciones, incidentes críticos, antes de cerrar sesión y antes de solicitar un push.

## Reglas funcionales permanentes

- Registra pedidos operativos solo después de confirmar el pago. Un pedido nuevo inicia en `PREPARANDO`; conserva `RECIBIDO` para compatibilidad histórica.
- Filtra cada consulta y escritura por sede en el servidor; no confíes solo en la sede enviada por el navegador.
- Cocina opera solo mediante `/control-cocina/smp` y `/control-cocina/lm`: muestra pedidos `PREPARANDO` sin aviso, productos y cantidades, permite comunicar una finalización y se actualiza por SSE. Las rutas históricas `/cocina/*` no existen.
- Despacho usa `/despacho/smp` y `/despacho/lm`: interfaz táctil por sede y orden cronológico, con ID, cliente, hora, estado y código de recojo, más una sección de preparaciones terminadas.
- `/control-cocina/smp` y `/control-cocina/lm` registran un aviso persistente de preparación terminada sin cambiar el estado. El flujo es `PREPARANDO → LISTO_RECOJO → ENTREGADO`: despacho confirma listo y verifica el código antes de entregar. Conserva historial y rechaza transiciones arbitrarias.
- T11.5 mantiene pruebas focalizadas para identificación válida, filtros por sede/estado/pago y fotos SSE de alta y retiro. La evidencia de video se identifica por archivo y formato; no atribuirle resultados no revisados.
- Las interfaces operativas no requieren login individual; protege las escrituras mediante controles del servidor y acceso restringido a dispositivos internos. No expongas endpoints de modificación sin protección.

## Neon y seguridad de datos

- Entorno de desarrollo autorizado: proyecto Neon `allinstant-dev`, rama `development`, base `neondb`. Confirma proyecto, rama, base y esquema real antes de migrar. Prepara recuperación o respaldo cuando sea posible; evalúa bloqueos y datos existentes, usa transacciones y límites de espera apropiados. Un `BEGIN`/`COMMIT` por sí solo no demuestra seguridad.
- Puedes realizar cambios aditivos compatibles y pruebas controladas en ese entorno conforme a los permisos de la sesión. Detente antes de borrar tablas con datos, usar `TRUNCATE`, alterar datos reales, ejecutar migraciones irreversibles, tocar producción o eliminar ramas con datos que deban conservarse. Si hay riesgo material sin recuperación, busca una alternativa segura y no ejecutes la operación. Respeta cualquier aprobación exigida por la herramienta o plataforma.
- Identifica inequívocamente los datos sintéticos antes de modificarlos o retirarlos. Usa privilegios mínimos. No imprimas secretos, URLs de conexión completas ni datos personales innecesarios; nunca incorpores `.env.local` a Git.

## Git, pruebas y documentación

- Conserva la rama activa y los cambios locales de una tarea en curso. En una tarea nueva, revisa `git status` y el `main` remoto disponible antes de decidir si hace falta una rama nueva. Se permiten commits locales seguros; no hagas `git push`, crees o fusiones PR, modifiques directamente `main`, fuerces el historial ni descartes trabajo ajeno sin autorización del usuario.
- Elige verificaciones focalizadas: diff, sintaxis, análisis estático, pruebas concretas y consultas SQL dirigidas. No ejecutes por rutina `npm install`, la suite completa, build, typecheck completo, navegador o capturas. Verifica lo indispensable cuando cambien integridad, migraciones, dinero, seguridad, estados, entregas, concurrencia o credenciales. Repite solo la prueba afectada tras corregir un fallo.
- Respeta `Sprint 1/Codigo/` para SQL, `Sprint 1/Documentacion/` para decisiones y trazabilidad, `Sprint 1/Testing/` para verificaciones y `Sprint 1/Pruebas/` para evidencias reales; aplica la estructura equivalente de otros Sprints. Documenta objetivo, reglas, implementación, BDD, pruebas y límites cuando aporten valor. No inventes capturas, videos ni resultados.
- Toda tarea de AllInstant requiere documentación técnica antes de considerarse completada, también T11.5 y tareas posteriores. Según su alcance, debe registrar historia y tarea, objetivo, requisitos y reglas, arquitectura y componentes, consultas/modelos/migraciones SQL, implementación, criterios BDD, trazabilidad, pruebas y resultados, evidencias, limitaciones y conclusiones. Los documentos describen solo lo realmente implementado y validado.
- Antes de entregar, revisa requisitos, historias, seguridad, integridad, compatibilidad, migraciones, documentación, pruebas, diff y estado Git. El informe final debe indicar tarea, estado, cambios, base de datos, verificaciones, seguridad, rama/commits y `LISTO PARA REVISIÓN ANTES DEL PUSH` o `NO LISTO PARA PUBLICACIÓN`. Pide aprobación del usuario antes de publicar en GitHub.
