# Work Data Fixes - MCS-CEV Optimization Interface

## Problema Identificado

El work data generado en el archivo CSV no correspondía al configurado en la interfaz. Los usuarios configuraban horarios de trabajo específicos, pero los resultados de optimización mostraban datos diferentes.

## Causa Raíz

**Inconsistencia en el manejo de IDs de ubicación:**

- **WorkDataForm**: Usaba `locationId` (ID interno: 1, 2, 3, etc.)
- **csvGenerator**: Buscaba por índice del array (0, 1, 2, etc.)

## Solución Implementada

### 1. Corrección en `csvGenerator.js`

**Antes:**
```javascript
for (let location = 1; location <= numNodes; location++) {
  const locationData = locations[location - 1];
  const workItem = workData.find(w => w.location === location && w.ev === ev);
}
```

**Después:**
```javascript
for (let locationIndex = 0; locationIndex < numNodes; locationIndex++) {
  const location = locations[locationIndex];
  const locationId = location.id; // Use the actual location ID
  const workItem = workData.find(w => w.location === locationId && w.ev === ev);
}
```

### 2. Mejora en el Manejo de Datos

**Extracción robusta de workPower:**
```javascript
const requirement = workItem.workRequirements[t - 1];
const workPower = typeof requirement === 'object' ? requirement.workPower : requirement;
row.push(workPower || 0);
```

### 3. Logging Mejorado

```javascript
console.log(`🔍 DEBUG: EV${ev} at Location${locationId} - Work requirement: ${workPower}`);
console.log('🔍 DEBUG: Generated work CSV data:', data.slice(0, 5));
```

## Validaciones Mejoradas

### 1. WorkDataForm Validations

**Función `parseTime` mejorada:**
```javascript
const parseTime = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return null;
  
  const timeMatch = timeStr.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!timeMatch) return null;
  
  const hours = parseInt(timeMatch[1]);
  const minutes = parseInt(timeMatch[2]);
  
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  
  return hours * 60 + minutes;
};
```

**Validación robusta de schedules:**
- Manejo de datos vacíos o nulos
- Validación de formatos de tiempo
- Verificación de rangos de potencia
- Detección de overlaps entre horarios

### 2. Validators.js Mejorado

**Función `validateWorkData` más robusta:**
```javascript
export const validateWorkData = (workData, timeData) => {
  const errors = [];
  
  if (!workData || workData.length === 0) {
    if (timeData && timeData.length > 0) {
      return errors; // No error - work data will be generated
    } else {
      errors.push("Work data is required");
      return errors;
    }
  }
  
  // Validate each work item structure
  workData.forEach((workItem, index) => {
    if (!workItem) {
      errors.push(`Work item ${index + 1}: Invalid work item data`);
      return;
    }
    
    // Check required properties
    if (typeof workItem.location === 'undefined' || typeof workItem.ev === 'undefined') {
      errors.push(`Work item ${index + 1}: Missing required properties (location, ev)`);
      return;
    }
    
    // Validate work requirements
    if (workItem.workRequirements) {
      if (!Array.isArray(workItem.workRequirements)) {
        errors.push(`Work item ${index + 1}: Work requirements must be an array`);
        return;
      }
      
      workItem.workRequirements.forEach((requirement, periodIndex) => {
        if (!requirement) {
          errors.push(`Work item ${index + 1}, period ${periodIndex + 1}: Invalid requirement data`);
          return;
        }
        
        // Handle both object and number formats
        let workPower;
        if (typeof requirement === 'object' && requirement !== null) {
          workPower = requirement.workPower;
        } else if (typeof requirement === 'number') {
          workPower = requirement;
        } else {
          errors.push(`Work item ${index + 1}, period ${periodIndex + 1}: Invalid requirement format`);
          return;
        }
        
        // Validate work power value
        if (typeof workPower !== 'number' || isNaN(workPower)) {
          errors.push(`Work item ${index + 1}, period ${periodIndex + 1}: Work power must be a valid number`);
        } else if (workPower < 0) {
          errors.push(`Work item ${index + 1}, period ${periodIndex + 1}: Work requirement cannot be negative`);
        }
      });
    } else {
      errors.push(`Work item ${index + 1}: Missing work requirements`);
    }
  });
  
  return errors;
};
```

## Flujo Corregido

### 1. Configuración en Interfaz
- Usuario configura horarios de trabajo en WorkDataForm
- Validaciones en tiempo real verifican datos
- Work data se genera con `locationId` correcto

### 2. Generación de CSV
- `csvGenerator` usa `locationId` para buscar datos
- Mapeo correcto entre ubicaciones y EVs
- Archivo work.csv con datos precisos

### 3. Optimización
- Julia recibe datos correctos
- Resultados corresponden a configuración original

## Verificación

### Test de Validación
```bash
node test_work_validation.js
```

**Resultados esperados:**
- ✅ Horarios válidos pasan sin errores
- ✅ Formatos de tiempo inválidos son detectados
- ✅ Horarios con tiempo de inicio después del fin son detectados
- ✅ Breaks fuera del horario de trabajo son detectados
- ✅ Valores de potencia negativos son detectados

### Test de Generación CSV
```bash
node test_work_csv_generation.js
```

**Resultados esperados:**
- ✅ EV1 en Location2: 2.5, 2.5, 0.5, 0.5, 2.5
- ✅ EV2 en Location3: 3, 3, 3, 0.5, 3
- ✅ Otras combinaciones: 0 (correcto)

## Beneficios

1. **Consistencia de Datos**: Work requirements corresponden exactamente a la configuración
2. **Mapeo Correcto**: IDs de ubicación se manejan correctamente en todo el flujo
3. **Debugging Mejorado**: Logs claros para identificar problemas
4. **Robustez**: Manejo mejorado de diferentes formatos de datos
5. **Validación Completa**: Verificaciones exhaustivas en cada paso

## Estado Actual

- ✅ **Compilación Exitosa**: Sin errores de compilación
- ✅ **Validaciones Funcionando**: Work data se valida correctamente
- ✅ **Generación de CSV Corregida**: Los datos corresponden a la configuración
- ✅ **Mapeo de IDs Correcto**: Ubicaciones y EVs se mapean correctamente
- ✅ **Tests de Verificación**: Validación automatizada implementada

## Próximos Pasos

1. **Monitoreo en Producción**: Observar uso real y detectar problemas
2. **Optimización de Rendimiento**: Mejorar velocidad de validación para datasets grandes
3. **Documentación de Usuario**: Crear guías específicas para configuración de work data
4. **Validaciones Adicionales**: Agregar más checks para casos edge complejos
