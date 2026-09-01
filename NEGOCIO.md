# Fixly — Caso de negocio

**Agosto 2026 · Perú · Cifras en soles**

Mercado, modelo de ingresos, costos reales, márgenes, riesgos y criterios para decidir
seguir o parar. Sin producto ni interfaz: solo la parte que define si esto es un negocio.

---

## 1. Resumen ejecutivo

Fixly cobra por resolverle a un conductor peruano la pregunta de qué le debe su auto —
multas por vencer, mantenimiento pendiente, historial al revender. El acceso es por placa.

| Cifra | Qué es |
|---|---|
| **S/0,011** | Costo de datos por consulta |
| **98,8%** | Margen bruto del informe de S/19 |
| **2** | Informes al mes para cubrir el costo de datos |
| **S/1,04** | Valor neto por instalación, escenario base |
| **S/35** | CPI de referencia — 34× el valor por instalación |

Esas cinco cifras cuentan toda la historia. **El costo de operar es despreciable y el margen
es de software**: si alguien paga, el negocio funciona desde el primer sol. **Pero el valor por
usuario adquirido es 34 veces menor que lo que cuesta comprarlo**, así que no existe una
versión de esto que se financie con publicidad pagada.

> **La conclusión operativa.** No es un negocio de capital, es un negocio de distribución.
> Nadie va a morir por los costos; el proyecto muere si el canal orgánico no funciona o si
> nadie paga. Todo el riesgo está en esos dos frentes, y ninguno se resuelve con dinero.

---

## 2. Qué cambió desde la tesis inicial

Cuatro hechos nuevos, dos de ellos correcciones a lo que yo mismo afirmé antes.

| Antes se creía | Ahora se sabe | Efecto |
|---|---|---|
| La revisión técnica quizá no se puede consultar por API | json.pe expone `/revision-tecnica` además de placa, SOAT y licencia | El gancho de mayor multa —S/2.475— funciona desde el día uno |
| Las papeletas entran en el producto gratis | No hay API. El portal del MTC tiene CAPTCHA y no se automatiza | Las papeletas pasan al informe pagado |
| Un pico de tráfico puede quemar el presupuesto | **Falso.** 10.000 consultas cuestan S/75 | Riesgo de disponibilidad, no financiero |
| El mantenimiento es una distracción | Parcialmente falso. Como producto está saturado, pero **los datos de mantenimiento para marcas chinas en LatAm no los tiene nadie** | Deja de ser función y pasa a ser el único activo defendible |

---

## 3. Mercado

El sustrato es grande, viejo y está creciendo — la combinación que más mantenimiento genera.

- **3,19 M** vehículos livianos en circulación en Perú
- **14,4 años** de antigüedad promedio del parque liviano
- **300 mil+** socios conductores han generado viajes en Uber Perú
- **140.721** autos nuevos en el primer semestre de 2026 (+40,6%)
- **~600 mil** transacciones de autos usados al año

### Los tres círculos, sin inflar

| Segmento | Tamaño | Por qué importa |
|---|---:|---|
| Mercado total | 3,19 M | Todo vehículo liviano peruano tiene SOAT y revisión técnica que vencen |
| Mercado alcanzable | ~300 mil | Conductores de aplicativo: alta frecuencia, comunidad conectada, el auto es su ingreso |
| **Cabeza de playa año 1** | **10–30 mil** | Lo que un canal orgánico de una persona puede alcanzar de forma realista |
| Adyacente | 3,95 M | Motos y mototaxis: más unidades que autos, mantenimiento más frecuente, cero competencia |

La cifra de 3,19 millones no es el mercado: es el titular. El número con el que hay que
planificar es el tercero, y es el que define si esto sostiene a una persona o a un equipo.

---

## 4. El problema, medido en soles

La razón por la que esto puede monetizar y una app de mantenimiento no: hay una cifra
concreta y una fecha dura detrás de cada evento.

| Evento | Frecuencia | Costo de fallar | Consultable |
|---|---|---|---|
| Revisión técnica | Anual | S/2.475 + retención | Sí, por API |
| SOAT | Anual | S/660 + retención | Sí, por API |
| Licencia de conducir | Cada 5 años | Multa + retención | Sí, por API |
| Certificación GLP/GNV | Anual | No carga gas | Parcial |
| Papeletas | Continuo | Acumulan e impiden trámites | No automatizable |
| Mantenimiento | 5–10 mil km | Difuso, negociable | Requiere datos propios |

