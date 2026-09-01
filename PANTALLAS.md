# Pantallas de la app

Ocho pantallas y sus prompts, listos para pegar. Cada prompt asume que `DESIGN.md`
ya está cargado como sistema de diseño: **no repitas colores ni tipografías en el
prompt**, referéncialas por nombre. Si el generador no soporta adjuntar el sistema,
pega el bloque de la sección 2 y 3 de `DESIGN.md` antes del prompt.

Formato objetivo: **390 × 844**, móvil, tema oscuro.

---

## El recorrido

```
  P1 Placa  ──►  P2 Estado del auto  ──┬──►  P3 Plan de mantenimiento ──► P4 Detalle
                        │              │
                        │              ├──►  P5 Ficha del vehículo
                        │              ├──►  P6 Revisar proforma
                        │              └──►  P7 Avisos
                        └──────────────────►  P8 Historial
```

P2 es la casa. Todo lo demás cuelga de ahí.

---

## P1 · Entrada por placa

> Pantalla de bienvenida de una app móvil de mantenimiento vehicular, tema oscuro.
> Una sola tarea: escribir la placa del auto.
>
> Arriba a la izquierda, el logotipo: una placa vehicular estilizada con una franja
> dorada a la izquierda y una F. Debajo, un titular corto en condensada pesada que
> plantea el problema del usuario, no la función del producto.
>
> El centro es un **campo que parece una placa vehicular real**: fondo claro casi
> blanco, franja dorada vertical de 15 px pegada al borde izquierdo, texto en
> condensada 800 con espaciado amplio entre letras, mayúsculas, formato ABC-123.
> El placeholder muestra el patrón, no una instrucción.
>
> Debajo, un botón dorado de ancho completo y 56 px de alto. Bajo el botón, una
> línea en monoespaciada tenue que dice que no se pide registro.
>
> Fondo: tinta con un halo dorado muy sutil detrás del campo. Sin ilustraciones,
> sin mascotas, sin barra de estado dibujada.

---

## P2 · Estado del auto — pantalla principal

> Pantalla principal de una app de mantenimiento vehicular, tema oscuro, móvil.
>
> Arriba: la placa del usuario en un chip claro que parece una placa real, junto al
> nombre del vehículo en condensada pesada mayúscula, y debajo año y color en
> monoespaciada tenue.
>
> Un bloque de resumen grande responde una sola pregunta —¿puedo salir hoy?— con
> una frase corta en condensada y el conteo de pendientes.
>
> Debajo, una lista de **filas de estado**. Cada fila: barra de color de 4 px
> pegada al borde izquierdo, nombre del documento o servicio en condensada 700,
> chip a la derecha con la **palabra** del estado, y una línea en monoespaciada con
> los días que faltan o pasaron. En las filas vencidas, la cifra del costo aparece
> como el elemento más grande de esa tarjeta.
>
> Orden por gravedad: lo vencido arriba, lo vigente al final.
>
> Al pie, navegación de cuatro destinos: estado, plan, historial y ajustes.
> Sin barra de estado del sistema dibujada, sin teclado falso.

---

## P3 · Plan de mantenimiento

> Lista del mantenimiento que le toca a un vehículo, tema oscuro, móvil.
>
> Encabezado con el kilometraje actual en cifra grande condensada y, debajo, en
> monoespaciada, el kilometraje del próximo servicio.
>
> El cuerpo es una **línea de tiempo vertical por kilometraje**, no un calendario.
> Cada hito es una fila con el kilometraje a la izquierda en monoespaciada, y a la
> derecha el servicio en condensada con los repuestos implicados en texto tenue.
> Los hitos ya pasados van atenuados; el próximo lleva la barra dorada y ocupa más
> altura que el resto.
>
> Un separador de una línea marca dónde está el auto hoy dentro de esa secuencia.
>
> Sin tarjetas: las filas se separan con líneas de 1 px y espacio.

---

## P4 · Detalle de un servicio

> Detalle de un servicio de mantenimiento, tema oscuro, móvil.
>
> Título en condensada pesada con el nombre del servicio. Debajo, tres datos en
> fila separados por líneas verticales: cada cuántos kilómetros toca, cuándo fue la
> última vez, y el rango de precio en cifra condensada.
>
> Luego un bloque de texto corto que explica **qué hace ese servicio y qué pasa si
> no se hace**, escrito para alguien que no sabe de mecánica: sin jerga de taller,
> frases cortas, segunda persona.
>
> Debajo, una lista de qué debería incluir el trabajo, con líneas de 1 px entre
> ítems, para que el usuario pueda comparar contra lo que le cobran.
>
> Al pie, un solo botón dorado. Nada compite con él.

