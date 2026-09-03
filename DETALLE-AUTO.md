# Detalle del auto: de un botón a un plan por manual

**Fixly · setiembre 2026 · plan de iteración, validación de factibilidad y kit de prompts portable**

Este documento responde a una sola pregunta: cómo pasar del botón "Mapa de mantenimiento" a una vista donde el conductor **ve** cuánto le falta para cambiar el aceite (y los demás ítems del manual), dibujado de forma nítida, sin que la app tenga ningún dato del auto. Incluye lo que dice el video de referencia, lo que falta hoy en el código, el modelo de datos que lo hace posible, todas las opciones de dibujo (2D, Skia, 3D) y un paquete de prompts en inglés para que cualquier agente (Claude, ChatGPT, DeepSeek) construya cada pieza en su propio chat.

No hay implementación aquí. Hay análisis, decisiones y prompts.

---

## 0. Cómo usar este documento con otro agente

El kit está en la sección 8. Funciona así:

1. Abre un chat nuevo en el agente que vayas a usar.
2. Pega **P0 (bloque de contexto)** primero, siempre. Sin P0 el agente inventa tokens, copy y reglas.
3. Pega el prompt de la tarea (P1, P2, …). Cada prompt dice qué archivos de la carpeta `detalle-auto/` debes pegar a continuación, si los necesita.
4. Verifica con la lista de aceptación que cierra cada prompt. Si el agente no la cumple, pégale la lista y pídele que corrija solo eso.
5. Los prompts son independientes salvo donde dice `Depende de:`. Puedes probar P4 (medidor de aceite) sin haber hecho P1.

Archivos adjuntos en `detalle-auto/`:

| Archivo | Qué es | Lo usa |
|---|---|---|
| `wear-types.ts` | Tipos TypeScript del modelo de desgaste (manual + registros del usuario) | P1, P2, P4, P5, P6 |
| `wear-engine.ts` | Motor puro `estimateWear()` / `estimateAll()`, compila con `tsc --strict`, 14 escenarios probados | P1, P6, P10 |
| `wear-test.ts` | Escenarios de prueba del motor | P1 |
| `maintenance-spec.schema.json` | JSON Schema del manual extraído | P9 |
| `manual-extraction-prompt.md` | Prompt de extracción para correr sobre un manual | P9 |
| `video-analysis.json` | Desglose cuadro a cuadro del video de referencia | P5, P10 (opcional) |
| `code-audit.json` | Auditoría del código actual con brechas y severidad | P2, P6 |
| `feasibility.json` | Veredicto de factibilidad, catálogo de componentes, casos borde, reglas de copy, notas legales | P1, P6, P9 |
| `tech-research.json` | Matriz de tecnologías con 63 afirmaciones y sus fuentes | P7, P8 |

Idioma: el documento está en español porque el proyecto lo está. Los prompts están en inglés porque los modelos responden mejor y porque el código va en inglés; el copy que el usuario ve va siempre en español peruano, y cada prompt lo exige.

---

## 1. Interrogatorio (grillme) — antes de dibujar nada

Las preguntas del método, respondidas con la evidencia que ya existe en el repo (DESIGN.md, NEGOCIO.md, el código) y en el video. Lo que solo Victor puede contestar va marcado como **ABIERTA**.

### Usuario y trabajo real

**¿Quién es el usuario concreto?**
Ya está definido y no hay que inventarlo: conductor de aplicativo, unos 45 años, auto propio de 8 a 15 años, no sabe de mecánica, Android de gama baja, al sol, pantalla sucia, a veces manejando (DESIGN.md). El video de referencia está diseñado para otro usuario: dueño de un Mercedes eléctrico de 2025 con sensores en todo. Copiar su pantalla sin cambiar el trabajo que resuelve es el error más fácil de cometer aquí.

**¿Qué trabajo real "contrata" a esta pantalla?**
No es "ver la salud del auto en tiempo real" (eso es lo que vende el video). Es responder tres preguntas en el orden en que le duelen al conductor:
1. ¿Me toca cambiar algo ya? (aceite primero, porque es lo más frecuente y lo que más le cobran)
2. ¿Cuánto me falta, en kilómetros o en días, lo que llegue primero?
3. ¿Cuánto me va a costar y qué debería incluir, para que no me metan cosas de más?
El "detalle del auto" es la respuesta visual a (1) y (2). La (3) ya existe en `servicio/[id].tsx`.

**¿Cuándo y dónde lo usa?**
Tres momentos plausibles, y cada uno pide una cosa distinta de la pantalla:
- Entre carreras, con el celular en la mano: quiere la respuesta en 3 segundos, sin tocar nada. Por eso el home tiene que MOSTRAR el desgaste, no un botón.
- En el taller, cuando el mecánico dice "le toca cambiar el refrigerante": abre la app para verificar. Ahí necesita "según el manual: cada 40,000 km o 2 años; última vez: no registrado". Es el momento donde el mapa por zonas tiene sentido (¿dónde está eso, qué es?).
- Cuando llega un recordatorio: quiere saber qué hacer y cuánto cuesta.
**ABIERTA:** ¿cuál de los tres es el momento número uno para ti? Cambia qué pantalla se optimiza primero.

### Problema y valor

**¿Qué pasa si NO lo construyes?**
Poco, hoy. La app ya tiene el plan por kilometraje (`plan.tsx`) y el detalle del servicio. Lo que falta no es una pantalla bonita: es el **cálculo de cuándo toca** (hoy `next: true` es un booleano escrito a mano en el mock, no un cálculo) y un lugar donde se vea sin buscar. Si construyes el mapa 3D antes que el cálculo, tienes un dibujo que señala datos inventados.

**¿Dónde está el valor de verdad: en el dato o en cómo se muestra?**
En el dato y en su honestidad. La estimación "te faltan 1,200 km o 23 días" es el producto. El dibujo del auto es una ayuda de comprensión para alguien que no sabe qué es un filtro de aire ni dónde está. Vale, pero es entrega, no valor. Consecuencia: el orden correcto es algoritmo → medidor de aceite en el home → mapa por zonas → coreografía. Nunca al revés.

**¿Cómo lo resuelve la gente hoy y por qué no basta?**
Con el sticker del lubricentro en el parabrisas ("próx. cambio 92,400 km"), la memoria y el WhatsApp del mecánico. El sticker es el competidor real del medidor de aceite, y es bueno: gratis, siempre visible, sin app. Para ganarle, el medidor tiene que hacer lo que el sticker no puede: convertir el kilometraje en **días**, cubrir los otros seis componentes que no tienen sticker, y avisar antes. Si el medidor solo repite el sticker, no aporta.

### Riesgo y supuestos

**¿Cuál es el supuesto MÁS riesgoso?**
Que el usuario va a mantener actualizado su kilometraje. Todo el modelo depende de un único dato que solo él puede dar. Si lo escribe una vez y nunca más, cada medidor se congela y a los dos meses miente. No es un riesgo técnico, es de adopción, y hay que diseñar la captura de kilometraje como parte de esta pantalla, no como un campo escondido en la ficha del vehículo (`vehiculo.tsx`, donde está hoy).
**ABIERTA:** ¿con qué frecuencia y por qué canal vas a pedir el kilometraje (al abrir la app, notificación semanal, foto del tablero)? ¿Aceptas estimar por promedio diario cuando no responde, con la etiqueta "estimado"?

**¿Qué tendría que ser verdad para que funcione?**
1. Que existan los intervalos del manual para el modelo del usuario (NEGOCIO.md lo pone como Hito 4, mes 4 a 6, y solo si ≥25 % de los usuarios lo piden).
2. Que el usuario registre el kilometraje al menos una vez al mes.
3. Que registre, aunque sea aproximado, su último cambio de aceite (para autos usados: "no sé" es una respuesta válida y hay que diseñarla).
4. Que la estimación se presente como estimación y aun así le crea más que al sticker.

**¿Qué es lo más probable que te haga fracasar?**
Adopción, no técnica. El SVG, Skia o 3D se resuelven en días. Que 10,000 conductores actualicen su kilometraje no se resuelve con código.

### Alcance y trampas

**¿Qué NO vas a hacer en esta versión?**
- Un "escaneo" animado de 10 segundos con barra de progreso. En el video escanea sensores; Fixly no tiene sensores, así que un escaneo es teatro y además rompe la regla de los 240 ms de DESIGN.md. Lo que sí cabe es la **revelación**: los componentes entran escalonados, ordenados por gravedad, en menos de un segundo total.
- Lenguaje de diagnóstico ("detectamos", "el motor está…", "temperatura"). NEGOCIO.md: informar y explicar, nunca diagnosticar.
- 3D real en la primera versión (se evalúa abajo, con números).
- Cubrir los 20 componentes el día uno. Aceite y cinco o seis ítems del manual bastan para validar.

**Si solo pudieras entregar UNA cosa, ¿cuál?**
El medidor de aceite en el home, con "te faltan X km o Y días, lo que llegue primero", la fecha proyectada, y un solo toque para actualizar el kilometraje. Todo lo demás cuelga de eso.

**¿Qué estás construyendo por costumbre o ego?**
El auto que gira en 3D y el escaneo del video. Son de Dribbble, no de un conductor de Yaris 2015 con el celular al sol. Tú mismo dijiste que el rendimiento y la interacción del usuario son lo primero: un modelo 3D en un Android de gama baja es lo contrario de eso.

### Costo del error

**Si el producto se equivoca, ¿cuál es el costo?**
Asimétrico. Si dice "te faltan 2,000 km" y en realidad ya venció, el usuario desgasta el motor y deja de creerle a la app. Si avisa demasiado pronto, gasta S/130 antes de tiempo. Por eso: (a) los umbrales se inclinan a lo conservador ("pronto" al 80 %, "toca" al 100 %); (b) siempre se muestra la base del cálculo ("según el manual + tu último registro"); (c) siempre hay un nivel de confianza visible; (d) el usuario puede corregir cualquier dato en dos toques.

### Preguntas que siguen abiertas (solo Victor)

1. ¿Momento de uso número uno: entre carreras, en el taller o al recibir el aviso?
2. ¿Frecuencia y canal para pedir el kilometraje? ¿Estimación por promedio cuando falta?
3. ¿Cuáles son los primeros 10 modelos de la base de manuales y tienes ya algún PDF? (NEGOCIO.md sugiere Toyota, Kia, Hyundai primero; luego Changan, Chery, Jetour.)
4. Para un auto usado sin historial (la mayoría de tu parque), ¿aceptas que el estado inicial sea "sin datos, regístralo" en vez de inventar una fecha?
5. ¿Esto se construye antes o después del Hito 4 de NEGOCIO.md? Si es antes, ¿es un prototipo para vender la idea o producto para usuarios?
6. ¿Usas Expo Go o un development build hoy? Skia y 3D exigen development build (EAS o local).
7. El tema: la app móvil es clara con acento verde; DESIGN.md es oscuro con dorado. ¿Cuál manda de aquí en adelante? Este documento asume el de la app (claro, verde) porque es lo que hoy se renderiza.

```
PROBLEMA AFILADO: El conductor no sabe cuándo le toca cambiar el aceite (ni los otros
cinco o seis ítems del manual) ni cuánto le falta en km o días, y hoy lo resuelve con un
sticker del parabrisas y la palabra del mecánico. Fixly puede calcularlo con solo dos
fuentes, el manual del propietario y lo que el usuario registra, sin ningún dato del
auto, siempre que lo presente como estimación y capture el kilometraje sin fricción.

USUARIO: Conductor de aplicativo, ~45 años, auto propio de 8 a 15 años, no sabe de
mecánica, Android de gama baja, al sol, entre carreras o parado en un taller.

SUPUESTO MÁS RIESGOSO: Que el usuario actualizará su kilometraje con regularidad. Si no
lo hace, cada medidor se congela y miente. Validar antes que el dibujo.

FUERA DE ALCANCE (por ahora): escaneo animado tipo sensor, lenguaje de diagnóstico,
3D real, cobertura de todos los componentes, cualquier dato que no venga del manual
o del usuario.

LISTO PARA: pasar a /goal (una frase medible; propuesta: "en 3 segundos, sin tocar nada,
el conductor ve cuántos km o días le faltan para el cambio de aceite, con la base del
cálculo visible").
```

---

## 2. El video de referencia: qué hace y qué no aplica

Video de 13 s, 1600×1200, 60 fps. Es una pieza de Dribbble para un Mercedes EQE SUV eléctrico ("Smart health"). Se analizó cuadro a cuadro a 2 fps y a 10 fps en las transiciones; el desglose completo está en `detalle-auto/video-analysis.json`.

### 2.1 La interacción, en abstracto

```
VISTA GENERAL  →  MAPA  →  ENFOCAR UN SISTEMA  →  REVELACIÓN PROGRESIVA  →  VEREDICTO + LISTA
```

1. **Vista general (Home).** Identidad del auto, chip "Updated", foto del auto, tres números grandes (batería 83 %, autonomía 248 mi, temperatura 24.2 °C), "Recent alerts".
2. **Mapa ("Diagnostic").** Un solo dibujo técnico del auto visto desde arriba, trazos grises de ~0.5–1 pt sobre fondo #f2f2f2, un punto naranja de 8 pt sobre el capó, y cuatro chips de sistema (Battery · HVAC • · Drive Unit · Electronics). El chip HVAC lleva el punto de alerta.
3. **Enfocar (tap en HVAC, t = 2.9 s).** El encabezado y los chips se desvanecen (300 ms), el dibujo escala ~1.9× con origen en el capó (400 ms), y entra un HUD: barra de progreso con porcentaje, pila de tarjetas que narra componentes, un tooltip vacío anclado al dibujo y una píldora con controles (replay · pausa · más).
4. **Revelación (3.4 s → 7.5 s, ~4 s).** Tres compases de ~1.3 s: (a) el esquema del sistema aparece sobre el wireframe subiendo de 15 % a 100 % de opacidad mientras la tarjeta dice "Cabin HVAC unit"; (b) aparecen cinco marcadores blancos con 100 ms de escalón y el tooltip se llena campo por campo ("COP 4.2", "CT •71 °C") mientras la tarjeta dice "Coolant reservoir"; (c) el estado se resuelve de golpe: el radiador se tiñe de verde, un marcador naranja cae sobre la pieza caliente, las tuberías toman color rojo/azul, y la tarjeta dice "Heat pump running warm". La barra desacelera y se detiene en una muesca a 80 %.
5. **Veredicto (8.0 s → 8.9 s).** La píldora desaparece, entra un encabezado ("Climate (EV) · Today 08:14"), la tarjeta narradora crece hasta ser la tarjeta de veredicto (triángulo naranja, título, explicación, "Consider a service check within 30 days"), y debajo entran escalonadas las filas de "Components status". Un enlace "↻ Rescan" y un botón negro "Get to fix". El dibujo se desvanece bajo la lista.