Un día con el vehículo retenido, para un conductor de aplicativo, es un día sin facturar.
Ese es el costo real detrás de cada fila — y el argumento de venta que no requiere convencer
a nadie de nada.

---

## 5. De dónde sale el dinero

| Palanca | Precio | Estado | Comentario |
|---|---:|---|---|
| **Informe por placa** | S/19 | Precio validado | Mi Torito ya cobra S/15,90–19,90 en Perú por lo mismo. Pago único, momento definido: comprar un usado |
| **Suscripción** | S/14,90/mes | Sin probar | Recordatorios y plan de mantenimiento. Ingreso recurrente, pero el más lento de validar |
| **Comisión de renovación** | ~S/15 | Bloqueada | Requiere corredor registrado en la SBS: exige 5 años de experiencia en el sector. Solo vía alianza |

### Los dos hallazgos del modelo

**Uno — la comisión de seguros no vale la pena todavía.** Llevar la renovación de SOAT de 0% a
20% de los suscriptores suma **S/771 en todo el año**: menos del 2% del resultado. Es una
comisión pequeña, una vez al año, sobre una base de cientos de personas. La fuente de ingreso
más difícil de construir es la que menos aporta a esta escala. **Es una palanca de año 3, no de
año 1**, y perseguirla ahora cuesta meses de conversaciones que no mueven el resultado.

**Dos — la suscripción sola no construye una empresa.** Con informe y comisión en cero —la idea
original, suscripción pura— el ingreso neto del año 1 cae a **~S/14.000 con 36.000
instalaciones**. Ese es el techo de un B2C de suscripción en LatAm con adquisición orgánica:
sostiene a una persona, no a un equipo. Es, con otros números, exactamente donde está Kebo hoy
con 101 mil usuarios acumulados.

### Impacto de cada palanca sobre el escenario base

| Movimiento | Efecto anual | Lectura |
|---|---:|---|
| Base (36.000 instalaciones) | S/37.338 | Referencia |
| Duplicar el precio | +S/42.882 | El modelo no castiga el precio con churn: es optimista por construcción |
| Informe del 4% al 10% | +S/34.884 | Lo único probable de mover esta semana con tráfico real |
| Inicio de trials 12% → 20% | +S/28.588 | El embudo pesa más que agregar fuentes de ingreso |
| Churn 8% → 15% | −S/8.348 | Parece poco a 12 meses porque los nuevos tapan a los que se van |
| SOAT 0% → 20% | +S/771 | Despreciable a esta escala |

---

## 6. Estructura de costos

Muy poco, y este es el hallazgo que más cambia la conversación sobre financiamiento.

| Consultas/mes | Créditos | Costo de datos | Plan |
|---:|---:|---:|---|
| 500 | 7.500 | S/4 | Básico |
| 1.000 | 15.000 | S/8 | Básico |
| 5.000 | 75.000 | S/38 | Profesional ×2 |
| 10.000 | 150.000 | S/75 | Profesional ×3 |
| 50.000 | 750.000 | S/375 | Negociar volumen |
| 100.000 | 1.500.000 | S/750 | Negociar volumen |

Una consulta completa gasta ~15 créditos (placa, SOAT y revisión técnica, 5 cada una).
Al precio del plan profesional eso son **S/0,0075 por consulta**.

> **Corrección a lo que afirmé antes.** Dije que un video viral podía quemar el presupuesto de
> la API. Los números dicen que no: diez mil consultas cuestan S/75. El riesgo real es distinto
> y sigue siendo serio — que el plan se agote a mitad del pico y el servicio deje de responder
> justo cuando llegó el tráfico que buscabas. Es un problema de disponibilidad, se resuelve con
> una alerta de consumo y un plan con holgura, y no requiere capital.

### Todo lo demás

- **Infraestructura:** despreciable en el nivel gratuito de un proveedor serverless hasta volúmenes altos.
- **Comisión de tienda o pasarela:** 15% con el programa de pequeños negocios; 4–5% si el cobro es web.
- **Datos de mantenimiento:** el único costo estructural real, y hoy no tiene proveedor para marcas chinas.
- **Adquisición:** tiene que ser cero. Si deja de serlo, el negocio no cierra.
- **El costo dominante es tu tiempo**, y no aparece en ninguna tabla.