---

## P5 · Ficha del vehículo

> Ficha de datos de un vehículo, tema oscuro, móvil.
>
> Arriba, la placa en el chip claro y el modelo en condensada. Debajo, los datos en
> **pares etiqueta/valor sobre líneas de 1 px**, sin tarjetas: marca, modelo, año,
> motor, color, combustible.
>
> Un bloque aparte y editable para el kilometraje actual, con el campo destacado
> porque es el único dato que el usuario mantiene y del que depende todo el plan.
> Junto a él, la fecha de la última actualización en monoespaciada.
>
> Al final, una acción secundaria en texto para cambiar de vehículo.

---

## P6 · Revisar proforma

> Pantalla para revisar el presupuesto de un taller, tema oscuro, móvil.
>
> Estado inicial: una zona de captura amplia con borde punteado tenue y un texto
> corto que explica que se puede tomar una foto de la proforma. Un botón dorado
> abre la cámara.
>
> Estado de resultado: la lista de ítems del presupuesto, cada uno con su precio y
> un veredicto de tres valores —normal, caro, o innecesario— marcado con **palabra
> y barra de color**, nunca solo color. Al final, el total y una línea que compara
> ese total contra el rango habitual.
>
> Los ítems marcados como caros o innecesarios llevan una explicación de una frase
> debajo, en texto tenue.
>
> Incluye también el estado vacío: una composición que explica para qué sirve la
> pantalla, no un mensaje de "sin datos".

---

## P7 · Avisos

> Configuración de recordatorios, tema oscuro, móvil.
>
> Lista de tipos de aviso, cada uno como una fila con **interruptor a la derecha**
> y una línea de descripción tenue debajo del nombre: documentos por vencer,
> mantenimiento próximo, y revisión de kilometraje.
>
> Para los que están activos, una segunda línea en monoespaciada muestra con cuánta
> anticipación llega el aviso, editable.
>
> Sin tarjetas: filas separadas por líneas de 1 px.
> Al final, una nota corta sobre por dónde llegan los avisos.

---

## P8 · Historial

> Historial de mantenimiento de un vehículo, tema oscuro, móvil.
>
> Agrupado por año, con el año como encabezado en condensada pesada y grande.
> Dentro de cada año, filas con la fecha en monoespaciada a la izquierda, el
> servicio en condensada, el taller en texto tenue y el costo alineado a la derecha
> con cifras tabulares.
>
> Arriba del todo, un resumen del gasto acumulado en cifra grande, con la aclaración
> en texto pequeño de en cuántos servicios se acumuló.
>
> Incluye el estado vacío: primer registro por crear, con una explicación de por qué
> conviene mantenerlo — el historial es lo que sube el valor del auto al venderlo.

---

## Estados que hay que pedir explícitamente

Los generadores entregan siempre el caso feliz. Pide estos aparte o no existirán:

- **Carga** — esqueletos con la forma exacta del contenido que reemplazan, con un
  brillo desplazándose. Nunca un círculo giratorio.
- **Vacío** — una composición que explique cómo llenar la pantalla.
- **Error de consulta** — placa no encontrada, con el siguiente paso claro, no solo
  el problema.
- **Sin conexión** — porque el usuario está en la calle, no en una oficina.

---

## Qué corregir en lo que salga

Todo generador de pantallas repite los mismos errores. Revisa esto antes de dar
nada por bueno:

1. **Barra de estado o teclado falsos.** Los dibuja siempre. En un celular real se
   ven duplicados. Bórralos.
2. **Verde para "todo bien" sin palabra.** El sistema exige palabra más barra;
   nunca color solo.
3. **Dorado dentro de un chip de estado.** Está a 12° del ámbar: prohibido por regla.
4. **Áreas táctiles menores a 56 px.** El usuario tiene el celular en la mano dentro
   de un auto.
5. **Interlineado apretado en titulares en mayúscula.** Las tildes chocan.
6. **Nombres y cifras inventadas.** Si necesita datos de ejemplo, que sean
   verosímiles y estén marcados como ejemplo.

---

## Una decisión pendiente

Este documento evita nombrar ciudades, pero el producto sigue anclado a un país por
donde más importa: **SOAT**, **revisión técnica** y el símbolo **S/** son
específicos. Si la app va a servir a más de un mercado, esos tres dejan de ser
constantes y pasan a ser configuración por país — los nombres de los documentos, los
montos de las multas y la moneda. No es un cambio de copy, es un cambio de modelo de
datos, y conviene decidirlo antes de construir las pantallas y no después.