Todo lo demás (los dos teléfonos, el zoom de cámara, el cursor, el teléfono que sube y baja) es presentación de Dribbble, no interfaz. A 10 fps no se ve ninguna rotación 3D del auto: el teléfono se desliza y se desvanece.

### 2.2 Lo que solo funciona con sensores (imposible en Fixly)

Batería 83 % y "1h 23m", autonomía, temperatura, el chip "Updated", el punto de alerta colocado por el auto, la idea misma de un "escaneo" con progreso, "COP 4.2", "CT 71 °C", "RP Optimal", "8 °C above the baseline", "Optimal level, ELR 16", "28 °C · Optimal", "Today 08:14" como hora del escaneo, el 80 % como índice de salud, "Rescan", y que "Get to fix" salga de una falla detectada. Ninguna de estas cosas puede existir en Fixly sin mentir.

### 2.3 Lo que sí se transfiere (y cómo se traduce a manual + registros)

| Idea del video | Traducción honesta para Fixly |
|---|---|
| Un dibujo técnico neutro con un punto en la zona más urgente | El punto y el badge se calculan: la zona cuyo peor componente esté "toca" o "vencido" |
| Fila de chips de sistema bajo el dibujo | Zonas del manual: Motor, Refrigeración, Transmisión, Frenos, Llantas, Eléctrico, Cabina, Combustible |
| Tap en un sistema → zoom del dibujo + esquema de la zona | Una ilustración estática **por zona**, no por modelo: sump y filtro de aceite, caja del filtro de aire, bujías, tapa de la correa, depósito de refrigerante, batería |
| Revelación narrada, un compás por componente | "Revisión de tu plan": cada compás muestra un componente con su estado calculado (Al día · Pronto · Toca · Vencido · Sin datos), ordenado de peor a mejor, en menos de un segundo total y con "Saltar" |
| Tooltip con tres filas que se llenan | "Último cambio: 83,600 km (02 JUN 2026)" · "Próximo: 88,600 km" · "Te faltan ~530 km, aprox. 11 días" |
| Barra de progreso que aterriza en una muesca | **Esto es el medidor de aceite.** Relleno = intervalo consumido (km o meses, el que vaya más adelantado), muesca = el intervalo del manual (100 %), ventana ámbar antes |
| Momento de resolución (siluetas verdes, marcador naranja) | Tinte por estado calculado, siempre acompañado de la palabra ("Al día", "Pronto", "Toca") por la regla de nunca color solo. Rojo sí se usa: "Vencido" es un estado real para este usuario |
| Tarjeta de veredicto: icono + título + explicación + consecuencia + ventana de tiempo | "Toca cambiar el aceite" / "Según el manual, cada 5,000 km o 6 meses. Lo cambiaste hace 4,500 km" / `whatIfSkipped` (ya existe en `data.ts`) / "Hazlo en los próximos 500 km o 11 días" |
| Lista "Components status" | Ítems de la zona ordenados por urgencia, subtítulo "Faltan 530 km · S/90–140", tap → `servicio/[id]` |
| "Today 08:14" y "Updated" como frescura | "Kilometraje: 87,400 km · actualizado hace 14 días" con tap para actualizar. Es la única señal "viva" que Fixly tiene y de ella depende todo |
| "Rescan" | "Actualizar kilometraje" (recalcula todo y puede repetir la revelación) |
| "Get to fix" | Dos acciones claras: "Registrar que ya lo hice" (primaria: escribe el registro y el dibujo se recolorea al instante) y "Agendar este servicio" (secundaria) |
| Colores rojo/azul en tuberías | Solo como identificación de fluido en el esquema estático (aceite ámbar, refrigerante azul, frenos morado), nunca como estado |

### 2.4 Dónde el video está mal para tu usuario

- Trazos de 0.5–1 pt en gris #9e9e9e sobre #f2f2f2: contraste ~1.7:1, invisible al sol en una pantalla sucia. Fixly necesita trazos de 1.5–2 px y contraste ≥ 4.5:1 en los trazos de componentes.
- Tipografía pequeña y gris: tooltips a 12 pt, cuerpo a 13–14 pt en #8a8a8a. Tu persona necesita ≥ 15 px para leer y secundarios en ≥ #555.
- Estado solo por color en varios sitios (punto naranja en chip, punto en fila, tinte verde sin palabra). Prohibido por DESIGN.md.
- Las tarjetas narradoras truncan la frase clave con "…" justo durante la animación.
- ~6 s desde el tap hasta poder leer el veredicto, sin "saltar". Un conductor en un semáforo necesita la respuesta en menos de 1 s con la animación como opcional.
- Jerga (COP, CT, RP, ELR 16, HVAC, heat pump). Fixly habla de aceite, bujías, correa.
- Objetivos táctiles de 30–42 pt. Fixly exige 56.
- Precisión falsa: "80 %", "8 °C above baseline". Fixly no mide nada y no debe insinuar diagnóstico.
- Capas translúcidas y desenfoque durante el zoom: caro en GPUs baratas y turbio en LCDs baratos.
- Ilustración por modelo (tornillos del compresor, aletas): imposible de producir por modelo. Fixly usa un esquema genérico por zona.
- Un solo punto en el mapa aunque haya 3–4 ítems vencidos; sin conteos ni prioridad.
- No aparece ningún número que tu usuario necesita: kilómetros, fechas, soles, qué pasa si no lo hace.

---

## 3. Lo que Fixly tiene hoy y todo lo que falta

Fuente: auditoría completa en `detalle-auto/code-audit.json`. Resumen de lo que importa para esta iteración.

### 3.1 El flujo actual

`estado.tsx` → fila "Mapa de mantenimiento" (un botón) → `mapa.tsx` (dibujo `SvgXml` 240×400 + dos puntos: motor, frenos) → `sistema/[zone].tsx` (lista de hitos del plan) → `servicio/[id].tsx` (tres datos, descripción, "Si no lo haces", checklist, botón "Agendar" sin `onPress`).

Cuatro saltos de navegación desde el home hasta la información del aceite, y **ninguna de las cuatro pantallas muestra desgaste, kilómetros restantes ni fecha**.

El estado de cada zona sale de un booleano escrito a mano (`next: true` en `mock/data.ts`), no de un cálculo. Con el mock actual, el aceite se cambió a los 80,000 km, el intervalo es 5,000 y el auto está en 87,400: lleva ~2,400 km de retraso y la app dice "Motor: Vigente". Ese es el bug conceptual que esta iteración corrige.

### 3.2 Todo lo que falta

**Bloqueantes (sin esto no hay "detalle"):**

| Qué falta | Dónde | Cómo se resuelve |
|---|---|---|
| Un cálculo de estado (al día / pronto / toca / vencido / sin datos) a partir de kilometraje + intervalo + último servicio | `lib/zones.ts` | Motor `estimateWear()` (sección 4, archivo `wear-engine.ts`) |
| Kilometraje del último servicio (`lastDoneAt` es solo fecha) | `mock/data.ts` | `ServiceRecord { componentIds[], date, odometerKm, kind, costPen, workshop }` |
| Intervalo en meses (los manuales dicen "X km o Y meses, lo que ocurra primero") | `mock/data.ts` | `ComponentSpec.normal { km, months }` + `severe` |
| Taxonomía de zonas: `'motor' \| 'frenos'` no tiene sitio para bujías, refrigerante, caja, correa, filtros, batería, llantas | `mock/data.ts`, `lib/zones.ts` | Sistema → Componente → Acción (replace / inspect / inspect_then_replace / rotate / no_schedule), 8 zonas |
| Cualquier visualización de desgaste (no hay barra, anillo ni "faltan X km") | `servicio/[id].tsx` | Medidor de intervalo (sección 7.2) |
| La vista de detalle en el home (hoy es un botón) | `estado.tsx:79-87` | `CarHealthCard`: dibujo + peor componente + anillo de aceite + frescura del km |

**Mayores:**

- `CarDiagram` es un string `SvgXml` opaco con `Pressable`s absolutos en porcentajes: no hay regiones, no hay animación por parte, dos sistemas de coordenadas, marcadores de 52 px efectivos (< 56), estado solo por color, `accessibilityLabel` sin estado.
- Toda la navegación es `slide_from_right`; no hay zoom, fundido, escalón ni trazo que se dibuje. Reanimated solo se usa en `Button`, `Switch` y `Skeleton`.
- `done`, `next` y el hito `km` absoluto se escriben a mano; "Próximo servicio" en el home y "Hoy" en el plan siguen el orden del array, no el kilometraje.
- `StatusMeta` es vocabulario de documentos (Vigente / Por vencer / Vencido) reutilizado para aceite y frenos. Falta "Sin registro".
- Ítems sin `lastDoneAt` (la correa) salen "ok" por defecto. Para un 2015 con 87,400 km la correa es **desconocida**, no está bien. Viola "nunca prometer datos que no existen".
- `HistoryEntry` es texto libre sin `componentId` ni km: no puede alimentar "última vez".
- `vehicle-context` es `useState`: el kilometraje se pierde al reiniciar. No hay librería de persistencia.
- Solo se guarda el último kilometraje; sin historial no hay km/día y "faltan 530 km" no puede convertirse en "≈ 11 días".
- Los intervalos viven inline en un mock de Yaris; no hay entidad de manual por marca/modelo/año, ni fuente, ni variante de uso severo (aplicativo = "uso severo" en casi todos los manuales: aceite 5,000 en vez de 10,000).
- No existe la acción "ya lo hice / registrar": la única forma de alimentar el modelo.
- `mapa`, `sistema` y `servicio` importan `maintenancePlan` directamente y nunca llaman a `useVehicle()`: editar el kilometraje no cambia nada aguas abajo.
- `car-svg.ts` no tiene compartimento del motor, ni capa inferior, ni ids ni grupos; ~45 % de sus nodos son rayitas decorativas de las llantas.

**Menores:** puntos de estado solo por color en `estado.tsx:123` y en los marcadores; `bodySmall` 13 px usado para texto de lectura (regla: ≥ 14); `Type.mono` no es monoespaciada y los números bailan al animarse; el halo `${color}33` de los marcadores roza el "resplandor" prohibido.

### 3.3 Conflictos con DESIGN.md que hay que decidir