---

## 7. Márgenes y el techo de adquisición

Escenario de 10.000 consultas al mes:

| Attach | Informes | Ingreso neto | Costo datos | Margen |
|---|---:|---:|---:|---:|
| 2% | 200 | S/3.230 | S/75 | 97,7% |
| 4% | 400 | S/6.460 | S/75 | 98,8% |
| 10% | 1.000 | S/16.150 | S/75 | 99,5% |

El punto de equilibrio sobre el costo de datos son **dos informes al mes**. El negocio es
rentable en cuanto exista un solo cliente recurrente. Ninguna decisión debería tomarse mirando
los costos.

> **El número que sí manda.** Cada instalación deja **S/1,04 netos** en el escenario base. El
> costo por instalación de referencia en campañas pagadas de la región es **~S/35**. La brecha
> es de 34 veces, y no se cierra subiendo el precio ni mejorando el embudo dentro de rangos
> realistas.
>
> **Consecuencia:** la publicidad pagada destruye dinero en cualquier escenario modelado. El
> crecimiento tiene que ser orgánico o no hay negocio. Eso convierte al canal —no al producto—
> en el riesgo número uno del plan.

---

## 8. El único activo que no se puede comprar

Todo lo demás en este plan es replicable en un fin de semana. Esto no.

Los proveedores de datos de mantenimiento OEM —DataOne, MOTOR, ALLDATA, CarMD— cubren marcas
vendidas en Norteamérica y Europa. Las marcas que más crecen en Perú son chinas: **Jetour
+144,7%, Chery +111,9%, Geely +110,6%, Changan +58,1%** en el primer semestre de 2026. Para
esos vehículos, en este mercado, no hay a quién comprarle los intervalos de servicio.

Los asistentes que leen el manual del propietario ya existen y se están volviendo gratis: Ford
desplegó el suyo a ~8 millones de propietarios, GM integró Gemini en ~4 millones de vehículos,
y hay varias apps independientes haciendo lo mismo. **Pero ninguno cubre un Changan, un Jetour
ni un JAC.** Cubren las marcas de sus propios fabricantes.

> **La asimetría que lo hace un activo.** Cada manual se necesita **una sola vez**. Conseguir el
> del Yaris 2013 sirve para todos los Yaris 2013 que lleguen después. La base de intervalos
> crece con el uso, no con el gasto, y a los dos años cubre el parque real peruano mejor que
> cualquier proveedor comercial — que es exactamente la definición de algo que no se puede comprar.

> **Pendiente legal, no resuelto.** Los intervalos son hechos, y los hechos no se protegen por
> derecho de autor; el texto y la maquetación del manual sí. Extraer "aceite cada 10.000 km" y
> redistribuir el PDF son cosas distintas. No encontré fuente que lo zanje para Perú:
> **consultar con abogado antes de construir la base**, no después.

---

## 9. Dónde gana dinero esta industria

Ninguno de los negocios que funcionan cobra por registrar mantenimiento. Todos cobran en uno
de tres momentos.

| Empresa | Escala | Monetiza | Momento |
|---|---|---|---|
| Jerry | $450 M valuación | Comparador de seguros, ~1 M de clientes | La renovación |
| FIXD | ~$300 mil/mes | Sensor de $59,99 más suscripción | El susto |
| Kavak | Serie F $300 M | La transacción del auto usado | La desconfianza |
| Mi Torito | Perú, activo | Informe por placa a S/15,90–19,90 | La desconfianza |

Mi Torito es la referencia más útil: **ya cobra en Perú, en soles, por la misma mecánica**. Su
debilidad es que vende un informe y el cliente se va. La oportunidad no es cobrar distinto, es
convertir esa transacción única en una relación.

---

## 10. Qué puede matar el negocio

