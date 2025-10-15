# Sistema de Prompts Mejorado - MCS-CEV Optimization

## 🎯 Resumen de Implementación

Hemos implementado un sistema de prompts organizado y modular para el agente de IA de la interfaz de optimización MCS-CEV. Este sistema separa las responsabilidades en tres componentes principales y utiliza un flujo de procesamiento estructurado.

## 📁 Estructura de Archivos

```
optimization-interface/backend/
├── prompts/
│   ├── README.md                    # Documentación del sistema
│   ├── conversation-manager.md      # Manejo de conversaciones
│   ├── parameter-extractor.md       # Extracción de parámetros
│   └── parameter-validator.md       # Validación de parámetros
├── services/
│   ├── promptManager.js             # Gestor de prompts
│   ├── enhancedOpenAIService.js     # Servicio mejorado de OpenAI
│   └── openaiService.js             # Servicio original (mantenido)
└── test-*.js                        # Scripts de prueba
```

## 🔄 Flujo de Procesamiento

### 1. **Parameter Extractor** 📊
- **Entrada**: Mensaje del usuario
- **Proceso**: Extrae parámetros específicos del texto natural
- **Salida**: Parámetros estructurados con confianza

### 2. **Parameter Validator** ✅
- **Entrada**: Parámetros extraídos
- **Proceso**: Valida rangos, consistencia y completitud
- **Salida**: Resultado de validación con sugerencias

### 3. **Conversation Manager** 💬
- **Entrada**: Parámetros y validación
- **Proceso**: Genera respuesta conversacional
- **Salida**: Respuesta natural con acciones y navegación

## 🛠️ Componentes Principales

### PromptManager
```javascript
// Carga prompts desde archivos .md
const promptManager = require('./services/promptManager');

// Obtiene prompt con contexto
const prompt = promptManager.getConversationPrompt({
  currentStep: 2,
  formData: { scenario: { numMCS: 1 } }
});
```

### EnhancedOpenAIService
```javascript
// Procesa mensajes con flujo completo
const result = await enhancedOpenAIService.processMessage(
  message, 
  sessionId, 
  context
);

// Resultado incluye:
// - message: Respuesta conversacional
// - actions: Acciones realizadas
// - formUpdates: Actualizaciones del formulario
// - extractedParameters: Parámetros extraídos
// - validationResult: Resultado de validación
```

## 📋 Prompts Disponibles

### 1. Conversation Manager
- **Archivo**: `prompts/conversation-manager.md`
- **Propósito**: Manejo de conversaciones y respuestas generales
- **Variables**: `{currentStep}`, `{currentConfiguration}`, `{previousActions}`

### 2. Parameter Extractor
- **Archivo**: `prompts/parameter-extractor.md`
- **Propósito**: Extracción de parámetros del texto del usuario
- **Variables**: `{userInput}`, `{currentContext}`

### 3. Parameter Validator
- **Archivo**: `prompts/parameter-validator.md`
- **Propósito**: Validación de parámetros extraídos
- **Variables**: `{extractedParameters}`, `{userInput}`, `{currentConfiguration}`

## 🧪 Testing

### Scripts de Prueba Disponibles

```bash
# Probar flujo completo de prompts
node test-enhanced-flow.js

# Probar servidor con nuevo flujo
node test-enhanced-server.js

# Probar conexión OpenAI básica
node test-openai.js

# Probar endpoint del chat
node test-chat-endpoint.js
```

### Ejemplo de Salida de Prueba

```
📊 Extracted parameters: {
  "scenario": {
    "numMCS": 2,
    "numCEV": 3,
    "numNodes": 4,
    "is24Hours": true,
    "scenarioName": "2MCS-3CEV-4nodes-24hours",
    "confidence": 0.9
  },
  "parameters": {
    "eta_ch_dch": 0.95,
    "MCS_max": 1000,
    "MCS_min": 100,
    "MCS_ini": 500,
    // ... más parámetros
  }
}

✅ Validation result: {
  "is_valid": true,
  "validation_score": 0.95,
  "completeness": { "scenario": 1, "parameters": 1, "overall": 1 },
  "range_validation": { "passed": true, "issues": [] },
  "consistency_check": { "passed": true, "issues": [] }
}
```

## 🔧 Integración con el Servidor

El servidor ahora usa el nuevo servicio mejorado:

```javascript
// En server.js
const openaiService = require('./services/enhancedOpenAIService');

// El endpoint /api/chat ahora devuelve información adicional:
app.post('/api/chat', async (req, res) => {
  const result = await openaiService.processMessage(message, sessionId, context);
  
  res.json({
    success: true,
    message: result.message,
    actions: result.actions,
    formUpdates: result.formUpdates,
    navigateToStep: result.navigateToStep,
    extractedParameters: result.extractedParameters,  // Nuevo
    validationResult: result.validationResult,        // Nuevo
    sessionId: sessionId
  });
});
```

## 🎯 Beneficios del Nuevo Sistema

### 1. **Modularidad**
- Prompts separados por responsabilidad
- Fácil mantenimiento y actualización
- Reutilización de componentes

### 2. **Transparencia**
- Prompts visibles en archivos `.md`
- Fácil revisión y modificación
- Documentación integrada

### 3. **Robustez**
- Validación en múltiples niveles
- Manejo de errores mejorado
- Confianza y sugerencias

### 4. **Flexibilidad**
- Variables de contexto dinámicas
- Fácil agregar nuevos prompts
- Personalización por escenario

## 🚀 Uso en Producción

### 1. **Iniciar el Servidor**
```bash
cd optimization-interface/backend
node server.js
```

### 2. **Probar el Chat**
```bash
# El servidor carga automáticamente los prompts
# Los prompts se pueden modificar sin reiniciar
```

### 3. **Modificar Prompts**
```bash
# Editar archivos en prompts/
# Los cambios se reflejan automáticamente
```

## 📈 Métricas y Monitoreo

El sistema proporciona métricas detalladas:

- **Confianza de extracción**: 0-1
- **Puntuación de validación**: 0-1
- **Completitud**: Por sección y general
- **Problemas identificados**: Lista de issues
- **Sugerencias**: Recomendaciones de mejora

## 🔮 Próximos Pasos

1. **Agregar más prompts específicos** para diferentes escenarios
2. **Implementar cache de prompts** para mejor rendimiento
3. **Agregar métricas de uso** de prompts
4. **Crear interfaz de administración** de prompts
5. **Implementar versionado** de prompts

## 📞 Soporte

Para problemas o preguntas sobre el sistema de prompts:

1. Revisar `prompts/README.md` para documentación detallada
2. Ejecutar scripts de prueba para diagnóstico
3. Verificar logs del servidor para errores
4. Revisar archivos de prompts para configuración

---

**Estado**: ✅ **IMPLEMENTADO Y FUNCIONANDO**

El sistema de prompts mejorado está completamente implementado y listo para uso en producción.