- **Tema.** DESIGN.md es oscuro con dorado; `tokens.ts` es claro con verde. La app renderiza lo claro. Este documento asume claro/verde (pregunta abierta 7).
- **Acento = estado.** `Colors.accent` (#16a34a) es el mismo hex que `statusOk`. Un titular de aceite vencido pintado de acento diría "bien". Regla mínima: nunca usar `Colors.accent` para un valor que carga estado.
- **Ámbar sobre chip ámbar.** #f59e0b en texto de 11 px sobre #fef3c7 da ~2.3:1. Para el sol, el texto del estado "Pronto" debe ir en #b45309; #f59e0b queda para barras.
- **Fuentes.** DESIGN.md exige Barlow / Atkinson / Plex Mono; la app usa sistema por arranque en frío. Compromiso sin descarga: `Platform.select({ ios: 'Menlo', android: 'monospace' })` en los roles mono y `tabularNums` por defecto.
- **Gestos.** DESIGN.md permite solo tap y scroll vertical. El carrusel de tarjetas del video y su píldora replay/pausa quedan fuera; la revelación se dispara por tap y la lista es vertical.
- **Superposición.** DESIGN.md prohíbe elementos superpuestos; el tooltip flotante del video se convierte en tarjetas ancladas al lado o debajo del dibujo.

---

## 4. ¿Es factible sin datos del auto? Sí, como estimación

### 4.1 Veredicto

**Sí, es factible, como ESTIMACIÓN, nunca como medición.** "Cuándo cambiar el aceite" (y cada componente programado) se calcula con exactamente dos fuentes:

1. **El manual del propietario:** por componente, el intervalo en km **y** en meses, más el intervalo de "condiciones severas" cuando el manual lo imprime.
2. **Lo que el usuario registra:** lecturas de kilometraje con fecha, y servicios hechos con km y fecha.

La convención está confirmada en fuentes primarias: los manuales dicen "cada X km o Y meses, **lo que ocurra primero**". Toyota: 10,000 mi / 12 meses normal, 5,000 mi / 6 meses en "condiciones especiales", que incluyen explícitamente "taxi" y "caminos con polvo". Las marcas chinas vendidas en Perú usan la misma fórmula en español: Chery Perú 5,000 km o 6 meses; Geely 7,500 km o 12 meses; Changan 10,000 km o 6 meses. Un conductor de aplicativo en Lima cae legítimamente en la tabla severa **cuando el manual la tiene**.

Lo que el gráfico puede mostrar con honestidad: un anillo o barra por componente = máx(km consumidos / intervalo km, días consumidos / intervalo días), cuál de las dos pistas manda, km restantes, días restantes, fecha proyectada, una palabra de estado y una palabra de confianza.

Lo que NO puede mostrar: la condición física de nada (calidad del aceite, grosor de pastillas, salud de la batería). Sección 4.9.

### 4.2 Datos: del manual, del usuario, derivados

**Del manual (hechos, nunca texto):** verbo de acción por componente (cambiar / revisar / revisar y cambiar si hace falta / rotar / sin programa), intervalo normal km y meses (null si no lo da), intervalo severo km y meses **solo si el manual lo imprime**, lista de condiciones severas como códigos (`dusty_roads`, `short_trips`, `taxi_or_commercial`, …), excepción de primer servicio, criterio de reemplazo para ítems de inspección (grosor mínimo de pastilla en mm), variantes (motor, caja MT/AT/CVT, combustible), especificaciones de consumibles (5W-30, litros), referencia bibliográfica (edición, mercado, páginas). Nunca la frase del manual.

**Del usuario, y cuándo pedirlo:**

| Dato | Cuándo | Si falta |
|---|---|---|
| Marca, modelo, año (+ motor y caja si el manual divide líneas) | Onboarding paso 1 | Sin manual → el dibujo se ve sin estados (arranque en frío, 4.7) |
| Combustible y conversión GNV/GLP | Onboarding paso 1 | Se asume el del manual; se oculta el ítem de kit |
| Perfil de uso: ¿aplicativo? ¿polvo? ¿viajes cortos? ¿ciudad? | Onboarding paso 2, editable | Tabla normal; la app deja el recordatorio "Si manejas para aplicativo, dilo aquí" |
| **Kilometraje actual con fecha** (opcional por foto del tablero) | Onboarding paso 3, luego cada 14 días y después de cada servicio | Sin pista de km; solo pistas de tiempo |
| Segunda lectura ≥ 14 días después | Aviso automático | Se pregunta km por semana; si no, supuesto etiquetado |
| ¿Cuántos km manejas por semana? | Solo si las lecturas no bastan | Supuesto: 150 km/día aplicativo, 25 particular, ambos etiquetados "Supuesto" |
| Último servicio por componente: fecha + km, con opción "No sé" | Onboarding paso 4 para 4–6 ítems; el resto desde la ficha del componente | "Sin datos", confianza ninguna |
| Adquisición: fecha, km, ¿nuevo o usado? | Onboarding paso 1b | Sin la opción "asumir que se hizo al comprar" |
| Registro de servicio: componentes, fecha, km, S/, taller, tipo (cambiado / revisado bien / revisado: hay que cambiar) | Después de cada taller | El reloj sigue contando: pronto → toca → vencido. Correcto: la app solo sabe lo que se registró |
| Resultado de inspección ("¿Qué dijeron de las pastillas?") | Tras un servicio con ítem de inspección | Solo cuenta el intervalo de inspección |

**Derivados (recalculados en cada render, nunca persistidos como verdad):** `WearEstimate` con estado, confianza, pista que manda, % consumido, km restantes, días restantes, km de vencimiento, fecha proyectada, odómetro estimado hoy (y si es proyectado), km/día con su origen, razones (códigos) y datos faltantes (qué pregunta subiría la confianza).

### 4.3 El motor de cálculo

Está escrito, compila con `tsc --strict` y pasó 14 escenarios: `detalle-auto/wear-types.ts` (tipos) y `detalle-auto/wear-engine.ts` (motor). Es una función pura sin dependencias: `estimateWear(spec, records, readings, today, ctx) → WearEstimate`, y `estimateAll(...)` para el auto completo, más `sortByUrgency()`.

Cómo funciona, en orden:

1. **Limpia las lecturas.** Descarta fechas inválidas y futuras; un registro de servicio con km también es una lectura; se queda con la subsecuencia no decreciente más larga (un error de tipeo como 70,000 entre 84,300 y 91,500 se descarta con razón `reading_non_monotonic`, y la UI puede ofrecer corregirlo).
2. **Estima km/día.** De las lecturas (ventana reciente de 120 días, mínimo 14 días de separación, máximo plausible 600 km/día) → si no, de "km por semana" declarados → si no, supuesto por defecto etiquetado.
3. **Odómetro hoy.** Se proyecta hacia adelante desde la última lectura **solo** cuando el ritmo viene de lecturas o de km declarados. Un supuesto por defecto nunca mueve el odómetro: un supuesto no puede, por sí solo, poner algo en "vencido".
4. **Ancla.** El último evento que reinició el reloj: registro "cambiado" (o "revisado bien" para ítems de inspección), auto nuevo (fecha/km de compra), o "asumido al comprar" solo si el usuario lo tocó explícitamente. Si el registro no tiene km, se interpola entre lecturas y baja la confianza.
5. **Intervalo aplicable.** Normal; severo si el usuario declaró uso severo **y** el manual imprime tabla severa (si no, razón `severe_not_in_manual`, nunca un factor inventado); primer servicio si el auto es nuevo.
6. **Dos pistas.** km: usado = odómetro − ancla; tiempo: usado = hoy − fecha del ancla, con meses × 30.4375. `percentConsumed = máx(km, tiempo)`.
7. **Lo que ocurra primero.** Días restantes = mín(km restantes / km por día, días restantes por tiempo). `binding` dice cuál manda.
8. **Estado y confianza** (4.4 y 4.5).

Casos especiales que ya maneja: auto usado sin registros, una sola lectura, lecturas desordenadas, fechas futuras, registro sin km, dos lecturas a menos de 14 días, ritmo implausible, auto parado (ritmo 0), lectura vieja (>45 días) y muy vieja (>120 días), ítems solo por tiempo (plumillas, líquido de frenos), ítems solo por km sin lectura, inspección que dijo "hay que cambiar" (fuerza "toca" hasta que llegue un "cambiado"), componentes sin programa en el manual (cadena, caja sellada), manual dividido por caja cuando la caja es desconocida, spec placeholder / escrito por el usuario / sin revisar.

### 4.4 Estados y copy

| Estado | Regla | Etiqueta | Plantilla de explicación |
|---|---|---|---|
| **Vencido** | `% ≥ 1 + gracia` (gracia 10 %, 5 % si es de seguridad) | Vencido / Revisión vencida | "Según el manual, {componente} va cada {km} km o {meses} meses, lo que ocurra primero. Desde el último cambio que registraste ({fecha}, {km} km) llevas {usadoKm} km y {usadoDías} días. Se pasó hace {excesoKm} km (estimado con tu kilometraje). Si no lo haces: {whatIfSkipped}." |
| **Toca ahora** | `% ≥ 1` dentro de la gracia, o faltan ≤ 300 km, o ≤ 7 días | Toca ahora / Toca revisar | "Según el manual, toca cambiar {componente} cada {km} km o {meses} meses. Estimado con tu kilometraje ({kmPorDía} km por día), le quedan ~{km} km, aprox. {días} días." |
| **Pronto** | faltan ≤ clamp(20 % del intervalo, 500, 5,000) km o ≤ clamp(20 %, 14, 60) días | Pronto / Revisar pronto | "Llevas {usado} de {intervalo} km ({porcentaje} %). Al ritmo que registraste, tocaría aprox. el {fecha} o a los {km} km." |
| **Al día** | nada de lo anterior y hay ancla | Al día / Revisión al día | "Llevas {usado} km y {días} días desde el último cambio que registraste. Próximo aprox. el {fecha} ({km} km)." |
| **Sin datos** | sin ancla, sin intervalo, sin programa, o ninguna pista calculable | Sin datos | "No registraste cuándo fue el último cambio de {componente}. Según el manual va cada {km} km o {meses} meses. {Si ya pasó un intervalo: Tu auto ya pasó los {km} km; si no sabes cuándo se hizo, pídele al taller que lo revise.} Regístralo o marca 'no sé'." |

La ventana "Pronto" escala con el intervalo: una correa de 100,000 km avisa ~5,000 km antes (tiempo para ahorrar); un aceite de 5,000 avisa 1,000 antes. "Vencido" exige pasarse un 10 % (5 % en seguridad) para no avergonzar a quien va 200 km tarde.

**Reglas de copy para no sonar a telemetría** (las más importantes; lista completa en `feasibility.json` → `copyRules`, y en P0):

- Todo intervalo se atribuye al manual: "Según el manual, cada 5,000 km o 6 meses, lo que ocurra primero". Si no está revisado: "según el manual (sin revisar aún)". Si lo escribió el usuario: "según lo que escribiste".
- Todo número restante se atribuye al kilometraje del usuario: "estimado con tu kilometraje", "al ritmo que registraste (~48 km por día)".
- Prohibido: "detectamos", "el auto reporta", "sensor", "lectura", "diagnóstico", "salud del motor", "estado del aceite", "nivel", "temperatura", "en tiempo real", "monitoreo", "escaneo".
- Nunca "vida útil restante" ni "% de vida". Se muestra el **intervalo consumido**: "Llevas 4,470 de 5,000 km del intervalo (89 %)". El anillo se titula "Intervalo" o "Cuánto llevas", no "Desgaste".
- Los supuestos se declaran en la misma tarjeta y se pueden corregir.
- Las fechas proyectadas llevan "aprox." y su condición: "aprox. el 14 de setiembre si sigues manejando ~48 km por día". En Perú se escribe "setiembre".
- Ítems de inspección usan "revisar", no "cambiar": nunca "te quedan X km de pastillas".
- Sin datos se dice sin datos, nunca "al día" por defecto.
- La confianza se dice en palabras: "Estimación confiable" / "Estimación aproximada" / "Estimación poco confiable — actualiza tu kilometraje". Nunca "73 %".
- Informar y explicar, nunca diagnosticar ni autorizar: prohibido "puedes seguir manejando", "está bien", "es urgente", "peligro".
- Vencido se explica con el exceso, sin alarma: "Vencido — se pasó 3,400 km del intervalo del manual". Sin signos de exclamación.
- Formato peruano: 87,400 km; S/130.00; "8 de setiembre". Botones en oración.

### 4.5 Confianza

Es una etiqueta sobre la **estimación**, no sobre el auto. Cuatro niveles: alta / media / baja / ninguna.

- Sin ancla → **ninguna** (no hay desde dónde contar).
- Puntaje 0–9: ancla por registro con km +3 (interpolado +2, inspección +2, "asumido al comprar" tope **baja**); si el componente usa km: ≥4 lecturas +2 (2–3: +1), última lectura ≤14 días +2 (≤45: +1, >120: tope baja), ritmo de lecturas con ≥30 días +2 (menos: +1; declarado +1; supuesto: tope media); ítems solo por tiempo +3 fijo; spec placeholder tope baja, escrito por el usuario tope media, sin revisor tope media.
- ≥7 alta, ≥4 media, si no baja; luego se aplica el tope más bajo.
- La frescura alimenta el aviso: `odometer_stale` (>45 d) y `odometer_very_stale` (>120 d) son lo que el home usa para preguntar "¿Cuántos km marca hoy?". `missingInputs` dice exactamente qué pregunta subiría la confianza.

### 4.6 Ejemplo canónico (úsalo en todos los prompts para comparar resultados)

Toyota Yaris 2015, 1.5 L, caja MT, gasolina, uso aplicativo. Hoy: 2026-09-03. Aceite y filtro: 5,000 km o 6 meses (manual revisado). Registros: cambio de aceite 2026-06-02 a 83,600 km; cambio de filtro de aire 2026-07-18 a 85,900 km. Lectura de kilometraje: 2026-08-20, 87,400 km.

Resultado esperado para `aceite_motor`: ritmo ≈ 48 km/día (3,800 km en 79 días, de lecturas); odómetro estimado hoy ≈ 88,070 km (proyectado 14 días); usado ≈ 4,470 de 5,000 km (89 %); tiempo 93 de 183 días (51 %); manda la pista de km; faltan ≈ 530 km, ≈ 11 días; vence a los 88,600 km, aprox. el 14 de setiembre; estado **Pronto**; confianza **alta** ("Estimación confiable").

Si en vez de eso el cambio hubiera sido a los 80,000 km (el mock actual): usado ≈ 8,070 km (161 %) → **Vencido**, "se pasó ~3,070 km".

### 4.7 Arranque en frío: cuando no tenemos el manual del modelo

DESIGN.md prohíbe prometer datos que no existen. Comportamiento:

1. El dibujo del auto se muestra con sus zonas pero **sin** chips, anillos ni porcentajes. Titular: "Todavía no tenemos el manual de tu {marca} {modelo} {año}".
2. CTA primario: "Fotografía las páginas de mantenimiento de tu manual" → cola de extracción (4.8). Se le dice la verdad: "lo revisamos a mano; te avisamos cuando esté".
3. Camino secundario: "Escribe los intervalos de tu libreta" → formulario por componente (km, meses) que crea un spec `user_entered`; muestra estados de inmediato pero con confianza tope media y "según lo que escribiste" en cada tarjeta.
4. Los valores genéricos del catálogo **nunca** se renderizan como estado, anillo ni fecha. Solo podrían vivir en un panel colapsado "Referencia general (no es de tu manual)" en texto plano sin color, si producto decide tenerlo.
5. Manual de años adyacentes del mismo modelo: "Manual de {modelo} {años}: ¿es el mismo que el tuyo?" con confirmación explícita.
6. Mientras tanto la app sigue dando valor con datos del usuario: historial de km, servicios con costos, documentos, y recordatorios definidos por él ("recuérdame cada 5,000 km"), etiquetados como suyos.
7. Cada vehículo sin manual suma al contador de demanda que ordena la cola de extracción (Changan, Jetour, Chery, Geely, JAC primero, según NEGOCIO.md).

### 4.8 Cómo sacar los intervalos del manual (el pipeline)

1. **Conseguir el manual legalmente:** descarga pública del fabricante, la libreta del propio usuario (fotos de las páginas de mantenimiento) o una copia comprada. Se guarda en privado con metadatos (marca, modelo, años, mercado, edición, páginas, SHA-256). Nunca se redistribuye ni se muestran sus páginas.
2. **Ubicar el cuadro:** "Mantenimiento programado" / "Cuadro de mantenimiento" / "Scheduled maintenance", la página de "condiciones severas" y la de "Especificaciones". Anotar páginas.
3. **Convertir a texto con marcadores de página:** capa de texto del PDF; OCR o modelo con visión para escaneos y fotos; tablas en orden de filas.
4. **Correr el prompt de extracción** (`detalle-auto/manual-extraction-prompt.md`) a temperatura 0, salida solo JSON, un manual por corrida. Salida: `MaintenanceSpec` con confianza por línea y referencias de página.
5. **Segunda pasada independiente** (otro modelo, o el mismo con las páginas barajadas). Diff línea por línea; lo que coincide pasa a validación, lo que no, a revisión humana con ambos candidatos.
6. **Validación automática:** JSON Schema (`maintenance-spec.schema.json`); rangos (km entre 500 y 300,000, múltiplos de 500; meses 1–120); severo ≤ normal; acción consistente con intervalos; cobertura del catálogo (cada id aparece o se declara `notInManual`); variantes sin solaparse; toda línea con página; **cero texto copiado** (n-gramas de 8 contra el texto fuente); campos ≤ 200 caracteres; auditoría de unidades si el manual está en millas (±3 % de ×1.609); ≥90 % de acuerdo entre pasadas; plausibilidad entre modelos solo como advertencia (aceite 3,000–20,000; bujías 15,000–160,000; correa 60,000–160,000).
7. **Revisión humana:** cada línea junto a su página. Hasta entonces el spec se sirve con "según el manual (sin revisar aún)" y confianza tope media.
8. **Normalizar** a ids del catálogo; lo que el manual tiene y el catálogo no, conserva id propio.
9. **Versionar y publicar:** `specId = marca-modelo-añoDesde-añoHasta-mercado`; cada estimación cita la versión; la app cachea specs offline.
10. **Retroalimentación:** "Esto no coincide con mi manual" en cualquier tarjeta crea un ticket con la foto del usuario.
11. **Cola por demanda:** cada vehículo sin spec suma al contador.

**Nota legal (pendiente, no resuelto, de NEGOCIO.md):** los intervalos son hechos y los hechos no se protegen por derecho de autor (Perú, D. Leg. 822, arts. 8 y 9: se protege la forma de expresión, no las ideas ni el contenido técnico; referencia comparada Feist v. Rural, EE. UU. 1991); el texto y la maquetación del manual sí. Este diseño solo guarda números, códigos, verbos normalizados y referencias de página. **Consultar con abogado en Perú antes de construir la base, no después.** Marcas solo de forma nominativa ("para tu Toyota Yaris 2015"), sin logos ni insinuar respaldo. Ediciones por mercado pueden diferir: un manual de EE. UU. aplicado a un auto peruano se sirve "sin revisar" hasta confirmarlo. Fotos del manual y datos de servicio son datos personales (Ley 29733).

### 4.9 Lo que nunca se sabrá sin sensores

La condición real del aceite (viscosidad, hollín, dilución), concentración o nivel de refrigerante, grosor de pastillas y discos, salud de la batería, profundidad y presión de llantas, grietas o tensión de la correa, estado de bujías, temperatura del motor, códigos de falla, los km reales entre lecturas (todo es interpolación), horas de motor en ralentí (un taxi en tráfico degrada el aceite por hora, no por km; el manual solo lo cubre con la tabla severa), estilo de manejo, calidad del combustible, si el taller realmente cambió la pieza, fugas entre servicios, si la edición del manual coincide con esta unidad, manipulación del odómetro en un usado, cualquier falla antes de su intervalo (el programa previene, no detecta), y si el usuario dice la verdad.

---

## 5. Cómo dibujarlo: todas las opciones

Stack real: Expo SDK 57, react-native 0.86.3, React 19.2.3, Reanimated 4.5.1, worklets 0.10.1, react-native-svg 15.15.4 (instalado), gesture-handler 2.32, Nueva Arquitectura, React Compiler. No instalados: Skia, Lottie, Rive, three/expo-gl.

Estado de verificación: la investigación citó fuentes primarias (docs oficiales, npm, GitHub, changelog de Expo) para 63 afirmaciones, listadas con URL en `detalle-auto/tech-research.json`. La segunda pasada de refutación independiente **no se ejecutó** (se agotó el límite de uso). Lo marcado como UNVERIFIED en ese archivo sigue sin verificar. Las versiones citadas son al 2 de setiembre de 2026; confirma con `npx expo install --check` antes de instalar.

### 5.1 Matriz

| Opción | Versión para SDK 57 | Expo Go | Nitidez | Techo de realismo | Android gama baja | Peso | Trazo que se dibuja | Toque por región | Esfuerzo |
|---|---|---|---|---|---|---|---|---|---|
| **1. react-native-svg + Reanimated** (instalado) | 15.15.4 (la que Expo Go trae) | Sí | Vectorial, nítido a cualquier escala | Medio: trazos, rellenos, gradientes lineales/radiales. **Sin blur ni glow fiables en Android** (issue #2636 abierto) | Bueno para 100–300 paths si solo se animan `animatedProps` y nunca se re-renderiza el árbol | 0 MB | Sí: `strokeDashoffset` con `useAnimatedProps`; longitud precalculada en build con `svg-path-properties` | Nativo por elemento (`onPress` en `Path`) | 3–5 días con el asset |
| **2. @shopify/react-native-skia** | 2.6.2 (la que Expo Go trae; 2.11.2 en npm exige dev build) | Solo a 2.6.2 exacto | Igual de nítido; GPU | **Alto:** gradientes, BlurMask, sombras, shaders, texturas | GPU (OpenGL en Android); latencia histórica de primer frame (usar `androidWarmup`, montar temprano tras Skeleton); capas estáticas como `Picture` | ~4 MB Android (App Bundle), ~6 MB iOS | El mejor: `<Path start end>` sin precalcular | **No hay hit-testing:** overlay de `Animated.View` por región, o un `Gesture.Tap` + `path.contains()` | +1–2 días sobre la opción 1, +1 día de medición en un Android real |
| 3. lottie-react-native | ~7.3.8 (Expo Go) | Sí a 7.3.x | Vectorial | Alto si lo hace un diseñador en After Effects; no todo AE se soporta | Aceptable para una animación por pantalla | Bajo | Solo lo pre-autorizado; en runtime solo `progress` 0–1 | Ninguno; overlay | Dev S, diseño M–L por cada cambio |
| 4. Rive | @rive-app/react-native 0.4.20 + Nitro 0.35.x (RN 0.86 **no declarado**) | **No** (dev build) | Vectorial | Alto, con state machines y data binding | Sin datos | Varios MB | En el editor, guiado por inputs | Sin verificar | M–L + editor de pago para exportar (US$9/asiento/mes) |
| 5a. 3D real: @react-three/fiber 9.7 + three 0.185 + expo-gl 57 | Compatible (crash de Nueva Arquitectura arreglado en R3F 9.1.3) | Sí | Rasterizado por frame; líneas finas peor que 2D | El más alto, con un GLB bueno por carrocería | **El peor:** loop en el hilo JS, three no corre en worklets, evidencia vieja de 20–40 fps y throttling térmico | GLB 1–10 MB por auto | No natural | Raycast; ergonomía mala con dedo en pantalla sucia | L–XL |
| 5b. Pseudo-3D: secuencia de frames pre-renderizados (Blender) en expo-image | 57.0.4 | Sí | Raster; nítido si se renderiza a ≥2× | Fotorrealista, pero un auto genérico | Excelente | 3–6 MB por carrocería | No; solo "x-ray" pre-renderizado fijo | Overlay con anclas por frame | Assets M, app S |
| 6. Imágenes estáticas (PNG/WebP/SVG en expo-image) | 57.0.4 | Sí | Depende de la densidad | Lo que pinte un diseñador, estático | Excelente | Assets | No | Overlay | S |

Nota sobre react-native-svg y el zoom: no soporta `vector-effect: non-scaling-stroke`; si escalas el grupo 2×, los trazos engordan 2×. Solución: escalar poco (1.0 → 1.06) y, para la vista de zona, cambiar el `viewBox` al rectángulo de la zona con grosores re-especificados.

### 5.2 3D, con honestidad

Es técnicamente posible hoy (R3F 9.7 + expo-gl 57 corre en Expo Go), pero es la herramienta equivocada para este usuario y estos datos, y no va en la v1:

1. **Rendimiento en el teléfono objetivo.** La única evidencia en Android de gama baja es vieja y negativa; el loop de render vive en el hilo JS; no hay benchmark de 2026. Prometer 60 fps en un Android de 2–3 GB al sol es una afirmación sin verificar y probablemente falsa. Calor y batería importan para alguien que abre la app entre carreras.
2. **Legibilidad.** Un auto sombreado bajo el sol en pantalla sucia contrasta peor que un trazo de 2 px. El propio video usa un dibujo 2D para el diagnóstico.
3. **Valor informativo cero.** Sin telemetría, el 3D no muestra nada que el 2D no muestre. El manual dice "bujías cada 40,000 km", no "el cilindro 3 está caliente".
4. **Economía de assets.** "Realista" para tu usuario significa "se parece a MI Kia Rio 2012". Un GLB genérico contradice eso, y GLBs por modelo para Changan/Jetour/Chery/Geely/JAC son impagables.
5. **Reglas de movimiento.** Cualquier órbita o giro es decoración de más de 240 ms y no es una revelación. DESIGN.md prohíbe exactamente eso.
6. **Interacción.** Tocar componentes pequeños en 3D con el dedo en pantalla sucia es peor que polígonos 2D de 56 px.

Alternativas baratas si quieres sensación de profundidad: (a) secuencia de frames pre-renderizados en Blender como imagen héroe (tu entorno tiene un servidor MCP de Blender que puede generarla); (b) "2.5D" en SVG/Skia: dibujo isométrico o a tres cuartos con gradientes y sombra, que da el 80 % de la profundidad percibida a costo 2D. Spline no tiene runtime oficial para React Native (solo web, Swift, Kotlin).

Si alguna vez se retoma: probar en el Android más lento que consigas (frame time en 5 s de órbita, arranque en frío del GLView, temperatura tras 2 minutos), servirlo solo como héroe opcional en equipos capaces, con el mapa 2D siempre como fuente de verdad.

### 5.3 De dónde sale el dibujo (pipeline de assets)

Objetivo: dos dibujos vectoriales nítidos con un mismo lenguaje y un mismo esquema de ids: (A) auto desde arriba, mapa de zonas (viewBox 0 0 240 400 para no romper `CarDiagram`); (B) compartimento del motor visto desde arriba con el capó abierto (viewBox ~0 0 360 300), cada componente como un path con nombre que el manual pueda nombrar: `aceite_motor`, `bujias`, `filtro_aire_motor`, `refrigerante`, `correa_distribucion`, `bateria`, `aceite_caja`, `pastillas_freno`, …

Cuatro formas de conseguirlo, en orden de preferencia:

- **A) Dibujar a mano en Figma** (1–2 días para un ilustrador competente). Trazos centrados de 1.5–2 px a 1×, dos pesos (contorno 2, detalle 1.25), uniones y remates redondos, sin gradientes ni filtros en el SVG (van en runtime), sin `<text>`, sin CSS, sin transformaciones en grupos (aplanar). Un grupo por componente con el id exacto. Un grupo oculto `hit` con polígonos rellenos por componente, generosos (≥ 37 unidades de viewBox en 240 de ancho = 56 px en un teléfono de 360). Exportar con "Include id attribute" activado y "Simplify stroke" activado; **no** aplicar "Outline stroke" (un trazo que se dibuja necesita trazo, no relleno).
- **B) Calcar de una foto** de un auto común de aplicativo (Chevrolet Sail, Kia Rio, Hyundai Accent, Chery, Changan) y de su motor. Calcar a mano con la pluma; el autotrazado (vtracer, Illustrator) da rellenos cerrados, no trazos limpios: espera redibujar el 60 %.
- **C) Generar con IA y vectorizar:** "clean technical line drawing, top view, white background, uniform stroke, no text, no shading" → escalar → vectorizar → re-capas por componente en Figma. Sirve para un mockup; para el asset final hay que limpiar y la geometría suele estar mal.
- **D) Vector de stock** (Vecteezy, Freepik, Shutterstock): revisar licencia de uso en app. **Nunca** usar los dibujos de un manual OEM.

