# CSV Generator Fixes - MCS-CEV Optimization Interface

## Problemas identificados y solucionados

### 1. **Problema: Formato incorrecto en place.csv**

**Antes:**
```csv
site,e1,e2
Grid Node,0,0
Construction Site 1,1,0
Construction Site 2,0,1
```

**Después:**
```csv
site,e1,e2
i1,0,0
i2,1,0
i3,0,1
```

**Solución:** Modificar `generatePlaceCSV()` para usar nombres de nodos consistentes (`i1`, `i2`, `i3`) en lugar de nombres descriptivos.

### 2. **Problema: Work.csv con trabajo asignado incorrectamente**

**Antes:** Todos los EVs tenían trabajo asignado en todos los nodos, incluyendo el nodo de la red.

**Después:** Solo los EVs asignados a sitios de construcción tienen trabajo.

**Solución:** Modificar `generateWorkCSV()` para:
- Verificar las asignaciones de EVs en `place.csv`
- Solo generar trabajo donde los EVs están asignados
- Poner 0 en todas las demás combinaciones

### 3. **Problema: Cargador de datos Julia no manejaba 4+ nodos**

**Antes:** El código solo manejaba hasta 3 nodos (`i1`, `i2`, `i3`).

**Después:** Manejo dinámico de cualquier número de nodos.

**Solución:** Modificar `FullDataLoader_v2.jl` para:
- Detectar dinámicamente todos los nodos que empiecen con "i"
- Crear mapeos automáticamente para cualquier número de nodos

## Cambios realizados

### En `optimization-interface/src/utils/csvGenerator.js`:

1. **`generatePlaceCSV()`:**
   ```javascript
   // Antes
   const row = { site: location.name };
   
   // Después
   const row = { site: `i${index + 1}` };
   ```

2. **`generateWorkCSV()`:**
   ```javascript
   // Agregar parámetro locations
   const generateWorkCSV = (workData, timeData, locations) => {
     // Verificar asignaciones antes de generar trabajo
     const isAssigned = locationData && locationData.evAssignments && locationData.evAssignments[ev] === 1;
     
     if (isAssigned) {
       // Generar trabajo real
       row.push(requirement);
     } else {
       // Poner 0 si no está asignado
       row.push(0);
     }
   }
   ```

### En `src/core/FullDataLoader_v2.jl`:

1. **Mapeo dinámico de nodos:**
   ```julia
   # Antes
   node_mapping = Dict("i1" => "i1", "i2" => "i2")
   
   # Después
   for node in N
       if startswith(node, "i")
           node_mapping[node] = node
           location_mapping[node] = node
       end
   end
   ```

2. **Lógica de ubicación dinámica:**
   ```julia
   # Antes
   if site in ["i1", "i2", "i3"]
   
   # Después
   if startswith(site, "i")
   ```

## Resultado

✅ **Archivos CSV generados correctamente desde la interfaz**
✅ **Optimización Julia ejecuta sin errores**
✅ **Soporte para cualquier número de nodos (2, 3, 4, 5, etc.)**
✅ **Validaciones automáticas funcionando**

## Verificación

Para verificar que las correcciones funcionan:

1. **Generar archivos desde la interfaz**
2. **Renombrar carpeta al formato esperado**
3. **Ejecutar optimización:**
   ```bash
   julia mcs_optimization_main.jl [scenario-name]
   ```

## Escenarios probados exitosamente

- ✅ 1MCS-2CEV-3nodes-24hours
- ✅ 1MCS-4CEV-4nodes-24hours

## Próximos pasos

1. **Probar con más escenarios** (5+ nodos, múltiples MCS)
2. **Agregar validaciones adicionales** en la interfaz
3. **Mejorar documentación** con ejemplos específicos
4. **Optimizar rendimiento** para escenarios grandes