| Riesgo | Prob. | Impacto | Mitigación |
|---|---|---|---|
| Sin canal orgánico propio | Alta | Terminal | Probar contenido antes de construir. Es lo que hundió el crecimiento de Kebo |
| Nadie paga | Alta | Terminal | Cobrar temprano y poco. El informe de S/19 es el test más rápido |
| Baja frecuencia → churn | Alta | Alto | Vencimientos legales como evento central; segmento de alto kilometraje |
| Dependencia de un proveedor de datos | Media | Alto | Segundo proveedor identificado y caché propio desde el inicio |
| Sin datos de mantenimiento para marcas chinas | Media | Medio | Base propia vía manuales; empezar por Toyota, Kia y Hyundai (un tercio del parque nuevo) |
| Responsabilidad por consejo errado | Media | Medio | Informar y explicar, nunca diagnosticar ni autorizar. Términos claros |
| Un incumbente lo hace primero | Baja | Alto | Mi Torito podría añadir recurrencia. Hoy no tiene incentivo |
| Costos de operación | Baja | Nulo | Medido: no es un riesgo |

---

## 11. Hitos y criterios de decisión

Cada umbral definido **antes** de correr el experimento. Es lo único que impide racionalizar un
mal resultado después.

### Hito 1 — Existe demanda de consulta · Mes 1

La herramienta gratuita está en línea y recibe tráfico orgánico. Se mide una sola cosa: si la
gente escribe su placa.

- **Sigue si:** ≥300 consultas en el primer mes sin gasto en publicidad, y ≥15% deja su contacto.
- **Para si:** <100 consultas después de 20 piezas de contenido. El problema es la distribución, y no se arregla con producto.

### Hito 2 — Alguien paga · Mes 2–3

Se habilita el informe de S/19 con cobro real. No es una encuesta de precio: es un cobro.

- **Sigue si:** ≥2% de quienes consultan compran el informe, con al menos 20 ventas.
- **Para si:** <0,5% compra habiendo probado dos precios distintos. La disposición a pagar no existe.

### Hito 3 — Vuelven solos · Mes 3–4

La prueba de frecuencia, que es el riesgo estructural del plan. Sin recordatorios enviados:
¿alguien vuelve por su cuenta?

- **Sigue si:** ≥20% de una cohorte vuelve a consultar en el mes 2 sin que se le escriba.
- **Replantea si:** <5% vuelve. Es una herramienta de un solo uso, y el modelo tiene que ser transaccional, no recurrente.

### Hito 4 — Hay demanda de mantenimiento · Mes 4–6

Se mide el interés en el plan de mantenimiento **antes** de construir la base de datos, usando
el modelo real de cada usuario ya identificado.

- **Construye si:** ≥25% de quienes ven la oferta la piden. Ahí se justifica invertir en la base de manuales.
- **Descarta si:** <10% la pide. El mantenimiento es una idea de fundador, no una demanda de mercado.

---

## 12. Qué está validado y qué es supuesto

La diferencia entre un plan y una ficción con formato de hoja de cálculo.

| Afirmación | Base | Confianza |
|---|---|---|
| Costo de datos por consulta | Tarifario publicado del proveedor, calculado | Verificado |
| Montos de las multas | Normativa peruana vigente | Verificado |
| Precio de mercado del informe | Competidor cobrando hoy en Perú | Verificado |
| Tamaño y antigüedad del parque | Asociación Automotriz del Perú | Verificado |
| Conversión trial → pago del 31% | Dato real medido en Kebo | Verificado |
| Requisitos de corredor SBS | Reglamento publicado | Verificado |
| Ausencia de datos OEM para marcas chinas | Cobertura declarada de los proveedores | Inferido |
| Instalaciones alcanzables al mes | Estimado desde la trayectoria de Kebo | **Supuesto** |
| Tasa de activación | Estimado. Nadie lo ha medido | **Supuesto** |
| Inicio de trials | Estimado | **Supuesto** |
| Churn mensual del 8% | Estimado. En baja frecuencia podría ser peor | **Supuesto** |
| Attach del informe del 4% | Estimado. Es lo que mide el hito 2 | **Supuesto** |

> **Cómo leer esta tabla.** Las cinco filas marcadas como supuesto son las que deciden el
> resultado, y son exactamente las que nadie ha medido. Los hitos existen para reemplazarlas por
> datos en ese orden. Cualquier proyección hecha antes de eso —incluida la de este documento— es
> aritmética sobre números inventados, y conviene tratarla así.

---

*Fuentes públicas verificables salvo los datos internos de Kebo, que son mediciones propias no publicadas.*