Preparación y generación de código (igual para cualquier origen): svgo 4.1 con `cleanupIds: false`, `convertShapeToPath`, precisión 2, coordenadas absolutas, sin `mergePaths`, sin CSS. Un script Node (`scripts/svg-to-paths.ts`) que emite `mobile/src/assets/car/topdown.ts` y `enginebay.ts` con `{ id, zone, d, strokeWidth, length (svg-path-properties), anchor {x,y}, hit: d }`. Ese archivo es la única fuente de verdad para SVG, Skia y el prototipo HTML. No usar `SvgXml` ni `react-native-svg-transformer` para el mapa (dan un componente opaco).

Capas, de atrás hacia adelante: L0 silueta + vidrios (estático, trazo apagado #9aa3ad); L1 ruedas/ejes; L2 componentes (color por estado, revelación animada); L3 marcadores (56 px); L4 etiquetas en `Text` de RN y tarjetas, fuera del SVG.

Control de calidad del asset: abre en Figma con todos los ids; cada id de la lista de componentes tiene path o se declara "sin dibujo" (nunca inventar un componente que el manual no lista); contraste de trazos de componentes vs #ffffff ≥ 4.5:1; ningún path > ~2,000 unidades (presupuesto de la revelación); polígonos de toque sin solaparse.

---

## 6. Tres caminos y la recomendación

Los tres agentes de diseño y el jurado de nueve jueces no llegaron a correr (límite de uso). Esta comparación es mía, hecha con la investigación y la auditoría; dilo así si otro agente la cuestiona. Puntaje 1–10 por criterio.

| Criterio | A · SVG + Reanimated (ya instalado) | B · Skia (dev build o 2.6.2 en Go) | C · 3D / pseudo-3D |
|---|---|---|---|
| Ajuste al usuario (sol, una mano, respuesta en 3 s) | 9 | 8 | 4 |
| Honestidad (nada insinúa sensores) | 9 | 8 | 5 (un auto girando promete lo que no hay) |
| Rendimiento Android 2019, 2–3 GB | 8 | 7 | 3 (5b pre-render: 8) |
| Factibilidad con manual + registros | 10 | 10 | 10 (los datos son los mismos) |
| Esfuerzo (10 = más barato) | 8 | 6 | 2 (5b: 5) |
| Nitidez y realismo | 7 | 9 | 8 (genérico) |
| Portabilidad a otros agentes (¿ChatGPT lo construye solo con el spec?) | 9 | 7 | 4 |
| **Total** | **60** | **55** | **36 (5b: 44)** |

**Recomendación: A ahora, B después, C no.**

- **Fase 1 (esta iteración):** react-native-svg + Reanimated. Cero dependencias nuevas, corre en Expo Go hoy, cumple la regla de 240 ms con la excepción de revelación, y es lo que va a probarse con conductores. La nitidez es idéntica a Skia: ambos son vectores rasterizados a la resolución del equipo. Lo que Skia añade es glow, gradientes complejos y sombras, no nitidez.
- **Fase 2 (opcional, tras validar con usuarios):** Skia para la escena del motor "rayos X" donde el realismo importe: `start/end` para el trazo, gradientes, `BlurMask` en el componente resaltado, `Shadow` para profundidad, capas estáticas como `Picture`, `androidWarmup`. Compuerta de decisión: medir en el Android más lento (primer frame del Canvas, frame time en la revelación, legibilidad al sol lado a lado con la versión SVG). Si la SVG ya se ve nítida, parar en la fase 1.
- **No recomendado:** Lottie (propiedades dinámicas limitadas a colores/texto/progreso, ida y vuelta con diseñador por cada cambio, sin toque por región), Rive (dev build, editor de pago, runtime pre-1.0, RN 0.86 sin declarar), 3D en tiempo real (sección 5.2). Frames pre-renderizados en expo-image son aceptables como imagen héroe opcional más adelante.

Lo que se rescata de B y C aunque pierdan: de B, el concepto de "capa estática + capa viva" (en SVG: memoizar L0–L1 y animar solo L2–L3); de C, la idea de la vista 2.5D a tres cuartos para el héroe del home, dibujada en SVG con gradiente y sombra, sin runtime 3D.

---

## 7. Especificación de la propuesta recomendada

### 7.1 Pantallas

**Estado (home) — reemplazo del botón.** En lugar de la fila "Mapa de mantenimiento", una tarjeta `CarHealthCard`:

- Arriba: mini dibujo del auto desde arriba (ancho ~55 %) con **un marcador por zona** que lleva la palabra del estado o un contador ("2"), nunca solo un punto de color. A la derecha del dibujo, el **anillo de intervalo del aceite** (7.2) con el número grande: "530 km" / "o 11 días".
- Debajo: `StatusRow` del peor componente del auto ("Aceite y filtro · Pronto · Faltan ~530 km · aprox. 14 de setiembre").
- Pie de tarjeta: frescura y acción: "87,400 km · hace 14 días" + botón "Actualizar km" (56 px). Si la lectura tiene más de 45 días, la fila se vuelve ámbar con "Actualiza tu kilometraje para afinar la estimación".
- Tap en el dibujo o en "Ver todo el auto" → Mapa. Tap en un marcador → Sistema de esa zona directamente.

Estados de la tarjeta: cargando (Skeleton con la forma exacta), sin manual (4.7), sin lectura de km ("¿Cuántos km marca hoy?" como único contenido), normal.

**Mapa.** Dibujo completo con 6–8 chips de zona debajo (icono + etiqueta + palabra de estado, 56 px). Tap en zona → revelación **en la misma pantalla** (7.4) y luego la lista de la zona; o bien push de `sistema/[system]` como `formSheet` (react-native-screens 4.26, `sheetAllowedDetents [0.55, 1]`) si la revelación en sitio complica el scroll.

**Sistema (por zona).** Arriba, tarjeta de veredicto para el peor componente (`AlertBanner` tono por estado: título "Aceite y filtro · Pronto", explicación de 4.4, "Si no lo haces: …"). Debajo, "Componentes según tu manual": una `StatusRow` por componente con barra de intervalo compacta, ordenados por gravedad (vencido > toca > pronto > sin datos > al día), tap → Servicio. Ítems de inspección muestran "Revisar en el próximo servicio" en vez de barra. Pie: "Registrar un servicio" (primario).

**Servicio (por componente).** Anillo de intervalo grande + los tres datos que ya existen (cada / última vez / precio) + "Según el manual, cada 5,000 km o 6 meses, lo que ocurra primero" + "Último cambio que registraste: 02 JUN 2026 a 83,600 km" + descripción + "Si no lo haces" + checklist + confianza en palabras + "?" que explica cómo se calcula (manual + tus registros, sin sensores). Pie: "Registrar que ya lo hice" (primario) y "Agendar este servicio" (terciario).

**Registrar.** Formulario: componentes (multi-selección, precargado), fecha (hoy), km (precargado con el último), costo S/, taller, tipo (cambiado / revisado bien / revisado: hay que cambiar). Al guardar: se agrega el registro **y** una lectura de km, y el anillo del componente vuelve a 0 con la animación de cambio de color (160 ms).

**Onboarding, adiciones:** perfil de uso (4 interruptores), adquisición (nuevo/usado, fecha, km), último servicio de 4–6 ítems con "No sé".

### 7.2 El medidor de aceite: anillo de intervalo

Concepto: **dos pistas concéntricas** en un anillo de 132 px. Pista exterior = km (llevas 4,470 de 5,000), pista interior = tiempo (93 de 183 días). La pista que manda se dibuja gruesa (10 px) y con color de estado; la otra fina (4 px) y gris. Una **muesca** a las 12 en punto marca el 100 % (el intervalo del manual) y una banda tenue ámbar ocupa la ventana "Pronto" antes de la muesca. Pista de fondo hairline (1 px, #e5e7eb). Remates redondos. Cuando se pasa del 100 %, el exceso se dibuja como un segundo arco rojo encima, empezando en la muesca, para que "se pasó 3,070 km" se vea.

Centro: número grande tabular ("530 km"), debajo "o 11 días", debajo el chip con la palabra ("Pronto"). Fuera del anillo, a la derecha o debajo: "Según el manual: cada 5,000 km o 6 meses" y la confianza en palabras.

Por qué se ve nítido y real: vector puro a la resolución del equipo, un solo gradiente lineal sutil en el arco activo (de statusWarn a un 12 % más oscuro), una sombra interior simulada con un segundo arco a 30 % de opacidad desplazado 1 px, y números tabulares que no bailan. Nada pulsa. Sin glow.

Estados: al día (verde, arco parcial), pronto (ámbar), toca (ámbar oscuro #b45309 en el texto, arco al 100 %), vencido (rojo, arco completo + arco de exceso), sin datos (anillo gris punteado, centro "Sin datos", CTA "Registrar último cambio"). Reduce motion: el arco aparece en su valor final.

Variante compacta para listas: barra horizontal de 6 px con la misma muesca y banda, palabra + número al lado.

Lo que este medidor **no** dice: "nivel", "% de vida", "desgaste real". Su título es "Intervalo" o "Cuánto llevas".

### 7.3 El mapa del auto

Dibujo desde arriba, capó arriba, viewBox 0 0 240 400 renderizado a `width 100%` con `aspectRatio 0.6`. Trazos: silueta 2 unidades en #9aa3ad, componentes 1.5 en #4b5563 (≥ 4.5:1 sobre blanco). Zonas y anclas (en unidades de viewBox): Motor (120, 70), Refrigeración (120, 34), Eléctrico (62, 60), Transmisión (120, 120), Frenos (40, 84) y (200, 84) y (40, 320) y (200, 320), Llantas (los cuatro rincones), Cabina (120, 210), Combustible (120, 350).

Regiones de toque: un `Path` invisible (`fill="transparent"`) por zona, ≥ 37 unidades de lado, con `onPress`. Marcadores: chip de RN posicionado desde el ancla con `onLayout`, con la palabra del estado o el contador; el color del disco viene de `StatusMeta.soft`, sin halo.

Vista de zona (Motor): un segundo SVG (viewBox del compartimento) con los componentes: cárter y filtro de aceite (ámbar), caja del filtro de aire, tapa de válvulas con cuatro pozos de bujía, tapa de la correa, depósito de refrigerante y radiador (azul), batería, correa de accesorios. Cada uno un `Path` con id, longitud precalculada y ancla.

### 7.4 Coreografía (la única excepción a los 240 ms)

| Paso | Duración | Curva | Técnica | Dentro de la regla |
|---|---|---|---|---|
| Tap en zona: chips y título se desvanecen | 140 ms | change | opacity 1→0 | Sí (disappear) |
| El dibujo escala hacia la zona | 200 ms | arrive | `Animated.View` transform scale 1→1.06 + translate hacia el ancla | Sí (cardArrive) |
| Fundido cruzado silueta → vista de zona | 200 ms | change | opacity de dos capas | Sí |
| Trazos de componentes se dibujan, **peor primero** | ≤ 240 ms cada uno, 60 ms de escalón, 6 componentes ≈ 540 ms | arrive | `strokeDashoffset` L→0 con `useAnimatedProps` + `withDelay` | Excepción de revelación |
| Marcadores caen | 160 ms cada uno, mismo escalón | change | opacity + scale 0.8→1 | Sí |
| Tarjetas de componentes entran | 200 ms + 60 ms de escalón | arrive | `FadeInDown` (layout animation) | Excepción de revelación |
| Anillo del peor componente se llena | 240 ms | arrive | `strokeDashoffset` | Sí |

Total percibido: ~900 ms desde el tap hasta que todo está en reposo; el veredicto (título + palabra) es legible desde los 200 ms porque entra primero. **Reglas:** disparada solo por tap; interrumpible (un tap en cualquier lugar salta al estado final); falla abierta (si la animación no corre, el contenido está visible); `AccessibilityInfo.isReduceMotionEnabled` → estado final al instante; sin ningún elemento que pulse o respire; solo transform y opacity (y `strokeDashoffset`, que es la excepción explícita); volver = 140 ms inverso.

Lo que se descarta del video: la barra de progreso de 4 s, la píldora replay/pausa, el tooltip flotante, el zoom 1.9× con desenfoque.

### 7.5 Accesibilidad y Android de gama baja

- Cada marcador: `accessibilityRole="button"`, `accessibilityLabel="Motor: aceite y filtro, pronto, faltan 530 kilómetros"`.
- Texto de lectura ≥ 15 px; secundarios ≥ #555; palabra + barra + explicación en todo estado.
- SVG: ≤ 250 nodos por dibujo; L0–L1 memoizados; solo `animatedProps` cambian por frame; sin filtros, blur ni sombras dentro del SVG; `renderToHardwareTextureAndroid` en la capa estática durante el zoom.
- React Compiler: no memoizar a mano; mutar shared values solo en handlers o worklets.
- Persistencia: `expo-sqlite` (kv-store) o async-storage para lecturas y registros; hidratar tras Skeleton.
- Web: react-native-svg funciona; decidir si web es objetivo antes de la fase 2 (Skia necesita CanvasKit ~3 MB).

### 7.6 Orden de implementación (para cuando toque)

1. Motor de desgaste y tipos (`lib/wear/`), con las pruebas. Sin UI.
2. Modelo de datos: `ComponentSpec`, `ServiceRecord`, `OdometerReading`; migrar el mock; `useMaintenance()` sobre `useVehicle()`; persistencia.
3. `IntervalRing` (anillo) y `IntervalBar` (barra compacta), con storybook manual de los cinco estados.
4. Asset del auto y del motor → `assets/car/*.ts` con el script de generación.
5. `CarMap` (JSX, regiones, marcadores) y `useRevealChoreography`.
6. Pantallas: `CarHealthCard` en Estado, Mapa, Sistema, Servicio, Registrar; onboarding.
7. Copy y estados vacíos; arranque en frío.
8. QA en el Android más lento; medir frame time de la revelación.

---

## 8. Kit de prompts portable (en inglés)

Reglas de uso: P0 siempre primero en el mismo chat. Cada prompt dice qué pegar después. Cada prompt termina con una lista de aceptación: pásasela al agente si no la cumple. Copia el bloque completo, incluidas las líneas de `=====`.

### P0 · Bloque de contexto (pegar primero, siempre)

~~~
===== FIXLY CONTEXT BLOCK (paste this first in every chat) =====

PRODUCT
Fixly is a mobile app (Peru, Spanish UI, prices in soles "S/") for car maintenance. The user types a plate,
the app recognizes the car and tells them which maintenance is due, what it should cost, and which
documents expire. This task is the "car details" iteration: replace a navigation button with a view that
SHOWS component wear and, above all, WHEN THE OIL IS DUE, drawn sharply.

PERSONA (non-negotiable; every decision is judged against it)
Ride-hailing driver, ~45 years old, own car 8-15 years old (Toyota Yaris, Kia Rio, Hyundai Accent,
Chevrolet Sail, Changan, Chery, Jetour, JAC), does not know mechanics, low-end Android (2019, Helio /
Snapdragon 4xx, 2-3 GB RAM), reads in the sun on a dirty screen, one hand, sometimes while driving.
Contrast and legibility are functional requirements. Must answer "¿cuándo cambio el aceite?" in 3 seconds.

THE ONE HARD CONSTRAINT: NO VEHICLE DATA
There is no OBD, no telemetry, no sensors, no engine temperature, no oil level. The ONLY two sources are:
(1) the owner's-manual maintenance schedule: per component, an interval in km AND months ("every 5,000 km
or 6 months, whichever comes first"), plus the manual's own severe-use interval when it prints one;
(2) what the user records: odometer readings with dates, and services done with km + date (+ cost, workshop).
Everything shown is an ESTIMATE of the consumed interval, never a measurement of the part's condition.
Banned vocabulary in any user-facing text: detectamos, el auto reporta, sensor, lectura del auto,
diagnóstico, salud del motor, estado del aceite, nivel, temperatura, en tiempo real, monitoreo, escaneo,
vida útil restante, % de vida, desgaste real. Never "puedes seguir manejando", "está bien", "es urgente",
"peligro". The app informs and explains; it never diagnoses or authorizes.
Required attributions: every interval says "Según el manual, cada X km o Y meses, lo que ocurra primero";
every remaining number says "estimado con tu kilometraje" or "al ritmo que registraste (~48 km por día)";
projected dates carry "aprox."; confidence is a word ("Estimación confiable" / "Estimación aproximada" /
"Estimación poco confiable — actualiza tu kilometraje"), never a percentage; unknown is "Sin datos", never
"Al día" by default; inspect items say "revisar", never "te quedan X km de pastillas".

STACK (Expo, already installed; do not add dependencies unless the task says so)
Expo SDK 57, expo-router 57 (typed routes on), react-native 0.86.3, react 19.2.3, New Architecture only,
React Compiler enabled (do not hand-memoize; mutate Reanimated shared values only inside handlers/worklets),
react-native-reanimated 4.5.1, react-native-worklets 0.10.1, react-native-svg 15.15.4,
react-native-gesture-handler 2.32, react-native-screens 4.26, expo-linear-gradient. System fonts only
(no expo-font). Import alias "@/..." maps to mobile/src. Not installed: Skia, Lottie, Rive, three, expo-gl.
Existing UI primitives in mobile/src/ui: Txt (variants: screenTitle, sectionTitle, bigNumber, cardTitle,
buttonLabel, body, bodyBold, bodySmall, label, mono, monoSmall; props color, tabularNums), Surface (size
sm|md|lg = radius 14|20|28, soft shadow), Screen (safe area, scroll, footer slot, edges), StatusRow (4 px
left color bar + title + status word chip + mono detail line), StatusChip, IconRow, StatTile, AlertBanner
(tone warn|expired), Button (primary|secondary|tertiary, 56 px, Reanimated press), HairlineRow, Skeleton,
EmptyState, DetailHeader. Formatting helpers in mobile/src/lib/format.ts: formatKm ("87,400 km"), formatPEN
("S/130.00"), formatShortDate ("02 JUN"), formatLongDate ("02 JUN 2026"), daysUntil, dueLabel.

DESIGN TOKENS (mobile/src/theme/tokens.ts; light theme; these are what the app renders)
Colors: background #ffffff, surface #f5f6f8, surfaceAlt #eef0f3, textPrimary #111827, textSecondary #6b7280,
textTertiary #9ca3af, border #e5e7eb, borderSoft #eef0f2, accent #16a34a (buttons/links ONLY, never for a
value that carries state), statusOk #16a34a / soft #dcfce7, statusWarn #f59e0b / soft #fef3c7 (use #b45309
for warn TEXT so it reads in the sun), statusExpired #ef4444 / soft #fee2e2, dark #111827.
Type: screenTitle 28/34 700, sectionTitle 20/26 700, bigNumber 32/38 700 tabular, cardTitle 17/22 600,
body 15/21 400, bodyBold 15/21 600, bodySmall 13/18 (metadata only, never for reading text), label 11/14
600 uppercase +0.4, mono 13/18 500 (use Platform.select({ios:'Menlo', android:'monospace'}) + tabularNums
for km, dates, prices). Spacing: 4 8 12 16 20 24 32 48. Radius: 14 20 28 pill. Touch target: 56 px.
Shadow: color #0f172a, offset 0/4, opacity .06, radius 12, elevation 3.
Motion: tap 100 ms, disappear 140, colorChange 160, cardArrive 200, stagger 60, CEILING 240 ms.
Easing arrive cubic-bezier(0.22,1,0.36,1); change cubic-bezier(0.2,0.8,0.2,1). Never linear/ease-in-out.

DESIGN RULES (from DESIGN.md; violations fail review)
- Status is NEVER color alone: always word + color bar + one-line explanation. Colorblind drivers exist.
- 56 px touch targets. Tap and vertical scroll only: no swipe carousels, no long-press, no pull-to-refresh.
- 240 ms ceiling for every animation. The ONLY exception is the "reveal": items entering staggered
  (60 ms), ordered by gravity (worst first), tap-triggered, interruptible, fail-open, disabled under
  reduce-motion. Only transform + opacity (and SVG strokeDashoffset for the reveal). Nothing pulses,
  breathes, bounces or glows. No blur.
- No overlapping elements (no floating tooltips over the drawing; use anchored cards beside/below it).
- Reading text >= 15 px; secondary text >= #555 contrast; numbers tabular.
- Spanish (Peru) sentence case: "Registrar último cambio", not "Registrar Último Cambio". Peruvian
  formats: 87,400 km · S/2,475.00 · "8 de setiembre" (setiembre, not septiembre). Vocabulary: llantas,
  plumillas, bujías, taller, aplicativo, cambio (not reemplazo). No emojis anywhere.
- Never promise maintenance data that does not exist for that model: with no manual in the base, show
  "Todavía no tenemos el manual de tu {marca} {modelo} {año}" and no statuses, rings or dates.

STATUS VOCABULARY (component states; documents keep Vigente/Por vencer/Vencido)
ok = "Al día" (green) · pronto = "Pronto" (amber) · toca = "Toca ahora" (amber, text #b45309) ·
vencido = "Vencido" (red) · sin_datos = "Sin datos" (gray, no ring). Inspect items: "Revisión al día" /
"Revisar pronto" / "Toca revisar" / "Revisión vencida". Gravity order: vencido > toca > pronto > sin_datos > ok.

DATA MODEL (TypeScript; full types in wear-types.ts, engine in wear-engine.ts — paste when asked)
ComponentSpec { componentId, zone, action: replace|inspect|inspect_then_replace|rotate|no_schedule,
  normal {km|null, months|null}, severe {..}|null, firstServiceKm?, replaceCriterion?, appliesTo?,
  criticality: safety|engine|comfort, source {kind, pageRefs, reviewedBy?} }
MaintenanceSpec { specId, brand, model, yearFrom, yearTo, severeConditions[], components[], source }
ServiceRecord { id, componentIds[], date 'YYYY-MM-DD', odometerKm|null, kind: replaced|inspected_ok|
  inspected_needs_replace|unknown_before_purchase, costPen?, workshop?, note?, source }
OdometerReading { id, date, km, source: user|service_record|acquisition|photo }
VehicleProfile { id, brand, model, year, engineCode?, transmission MT|AT|CVT|DCT|unknown, fuel,
  usage {rideHailing, mostlyCity, dustyRoads, shortTrips, highAltitude}, acquisition?, declaredWeeklyKm? }
WearEstimate (derived, never persisted) { componentId, action, status, confidence alta|media|baja|ninguna,
  binding km|time|none, percentConsumed, remainingKm, remainingDays, dueAtKm, projectedDueDate,
  kmTrack {interval, used, remaining, percent}, timeTrack {...}, odometerNowKm, odometerIsProjected,
  lastReadingDate, lastReadingAgeDays, dailyKm {kmPerDay, source, assumptionLabel?}, severeApplied,
  anchor {kind, date, km}, reasons[], missingInputs[] }
Zones: motor, refrigeracion, transmision, frenos, llantas, electrico, cabina, suspension_direccion, combustible.
Component ids: aceite_motor, filtro_aire_motor, filtro_cabina, filtro_combustible, bujias, refrigerante,
aceite_caja_mt|at|cvt, correa_distribucion, cadena_distribucion, correa_accesorios, pastillas_freno,
discos_freno, liquido_frenos, rotacion_llantas, alineamiento_balanceo, llantas, bateria, plumillas,
liquido_direccion, aceite_diferencial, amortiguadores, ajuste_valvulas, kit_gnv_glp, aire_acondicionado.

CANONICAL FIXTURE (use it everywhere so results can be compared across chats)
Toyota Yaris 2015, 1.5 L, MT, gasolina, usage rideHailing=true. Today = 2026-09-03.
Spec aceite_motor: replace, normal {km 5000, months 6}, severe null, criticality engine, source reviewed.
Records: r1 {componentIds [aceite_motor], date 2026-06-02, odometerKm 83600, kind replaced, costPen 130,
workshop "Taller Los Olivos"}; r2 {componentIds [filtro_aire_motor], date 2026-07-18, odometerKm 85900,
kind replaced, costPen 45}. Readings: o1 {date 2026-08-20, km 87400, source user}.
EXPECTED for aceite_motor: dailyKm ≈ 48 (source readings, 79-day span); odometerNowKm ≈ 88,070
(projected 14 days); kmTrack used ≈ 4,470 / 5,000 (0.89); timeTrack 93 / 183 days (0.51); binding km;
remainingKm ≈ 530; remainingDays ≈ 11; dueAtKm 88,600; projectedDueDate ≈ 2026-09-14; status "pronto";
confidence "alta". Alternative fixture: r1 at 80,000 km → percent ≈ 1.61 → status "vencido",
"se pasó ~3,070 km".

CURRENT CODE (what exists; the task will say what to change)
mobile/src/app/(tabs)/estado.tsx (home; lines 79-87 are the IconRow button "Mapa de mantenimiento" to be
replaced), mobile/src/app/mapa.tsx, mobile/src/ui/CarDiagram.tsx (SvgXml 240x400 + absolute Pressables),
mobile/src/ui/car-svg.ts (SVG string, silhouette only), mobile/src/lib/zones.ts (motor|frenos, hand flag),
mobile/src/app/sistema/[zone].tsx, mobile/src/app/servicio/[id].tsx, mobile/src/app/(tabs)/plan.tsx,
mobile/src/app/vehiculo.tsx (edits mileage), mobile/src/mock/data.ts, mobile/src/state/vehicle-context.tsx
(useState only, no persistence), mobile/src/theme/tokens.ts.

OUTPUT RULES FOR YOU (the agent)
Complete files, no placeholders, no "// ...rest of the code". TypeScript strict. Spanish copy for anything
the user sees; English for code and comments. State any assumption you make in a short list at the end.
If something in the task conflicts with these rules, follow the rules and say so.
===== END OF CONTEXT BLOCK =====
~~~

### P1 · Motor de desgaste: integrar, probar y exponer selectores

Pega después: `wear-types.ts`, `wear-engine.ts`, `wear-test.ts`. Depende de: P0.

~~~
TASK P1 — Integrate and test the maintenance wear engine.

You receive three files after this prompt: wear-types.ts, wear-engine.ts (pure, dependency-free, compiles
under tsc --strict) and wear-test.ts (scenario runner). Do the following, in order:

1. Place them at mobile/src/lib/wear/types.ts, engine.ts and __tests__/engine.test.ts. Convert the scenario
   runner into Jest tests (jest-expo preset; add the devDependencies jest, jest-expo, @types/jest to
   package.json and a "test" script) WITHOUT changing the engine's behavior.
2. Add a test for the CANONICAL FIXTURE from the context block and assert every EXPECTED value (allow ±2 km
   and ±1 day). Add the alternative fixture (oil at 80,000 km) and assert status "vencido".
3. Add these edge-case tests and make sure they pass without modifying the engine unless you find a real
   bug (if you do, fix it minimally and explain it): used car with no records → sin_datos + missingInputs
   includes last_service_date; single reading + default assumption → status not affected by the assumption
   (odometerIsProjected false); readings 84,300 / 70,000 / 91,500 → the 70,000 is dropped with
   reading_non_monotonic; record dated in the future → ignored; time-only item (plumillas, months 12)
   with no readings → confidence not capped by odometer freshness; inspected_needs_replace with no later
   replaced → status toca, confidence alta; rideHailing=true with severe=null → reasons include
   severe_not_in_manual and the NORMAL interval is used; car parked (two readings with the same km 40 days
   apart) → remainingDays null for a km-only item.
4. Create mobile/src/lib/wear/selectors.ts with pure helpers the UI will use:
   worstOf(estimates): WearEstimate | null (gravity order vencido > toca > pronto > sin_datos > ok, then
   soonest); byZone(estimates, specs): Record<Zone, { worst, counts: Record<WearStatus, number> }>;
   statusLabel(estimate): string (Spanish word incl. the inspect variants); explanation(estimate, spec,
   componentName, whatIfSkipped): string built from the templates in the context block (attributions
   included, "aprox.", "setiembre"); confidenceLabel(estimate): string | null; freshnessLabel(estimate):
   "87,400 km · hace 14 días" style with the projected caveat when odometerIsProjected.
5. Create mobile/src/lib/wear/copy.ts holding every Spanish string used above as named constants so copy
   can be reviewed in one place.

ACCEPTANCE
- npm test passes; the canonical fixture test prints the WearEstimate for aceite_motor.
- No user-facing string contains a banned word from the context block.
- selectors.ts and copy.ts have no React imports; everything is pure and unit-tested.
- You list any engine change you made and why.
~~~

### P2 · Modelo de datos, migración del mock y persistencia

Pega después: `wear-types.ts`, `code-audit.json` (opcional, tiene las brechas con archivo y línea). Depende de: P0, P1.

~~~
TASK P2 — Replace the hand-typed maintenance mock with the spec + records model, and persist user data.

Today mobile/src/mock/data.ts has MaintenanceItem { id, km, service, parts, done, next, zone: 'motor'|
'frenos', intervalKm, lastDoneAt?, priceRange, description, whatIfSkipped, checklist } and status is the
hand flag `next`. Replace it:

1. mobile/src/data/catalog.ts: ComponentDef per component id (label "Aceite de motor y filtro", shortLabel,
   zone, icon name from @expo/vector-icons Feather, criticality, description, whatIfSkipped, checklist[],
   priceRangePen [min,max] as example values marked as such). Keep the four existing descriptions.
2. mobile/src/data/specs/toyota-yaris-2013-2017-pe.ts: a MaintenanceSpec for the demo car. Use these values
   and mark source.kind 'owner_manual', reviewedBy 'demo' (so the UI does not show "sin revisar"):
   aceite_motor 5000 km / 6 m replace; filtro_aire_motor 20000/24 inspect_then_replace (severe 10000/12);
   filtro_cabina 15000/12 replace; bujias 40000/48 replace; refrigerante 40000/24 replace (first 160000);
   aceite_caja_mt 40000/24 inspect_then_replace; correa_distribucion notInManual (this engine has a chain)
   → cadena_distribucion no_schedule; correa_accesorios 20000/12 inspect; pastillas_freno 10000/6 inspect
   with replaceCriterion { measure 'grosor', limit 1, unit 'mm' }; liquido_frenos 40000/24 replace;
   rotacion_llantas 10000/6 rotate; bateria months 36 inspect; plumillas months 12 inspect.
   Add a comment on top: "DEMO VALUES — replace with the extracted spec before shipping".
3. mobile/src/state/vehicle-context.tsx: extend the provider with vehicle: VehicleProfile, readings:
   OdometerReading[], records: ServiceRecord[], assumeDoneAtAcquisition: Set<string>, and actions
   addReading(km, date?), addRecord(record), setUsage(usage), setAcquisition(a), assumeDone(componentId).
   updateMileage(km) must now APPEND a reading (never overwrite). Migrate the old mock: vehicle.mileage +
   mileageUpdatedAt become the first reading; the old lastDoneAt items become ServiceRecords with the km
   from the canonical fixture (aceite 2026-06-02 @ 83,600; filtro de aire 2026-07-18 @ 85,900).
4. Persistence: npx expo install expo-sqlite and use expo-sqlite/kv-store (Storage.getItem/setItem with a
   JSON blob under key 'fixly.vehicle.v1'); hydrate on mount with a `hydrated` flag so screens can show the
   Skeleton; debounce writes. Explain in a comment why kv-store and not AsyncStorage.
5. mobile/src/state/use-maintenance.ts: useMaintenance() → { spec | null, estimates: WearEstimate[]
   (from estimateAll, today = new Date() as 'YYYY-MM-DD' computed once per minute), byZone, worst,
   hydrated, coldStart: boolean (no spec for this vehicle) }. Recompute with useMemo is NOT needed (React
   Compiler); just call estimateAll in render.
6. Update mobile/src/app/(tabs)/plan.tsx, mobile/src/app/historial/*.tsx and mobile/src/app/servicio/[id].tsx
   to read from useMaintenance()/records instead of maintenancePlan/history, keeping their current layout.
   plan.tsx: sort by dueAtKm, place the "Hoy" divider at the current odometer, overdue items above it in
   statusExpired. servicio/[id] takes a componentId now.
7. Delete the old maintenancePlan/history exports and every `next`/`done` usage. `npx tsc --noEmit` clean.

ACCEPTANCE
- Editing the mileage in vehiculo.tsx changes the status shown everywhere (no screen reads a static array).
- Killing and reopening the app keeps readings and records.
- The correa/cadena row shows "El manual no programa un cambio; se revisa si hay ruido", never "Al día".
- No route file references 'motor' | 'frenos' as a type anymore.
~~~

### P3 · El dibujo del auto (asset SVG por capas)

Pega después: nada. Depende de: P0. Sirve para un agente que pueda emitir SVG (todos pueden) o como brief para un ilustrador.

~~~
TASK P3 — Produce two layered technical line drawings as SVG, ready for codegen.

Deliver two complete SVG files as text (no rasters, no <text>, no CSS, no filters, no masks, no group
transforms; every shape as <path> with absolute coordinates, 2-decimal precision; stroke-linecap and
stroke-linejoin round):

A) topdown.svg — viewBox="0 0 240 400", a generic 5-door hatchback/sedan seen from above, hood at the top,
   proportions ~183 wide x 372 long. Layers as <g id="..."> in this order: silhouette (body outline, hood
   crease, windshield, roof, rear glass, mirrors, door seams; stroke #9aa3ad width 2), wheels (four rounded
   rects, no tread hatching; stroke #9aa3ad width 1.5), zones (one <path id="zone_<id>"> per zone drawn as
   the component's simplified outline in stroke #4b5563 width 1.5: zone_motor engine block under the hood,
   zone_refrigeracion radiator bar at the front, zone_electrico battery box front-left, zone_transmision
   gearbox behind the engine, zone_frenos four discs inside the wheels, zone_llantas the four tires,
   zone_cabina the cabin filter area under the windshield, zone_combustible the tank at the rear), anchors
   (one <circle id="anchor_<zone>" r="1"> at the centroid of each zone, fill none), hit (one filled
   <path id="hit_<zone>"> per zone, fill #000 opacity 0 — MUST be at least 37x37 viewBox units, may overlap
   the drawing but not other hit paths; wheels share one hit per corner for frenos+llantas: id hit_esquina_di,
   hit_esquina_dd, hit_esquina_ti, hit_esquina_td).
B) enginebay.svg — viewBox="0 0 360 300", the engine bay seen from above with the hood open, generic
   transverse 4-cylinder: layers silhouette (bay walls, strut towers, firewall; #9aa3ad width 2), components
   (stroke #4b5563 width 1.5, one path per id): comp_aceite_motor (oil filler cap + dipstick loop + the
   filter canister at the side), comp_filtro_aire_motor (air box with the intake duct), comp_bujias (valve
   cover with four plug wells / coil pack), comp_correa_distribucion (belt cover at the engine end),
   comp_correa_accesorios (pulley set at the other end), comp_refrigerante (expansion reservoir + the
   radiator top with the cap), comp_bateria (battery with two terminals), comp_liquido_frenos (brake fluid
   reservoir on the firewall), comp_liquido_direccion (steering reservoir); anchors and hit as in A
   (hit >= 56x56 units here).

Style: technical, calm, no shading, no hatching, uniform stroke weights, nothing under 1.25. Keep each
file under 250 elements and no single path over 2,000 units long (measure with svg-path-properties if you
can; otherwise split long paths). No brand marks. The drawing must read at 160 px wide on a sunny screen:
prefer fewer, clearer lines.

After the SVGs, output a Node script scripts/svg-to-paths.ts (svgson + svg-path-properties) that reads
both files and writes mobile/src/assets/car/topdown.ts and enginebay.ts exporting
  export type CarPath = { id: string; zone: string; d: string; strokeWidth: number; length: number;
    anchor: { x: number; y: number }; hit?: string };
  export const TOPDOWN: { viewBox: [number, number, number, number]; paths: CarPath[] };
with length computed by svg-path-properties and anchor read from the anchor_ circles. Also emit a
public/car-paths.json with the same data for an HTML prototype.

ACCEPTANCE
- Both SVGs open unchanged in Figma with the ids intact; every zone/component id listed above exists.
- No <text>, <style>, <filter>, <mask>, transform= or rgba() anywhere.
- Every hit path is a closed filled polygon meeting the minimum size; none overlap each other.
- The script runs with `npx tsx scripts/svg-to-paths.ts` and prints the count of paths per layer.
~~~

### P4 · El medidor de aceite: `IntervalRing` e `IntervalBar` (react-native-svg + Reanimated)

Pega después: `wear-types.ts`. Depende de: P0.

~~~
TASK P4 — Build the interval gauge components with react-native-svg + Reanimated 4.

Create mobile/src/ui/IntervalRing.tsx and mobile/src/ui/IntervalBar.tsx, plus a demo screen
mobile/src/app/dev/gauges.tsx that renders every state side by side with the canonical fixture numbers.

IntervalRing props: { estimate: WearEstimate; componentLabel: string; size?: number (default 132);
  onPressHelp?: () => void }.
Geometry: two concentric tracks. Outer track = km (radius size/2 - 8), inner track = time (radius
size/2 - 22). The BINDING track (estimate.binding) is drawn 10 px thick in the status color; the other 4 px
in textTertiary at 60 % opacity. Background tracks hairline 1 px in border color. Start at 12 o'clock,
clockwise, round caps. A 2 px tick at 12 o'clock marks 100 % (the manual's interval). A faint band
(statusWarnSoft, 10 px) covers the "pronto" window before the tick: for km, clamp(0.2*interval, 500, 5000)
/ interval of the circle; for time, clamp(0.2*intervalDays, 14, 60) / intervalDays. When percent > 1, draw
the excess as a second arc in statusExpired ON TOP, starting at the tick, length (percent-1) clamped to 0.5.
Fill the active arc with one subtle LinearGradient (status color → 12 % darker), and simulate an inner
shadow with a duplicate arc at 30 % opacity offset by 1 px. Nothing else. No blur, no glow, no filters.
Center stack (RN <Txt>, not SVG text): bigNumber tabular "530 km"; bodySmall "o 11 días" (or "o —" when
remainingDays null); a StatusChip-like pill with the Spanish status word (use statusWarn TEXT #b45309 for
pronto/toca). Below the ring, outside it: body "Según el manual: cada 5,000 km o 6 meses" and the
confidence label in bodySmall; a 40 px "?" tertiary button calls onPressHelp.
States: ok / pronto / toca / vencido (excess arc + "se pasó 3,070 km" replaces "o X días") / sin_datos
(dashed gray outer track strokeDasharray [4,6], center "Sin datos", no chip, no gradient) / inspect items
(use the inspect wording; the ring measures the INSPECTION interval).
Animation: on mount and whenever the estimate changes, animate strokeDashoffset of the active arc with
withTiming(240 ms, Easing.bezier(0.22,1,0.36,1)) via useAnimatedProps on
Animated.createAnimatedComponent(Circle). Read AccessibilityInfo.isReduceMotionEnabled once; if true,
set the final value with no timing. Never loop, never pulse.
Accessibility: accessibilityRole="image", accessibilityLabel = "Aceite y filtro: pronto, faltan 530
kilómetros o 11 días, estimación confiable". Numbers formatted with formatKm; days as "11 días".

IntervalBar props: { estimate: WearEstimate; height?: number (6) }. Same semantics as the binding track
of the ring, horizontal: hairline track, active fill in status color, tick at 100 %, warn band before it,
excess segment after it in red; inspect items render the words "Revisar en el próximo servicio" instead
of a bar. Animate width via transform scaleX on an Animated.View (transform only), 160 ms change easing.

Copy: never "nivel", "% de vida", "desgaste real". The ring's small caption reads "Intervalo".

ACCEPTANCE
- The demo screen shows: ok 30 %, pronto 89 % (canonical fixture), toca 100 %, vencido 161 % with the red
  excess arc, sin_datos dashed, and a pastillas_freno inspect example — with no overlapping text at
  size 132 on a 360 px wide screen.
- All numbers are tabular and do not shift width while animating.
- No linear easing, no repeat, no glow. `npx tsc --noEmit` clean. No new dependencies.
~~~

### P5 · Mapa del auto y coreografía de revelación

Pega después: `mobile/src/assets/car/topdown.ts` y `enginebay.ts` (salida de P3), `wear-types.ts`, `video-analysis.json` (opcional, solo la sección `choreography`). Depende de: P0, P3, P4.

~~~
TASK P5 — Build CarMap (JSX react-native-svg with per-zone hit regions and word markers) and the reveal
choreography hook, replacing mobile/src/ui/CarDiagram.tsx.

1. mobile/src/ui/CarMap.tsx props: { view: 'topdown' | 'enginebay'; zoneStates: Record<Zone, { status:
   WearStatus; count: number; label: string }>; selectedZone?: Zone; onPressZone(zone); reveal?:
   SharedValue<number> (0..1, drives the draw-in) }.
   Render <Svg viewBox width="100%" style={{aspectRatio}}> with three memoized layers: static (silhouette +
   wheels, plain <Path>s), zones (one AnimatedPath per zone/component with stroke color by status, opacity
   0.35 when another zone is selected, strokeDasharray [length,length] and strokeDashoffset driven by the
   reveal shared value with the per-path delay computed from its gravity rank), hit (transparent filled
   <Path onPress> per zone, hitSlop 8, accessibilityRole button, accessibilityLabel "{label}: {status word},
   {count} pendientes"). Markers are React Native chips (not SVG text) positioned absolutely from
   anchor * (renderedWidth / viewBoxWidth) after onLayout: a 28 px disc in StatusMeta.soft with the status
   WORD (label variant, #b45309 for warn) or the count when > 1; min tappable 56 px via padding. No halo,
   no glow, no pulsing. Colors: statusOk / statusWarn / statusExpired / textTertiary (sin_datos).
2. mobile/src/lib/use-reveal.ts: useReveal(items: { id: string; rank: number }[]) → { progress:
   SharedValue<number>, play(), skip(), reset(), reduceMotion: boolean }. play() runs progress 0→1 with
   withTiming(240 + 60 * (items.length - 1)) so each item's own window is <= 240 ms and the stagger is
   60 ms (worst rank first); skip() sets progress to 1 immediately; under reduce-motion play() === skip().
   Export a helper delayFor(rank) and a windowFor() so CarMap and the list share the same timeline.
3. Zone focus: when selectedZone changes, an Animated.View wrapping the Svg animates transform
   [{scale: 1 → 1.06}, {translateX/Y toward the zone anchor}] over 200 ms (arrive easing) and back in
   140 ms; the topdown layer cross-fades to the enginebay view over 200 ms when the zone is motor (other
   zones keep the topdown with the zone highlighted). Do NOT scale beyond 1.06 (strokes thicken; no
   non-scaling-stroke in react-native-svg).
4. mobile/src/ui/ZoneChips.tsx: the horizontal row of zone chips (56 px, icon + label + status word),
   scrollable horizontally ONLY if it does not fit (that is a scroll, not a swipe carousel).
5. Performance: the static layer must not re-render when zoneStates change (split components, stable
   props); only animatedProps change per frame; add renderToHardwareTextureAndroid on the static layer
   during the focus animation; total nodes under 250 per view.
6. Replace CarDiagram usages in mobile/src/app/mapa.tsx with CarMap + ZoneChips; on zone press: set
   selectedZone, call play(), and render the zone's component list below (StatusRow + IntervalBar per
   component, entering with FadeInDown.duration(200).delay(delayFor(rank))). Tapping anywhere while the
   reveal runs calls skip(). Back press resets.

ACCEPTANCE
- Reveal from tap to rest <= ~900 ms for 6 components; every element's own animation <= 240 ms; reduce
  motion renders the final state instantly; content is visible even if animations never run.
- Every marker shows a WORD or a COUNT, never a bare colored dot; every hit region is >= 56 px on a 360 px
  screen (verify by logging rendered sizes in dev).
- No blur, no filters, no pulsing, no swipe gesture handlers. `npx tsc --noEmit` clean.
~~~

### P6 · Pantallas: `CarHealthCard` en Estado, Mapa, Sistema, Servicio, Registrar

Pega después: `wear-types.ts`, `code-audit.json` (opcional). Depende de: P0, P1, P2, P4, P5.

~~~
TASK P6 — Build the screens so the driver SEES the details without tapping, and can record a service.

1. mobile/src/ui/CarHealthCard.tsx (Surface md): row 1 = CarMap topdown at ~55 % width with word
   markers | IntervalRing (size 120) of the WORST component (usually aceite_motor); row 2 = StatusRow of
   that component: title "Aceite y filtro", status word, detail "Faltan ~530 km · aprox. 14 de setiembre";
   row 3 = freshness + action: "87,400 km · hace 14 días" (mono) + Button tertiary "Actualizar km" (opens
   an inline number pad sheet that calls addReading). If lastReadingAgeDays > 45, row 3 becomes an
   AlertBanner tone warn: "Actualiza tu kilometraje para afinar la estimación". States: hydrating →
   Skeleton with the exact shape; coldStart → header "Todavía no tenemos el manual de tu Toyota Yaris 2015",
   the drawing without markers, two Buttons "Fotografiar mi manual" / "Escribir los intervalos de mi
   libreta"; no readings → only "¿Cuántos km marca hoy?" with the number pad. Tap on the drawing →
   router.push('/mapa'); tap on a marker → router.push({ pathname: '/sistema/[system]', params }).
   Replace the IconRow at mobile/src/app/(tabs)/estado.tsx lines 79-87 with this card; change the
   "Próximo servicio" StatTile to value "en 530 km" caption "≈ 11 días", valueColor by status (never accent).
2. mobile/src/app/mapa.tsx: CarMap + ZoneChips + the selected zone's list (from P5).
3. mobile/src/app/sistema/[system].tsx (rename from [zone]; register in the root Stack with
   presentation 'formSheet', sheetAllowedDetents [0.55, 1], sheetGrabberVisible): AlertBanner-style verdict
   card for the zone's worst component (title "Aceite y filtro · Pronto", explanation from selectors, "Si
   no lo haces: …"), label "Componentes según tu manual", one StatusRow + IntervalBar per component sorted
   by gravity, inspect items with "Revisar en el próximo servicio", sin_datos rows with a tertiary
   "Registrar último cambio". Footer Button primary "Registrar un servicio".
4. mobile/src/app/servicio/[id].tsx (id = componentId): keep the existing blocks, add on top the
   IntervalRing (size 132), the sentence "Según el manual, cada 5,000 km o 6 meses, lo que ocurra primero",
   "Último cambio que registraste: 02 JUN 2026 a 83,600 km", the confidence label, and the "?" that opens a
   bottom sheet with the Spanish explanation of the estimate (manual + your records, no sensors, how km/day
   was estimated, the assumption label if any). Footer: primary "Registrar que ya lo hice", tertiary
   "Agendar este servicio" (no-op for now, say so in a comment).
5. mobile/src/app/registrar.tsx (formSheet): fields componentes (multi-select chips, preselected from the
   param), fecha (default today, no future dates), kilometraje (number pad, default last reading, warn if
   lower than the last reading: "Es menor que tu último registro de 87,400 km. ¿Está bien?"), costo S/,
   taller, tipo (cambiado / revisado bien / revisado: hay que cambiar). Save → addRecord + addReading, go
   back, and the ring animates to its new value (colorChange 160 ms).
6. Onboarding additions in mobile/src/app/index.tsx flow (after the plate is found): step "¿Cómo usas tu
   auto?" (4 switches), step "¿Lo compraste nuevo o usado?" (+ date + km), step "Último cambio de…" for
   aceite_motor, filtro_aire_motor, pastillas_freno, liquido_frenos, refrigerante with date + km and a
   "No sé" per item (creates unknown_before_purchase; for used cars shows the secondary "Asumir que se
   hizo cuando compré", never pre-checked).
7. All Spanish copy in mobile/src/lib/wear/copy.ts. Peruvian formats. No banned words.

ACCEPTANCE
- Home answers "¿cuándo cambio el aceite?" with zero taps: km left, days left, date, status word, basis.
- Recording an oil change at 88,100 km today turns the ring green ("Al día") everywhere within one render.
- Every status shows word + bar/color + explanation; no bare dots remain (estado.tsx document rows too).
- All touch targets >= 56 px; reading text >= 15 px; `npx tsc --noEmit` clean; typed routes updated.
~~~

### P7 · Variante Skia (fase 2): escena del motor con realismo

Pega después: `enginebay.ts` (P3), `wear-types.ts`, `tech-research.json` (opcional, sección Skia). Depende de: P0, P3.

~~~
TASK P7 — Build the Skia variant of the engine-bay reveal and the interval ring, behind a feature flag.

Install exactly the version Expo Go carries: `npx expo install @shopify/react-native-skia` (expected
2.6.2 for SDK 57; confirm with `npx expo install --check`; any other version needs a development build —
say which you used). Skia >= 2.10 requires Reanimated 4, already installed.

1. mobile/src/ui/skia/EngineBayCanvas.tsx: a <Canvas> that draws the enginebay paths (Skia.Path.MakeFromSVG
   String(d)) in three groups: static (bay silhouette recorded once into a Picture via
   Skia.PictureRecorder and drawn with <Picture>), components (one <Path> per component with `start={0}`
   `end={progress}` where progress is a Reanimated shared value 0..1 offset per gravity rank — the line-draw
   without precomputed lengths), highlight (the selected component's path again with a BlurMask
   style="outer" blur 6 in the status color at 35 % opacity, plus a Shadow dx 0 dy 2 blur 4 for depth).
   Fluid identification colors as gradients: oil parts get a LinearGradient amber (#f59e0b → #b45309),
   coolant parts blue (#60a5fa → #1d4ed8), brake fluid purple — identification only, never status.
   Canvas props: androidWarmup for the static case; mount the Canvas early behind the Skeleton to hide
   Android first-frame latency.
2. Hit testing: Skia has none. Implement ONE Gesture.Tap (react-native-gesture-handler) on the Canvas;
   map the touch to canvas units and test `hitPath.contains(x, y)` against each component's hit polygon;
   provide an accessible overlay of invisible Pressables (56 px) positioned from the anchors so
   TalkBack/VoiceOver still work.
3. mobile/src/ui/skia/IntervalRingSkia.tsx: same API and semantics as IntervalRing (P4) using Skia Path
   arcs with `end` trim, a SweepGradient on the active arc, and a soft inner Shadow; text stays React
   Native <Txt> overlays (Skia text is not in the accessibility tree).
4. Feature flag: mobile/src/lib/flags.ts exports USE_SKIA (default false); CarHealthCard/Sistema pick the
   Skia or SVG components. Both must render the same data identically in layout.
5. Measurement protocol (write it as mobile/docs/skia-gate.md): on the slowest real Android available,
   record (a) time from mount to first frame of the Canvas, (b) frame time during the reveal (Perf
   Monitor / adb shell dumpsys gfxinfo), (c) side-by-side outdoor legibility photo vs the SVG version,
   (d) APK size delta with App Bundles. Decision rule: adopt only if (a) < 150 ms after warm-up, (b) no
   frame > 32 ms, and (c) is at least as legible.

ACCEPTANCE
- USE_SKIA=false leaves the app byte-identical in behavior; USE_SKIA=true renders the reveal with path
  trim and the highlighted component glow, and tapping a component opens its Servicio screen.
- No SVG import through ImageSVG (it drops text/CSS/rgba); paths only.
- All motion <= 240 ms per element with the reveal stagger; nothing loops. Reduce motion respected.
~~~

### P8 · Exploración 3D y pseudo-3D (solo para decidir, no para enviar)

Pega después: `tech-research.json` (secciones `threeDAssessment` y opción 5a/5b). Depende de: P0.

~~~
TASK P8 — Two time-boxed spikes to settle the 3D question with numbers, not opinions.

SPIKE A (pseudo-3D, recommended if any 3D): pre-rendered turntable.
1. Write a Blender 4.x Python script that loads a generic hatchback GLB (state the CC0/CC-BY source you
   assume, e.g. a Poly Haven or Sketchfab CC0 model; do not fabricate a URL — leave a TODO if unsure),
   sets a white world, a soft three-point light, an orthographic-ish 35 mm camera at 25° elevation, and
   renders 36 frames at 10° steps, 1080x810, EEVEE, then converts to WebP q80 with a second script (sharp
   or cwebp). Also export a JSON of the 2D projection of 9 named empties (motor, refrigeracion, electrico,
   transmision, frenos_di/dd/ti/td, combustible) per frame: { frame, anchors: { id: {x, y} } }.
2. Write mobile/src/ui/Turntable.tsx using expo-image (already available in SDK 57): prefetch all frames,
   render the current one, scrub ONLY by explicit horizontal drag on the image (not on lists), 30 fps max,
   and overlay 56 px Pressable markers positioned from the per-frame anchors. Frames are decoration: the
   2D CarMap stays the source of truth beneath.
3. Report: asset size for 36 frames at 1x and 2x, memory on a 2 GB device, and whether a drag gesture
   fits the "tap and vertical scroll only" rule (it does not; say so, and propose the alternative: a
   static 3/4 frame chosen by zone, no drag).

SPIKE B (real-time 3D, expected to fail the gate): @react-three/fiber 9.7 + three 0.185 + expo-gl 57.
1. Install (`npx expo install expo-gl` + `npm i three @react-three/fiber @react-three/drei`), add
   metro.config.js assetExts for glb/gltf, and render the same GLB in a <Canvas> from
   '@react-three/fiber/native' with useGLTF from '@react-three/drei/native'; named meshes get
   onPointerDown to log the zone.
2. Measurement protocol on the slowest real Android: frame time during 5 s of orbit, GLView cold start,
   device temperature after 2 minutes, battery per 10 minutes, and outdoor legibility vs the 2D map.
   Gate: no frame > 32 ms, cold start < 800 ms, no thermal throttling. Report numbers; do not argue.

Deliver both spikes as separate folders under spikes/ (not in the app's routes), with README files that
say exactly how to run them and what was measured. Do not touch the app's screens.
~~~

### P9 · Extraer los intervalos de un manual (correr sobre un PDF)

Pega después: `manual-extraction-prompt.md` (es el prompt en sí; pégalo completo) y `maintenance-spec.schema.json`, luego las páginas del manual como texto o imágenes con marcadores `[PAGE n]`. Depende de: nada.

~~~
TASK P9 — Extract a MaintenanceSpec from an owner's manual.

You will receive, after this message: (1) the extraction prompt, which is your instruction set; (2) the
JSON schema the output must validate against; (3) the manual pages, each preceded by [PAGE n].
Follow the extraction prompt literally. Output ONLY the JSON. Then, in a second message when asked,
run the self-checks: schema validity, every component has pageRefs, severe <= normal, every catalog id
present exactly once or per variant or with notInManual true, no string > 200 chars, months are integers,
km multiples of 500 (else flagged), and list every unit conversion you made.
Remember the legal rule: facts only — numbers, action codes, page references. Never copy a sentence,
heading, footnote or caption from the manual.
~~~

### P10 · Prototipo HTML para probar la interacción en el navegador (sin React Native)

Pega después: `public/car-paths.json` (P3) si existe; si no, el agente dibuja el auto inline. `wear-engine.ts` y `wear-types.ts` para portar el cálculo a JS. Depende de: P0.

~~~
TASK P10 — Build a single-file HTML prototype of the interaction so it can be tested in any browser.

One file, prototype.html, everything inline (CSS, JS, SVG), no external scripts, fonts or images; system
font stack. A 390x844 phone frame centered on a neutral page (subtle outline; NO fake status bar, NO fake
keyboard). Use the design tokens from the context block. Respect prefers-reduced-motion.
Screens (client-side state, no router): (1) Estado with the CarHealthCard (mini top-down car with word
markers, the interval ring of the worst component, the StatusRow, the freshness row with "Actualizar km"
that opens an inline number input and recomputes everything); (2) Mapa: full drawing + zone chips; (3) tap
"Motor": reveal choreography — header fades 140 ms, drawing scales 1→1.06 toward the engine 200 ms,
cross-fade to the engine-bay view 200 ms, component strokes draw in worst-first with stroke-dashoffset
(<= 240 ms each, 60 ms stagger), markers land, component rows enter staggered; tap anywhere skips; (4)
Sistema: verdict card + component rows with IntervalBar; (5) Servicio: IntervalRing + facts + "?" panel
explaining the estimate; "Registrar que ya lo hice" opens a form whose save updates the data and re-renders
every gauge. Port estimateWear/estimateAll to plain JS faithfully (keep the function names) and seed the
canonical fixture; add a second demo car with the oil at 80,000 km to show "Vencido".
Draw the top-down car and the engine bay yourself as inline SVG following the P3 layer spec if no
car-paths.json is provided. Keep the file under 150 KB. Self-check the HTML for unbalanced tags and the
JS for syntax errors before answering (mentally trace the state machine).

ACCEPTANCE
- Opening prototype.html shows Estado with "Pronto · faltan ~530 km · aprox. 14 de setiembre".
- Changing the odometer to 88,700 flips the oil to "Toca ahora"/"Vencido" consistently with the engine.
- The reveal completes in under ~900 ms and can be skipped; with reduce-motion it is instant.
- No status is color-only; every number carries its attribution; no banned words.
~~~

### P11 · Revisión: auditar cualquier resultado contra las reglas

Pega después: el código o el diseño a revisar. Depende de: P0.

~~~
TASK P11 — Review the attached output against the Fixly rules and report findings only (no rewrites).

Check, in this order, and cite file:line for each finding:
1. Honesty: any user-facing text with a banned word; any number without its attribution ("según el
   manual", "estimado con tu kilometraje"); any state derived from something that is not the manual
   interval + user records; any default that pretends a service was done; any placeholder interval
   rendered as a status.
2. Status encoding: any status communicated by color alone (dots, tints, bars without a word); amber text
   lighter than #b45309 on a light chip; accent green used for a value that carries state.
3. Motion: any animation over 240 ms that is not part of the tap-triggered reveal; any linear or
   ease-in-out easing; anything that loops, pulses, breathes, bounces or glows; blur; animation of
   width/height/top/left instead of transform/opacity; reveal not skippable or not disabled under reduce
   motion; content parked at opacity 0 waiting for an animation.
4. Touch and legibility: targets under 56 px; reading text under 15 px; secondary text lighter than #555;
   overlapping elements; swipe/long-press/pull-to-refresh gestures.
5. Data: screens reading static arrays instead of the maintenance selectors; mileage edits that overwrite
   instead of appending a reading; records without km handled as if they had km; future dates accepted.
6. Performance: whole SVG tree re-rendering on state change; SVG filters/blur; more than 250 nodes per
   drawing; scale transforms beyond 1.06 on stroked SVG; Skia canvases without warm-up or hit overlay.
7. Format and language: non-Peruvian number/date formats, "septiembre", Title Case buttons, English
   strings in the UI, emojis.
Output a table: severity (blocker/major/minor) · file:line · rule · what is wrong · minimal fix.
~~~

---

## 9. Preguntas abiertas (solo tú puedes contestarlas)

Estas cambian qué se construye primero. No bloquean los prompts P1–P4 ni P9–P11; sí afectan P5–P8.

1. **Momento de uso número uno:** ¿entre carreras (respuesta en 3 s sin tocar), en el taller (verificar al mecánico, por zonas) o al recibir un aviso? Decide qué pantalla se optimiza primero: el home, el mapa o la notificación.
2. **Captura del kilometraje:** ¿cada cuánto y por qué canal (al abrir, aviso cada 14 días, foto del tablero)? ¿Aceptas estimar por promedio cuando no responde, etiquetado como estimado? Es el supuesto más riesgoso del plan.
3. **Los primeros 10 modelos de la base de manuales:** ¿tienes ya algún PDF o libreta? NEGOCIO.md sugiere Toyota, Kia, Hyundai primero, luego Changan, Chery, Jetour. P9 se puede correr hoy con el primero que tengas.
4. **Autos usados sin historial (la mayoría de tu parque):** ¿aceptas que el estado inicial sea "Sin datos, regístralo" con la opción explícita "asumir que se hizo cuando compré", en vez de inventar una fecha?
5. **Momento en el plan de negocio:** ¿esto va antes o después del Hito 4 de NEGOCIO.md (validar demanda de mantenimiento con ≥ 25 %)? Si va antes, ¿es un prototipo para vender la idea (P10 basta) o producto (P1–P6)?
6. **Expo Go o development build:** Skia a 2.6.2 corre en Expo Go; cualquier otra versión, Rive y los builds con config plugins exigen dev build. ¿Usas EAS?
7. **Tema:** la app es clara con verde; DESIGN.md es oscuro con dorado. Este documento asume claro/verde. Si cambias a oscuro, cambian los tokens de P0 y nada más.
8. **Web:** `react-native-web` está en las dependencias y `app.json` tiene salida web estática. ¿Es objetivo? Si sí, Skia cuesta ~3 MB de CanvasKit y hay que decidirlo antes de la fase 2.

---

## 10. Estado de la implementación (3 de setiembre de 2026)

Después de escribir este plan, Victor pidió construirlo "igual al video". Está implementado en `mobile/` sobre el camino A (react-native-svg + Reanimated, sin dependencias nuevas salvo `expo-sqlite` para persistir) y probado en el simulador de iPhone y en web:

- **Motor de cálculo** en `mobile/src/lib/wear/` (tipos, motor, selectores y todo el copy en español en un solo archivo).
- **Datos:** catálogo de componentes (`src/data/catalog.ts`), spec de demo del Yaris marcado como DEMO (`src/data/specs/`), zonas (`src/data/zones.ts`), registros de demo (`src/data/demo.ts`), dibujo del auto generado por script (`src/assets/car/drawing.ts`, `scripts/build-car-drawing.mjs`, `assets/car/car-drawing.svg` para abrir en Figma).
- **Estado:** `vehicle-context.tsx` guarda lecturas de kilometraje y servicios (cada edición de km es una lectura nueva, nunca sobrescribe) y persiste en SQLite (nativo) o localStorage (web); `use-maintenance.ts` recalcula todas las estimaciones en cada render.
- **UI:** `IntervalRing` (anillo de dos pistas con muesca y arco de exceso), `IntervalBar`, `CarMap` (SVG en JSX con regiones de toque y trazos que se dibujan), `ZoneChips`, `ComponentRow`, `CarHealthCard` en el home, `KmPrompt`.
- **Pantallas:** `estado.tsx` (la tarjeta reemplaza al botón), `mapa.tsx` (mapa → tocar zona → revelación como en el video: el encabezado se desvanece, el dibujo hace zoom, el esquema del motor se dibuja, tarjetas narran, marcadores caen, el estado se resuelve, y entra el veredicto con la lista), `servicio/[id].tsx`, `registrar.tsx`, `plan.tsx`, `historial`, `vehiculo.tsx` (perfil de uso).

Decisiones que se apartan de este documento, a pedido de Victor: la revelación dura ~3 s en vez de respetar el techo de 240 ms (constante `SPEED` en `mapa.tsx`; siempre se puede saltar con un toque y con "reducir movimiento" va directo al resultado); hay un tooltip anclado sobre el dibujo y una píldora de controles como en el video.

Lo que sigue sin hacerse: la verificación adversarial de las 63 afirmaciones técnicas y el jurado de diseños (límite de uso); la base real de manuales (P9); las notificaciones; "Agendar este servicio" no hace nada aún.

---

## 11. Fuentes principales

Convención "lo que ocurra primero" y condiciones severas: Toyota (guías de mantenimiento; "special operating conditions" incluye taxi y caminos con polvo), Chery Perú (5,000 km o 6 meses), Geely Perú (libro de garantía GX3 Pro 2025: 7,500 km o 12 meses), Changan (10,000 km o 6 meses). Las URL exactas están en `detalle-auto/tech-research.json` y en `detalle-auto/feasibility.json` (campo `verdict`).

Versiones y compatibilidad: `expo/expo` rama sdk-57 (`bundledNativeModules.json`, `apps/expo-go/package.json`), docs.expo.dev v57 (svg, skia, gl-view, image), docs de Reanimated (compatibilidad, animating-svg), react-native-svg (USAGE.md, issue #2636), react-native-skia (installation, bundle-size, path, animations, gestures, images-svg, text, mask-filters, shadows, canvas), lottie-react-native (README, api.md, releases), Rive (docs de React Native y Expo, blog de precios 2025-10-20), @react-three/fiber (npm, PR #3539, docs de instalación), expo-gl CHANGELOG, expo-three (npm, estancado en three ^0.166). 63 afirmaciones con URL en `detalle-auto/tech-research.json`.

Legal: Decreto Legislativo 822 (Perú), arts. 8 y 9; Feist Publications v. Rural Telephone (EE. UU., 1991); Ley 29733 (datos personales). No es dictamen legal.

Diseño: `DESIGN.md`, `PANTALLAS.md`, `NEGOCIO.md`, `mobile/src/theme/tokens.ts` de este repo.
