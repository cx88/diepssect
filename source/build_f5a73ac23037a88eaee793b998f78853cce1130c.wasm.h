#ifndef BUILD_F5A73AC23037A88EAEE793B998F78853CCE1130C_WASM_H_GENERATED_
#define BUILD_F5A73AC23037A88EAEE793B998F78853CCE1130C_WASM_H_GENERATED_
#ifdef __cplusplus
extern "C" {
#endif

#ifndef WASM_RT_INCLUDED_
#define WASM_RT_INCLUDED_

#include <stdint.h>

#ifndef WASM_RT_MAX_CALL_STACK_DEPTH
#define WASM_RT_MAX_CALL_STACK_DEPTH 500
#endif

#ifndef WASM_RT_MODULE_PREFIX
#define WASM_RT_MODULE_PREFIX
#endif

#define WASM_RT_PASTE_(x, y) x ## y
#define WASM_RT_PASTE(x, y) WASM_RT_PASTE_(x, y)
#define WASM_RT_ADD_PREFIX(x) WASM_RT_PASTE(WASM_RT_MODULE_PREFIX, x)

#define WASM_RT_DEFINE_EXTERNAL(decl, target) decl = &target;

/* TODO(binji): only use stdint.h types in header */
typedef uint8_t u8;
typedef int8_t s8;
typedef uint16_t u16;
typedef int16_t s16;
typedef uint32_t u32;
typedef int32_t s32;
typedef uint64_t u64;
typedef int64_t s64;
typedef float f32;
typedef double f64;

typedef enum {
  WASM_RT_TRAP_NONE,
  WASM_RT_TRAP_OOB,
  WASM_RT_TRAP_INT_OVERFLOW,
  WASM_RT_TRAP_DIV_BY_ZERO,
  WASM_RT_TRAP_INVALID_CONVERSION,
  WASM_RT_TRAP_UNREACHABLE,
  WASM_RT_TRAP_CALL_INDIRECT,
  WASM_RT_TRAP_EXHAUSTION,
} wasm_rt_trap_t;

typedef enum {
  WASM_RT_I32,
  WASM_RT_I64,
  WASM_RT_F32,
  WASM_RT_F64,
} wasm_rt_type_t;

typedef void (*wasm_rt_anyfunc_t)(void);

typedef struct {
  uint32_t func_type;
  wasm_rt_anyfunc_t func;
} wasm_rt_elem_t;

typedef struct {
  uint8_t* data;
  uint32_t pages, max_pages;
  uint32_t size;
} wasm_rt_memory_t;

typedef struct {
  wasm_rt_elem_t* data;
  uint32_t max_size;
  uint32_t size;
} wasm_rt_table_t;

extern void wasm_rt_trap(wasm_rt_trap_t) __attribute__((noreturn));
extern uint32_t wasm_rt_register_func_type(uint32_t params, uint32_t results, ...);
extern void wasm_rt_allocate_memory(wasm_rt_memory_t*, uint32_t initial_pages, uint32_t max_pages);
extern uint32_t wasm_rt_grow_memory(wasm_rt_memory_t*, uint32_t pages);
extern void wasm_rt_allocate_table(wasm_rt_table_t*, uint32_t elements, uint32_t max_elements);
extern uint32_t wasm_rt_call_stack_depth;

#endif  /* WASM_RT_INCLUDED_ */

extern void WASM_RT_ADD_PREFIX(init)(void);

/* import: 'env' 'DYNAMICTOP_PTR' */
extern u32 (*Z_envZ_DYNAMICTOP_PTRZ_i);
/* import: 'env' 'tempDoublePtr' */
extern u32 (*Z_envZ_tempDoublePtrZ_i);
/* import: 'env' 'STACKTOP' */
extern u32 (*Z_envZ_STACKTOPZ_i);
/* import: 'env' 'STACK_MAX' */
extern u32 (*Z_envZ_STACK_MAXZ_i);
/* import: 'global' 'NaN' */
extern f64 (*Z_globalZ_NaNZ_d);
/* import: 'global' 'Infinity' */
extern f64 (*Z_globalZ_InfinityZ_d);
/* import: 'global.Math' 'pow' */
extern f64 (*Z_globalZ2EMathZ_powZ_ddd)(f64, f64);
/* import: 'env' 'abort' */
extern void (*Z_envZ_abortZ_vi)(u32);
/* import: 'env' 'enlargeMemory' */
extern u32 (*Z_envZ_enlargeMemoryZ_iv)(void);
/* import: 'env' 'getTotalMemory' */
extern u32 (*Z_envZ_getTotalMemoryZ_iv)(void);
/* import: 'env' 'abortOnCannotGrowMemory' */
extern u32 (*Z_envZ_abortOnCannotGrowMemoryZ_iv)(void);
/* import: 'env' '_27d4d7ae' */
extern u32 (*Z_envZ__27d4d7aeZ_iii)(u32, u32);
/* import: 'env' '_262052b6' */
extern u32 (*Z_envZ__262052b6Z_iiiiii)(u32, u32, u32, u32, u32);
/* import: 'env' '_38174ad1' */
extern f64 (*Z_envZ__38174ad1Z_didd)(u32, f64, f64);
/* import: 'env' '_8c6022c' */
extern void (*Z_envZ__8c6022cZ_vv)(void);
/* import: 'env' '_5f90c337' */
extern void (*Z_envZ__5f90c337Z_viiii)(u32, u32, u32, u32);
/* import: 'env' '_7bfe6e30' */
extern u32 (*Z_envZ__7bfe6e30Z_iv)(void);
/* import: 'env' '_6c38190' */
extern u32 (*Z_envZ__6c38190Z_iiidd)(u32, u32, f64, f64);
/* import: 'env' '_243d3e32' */
extern u32 (*Z_envZ__243d3e32Z_iii)(u32, u32);
/* import: 'env' '_5fb0ae4e' */
extern f64 (*Z_envZ__5fb0ae4eZ_dv)(void);
/* import: 'env' '_4adf7ac3' */
extern u32 (*Z_envZ__4adf7ac3Z_iiidddddd)(u32, u32, f64, f64, f64, f64, f64, f64);
/* import: 'env' '_308034e0' */
extern u32 (*Z_envZ__308034e0Z_iii)(u32, u32);
/* import: 'env' '_511a9f0e' */
extern u32 (*Z_envZ__511a9f0eZ_ii)(u32);
/* import: 'env' '_508affb5' */
extern void (*Z_envZ__508affb5Z_viii)(u32, u32, u32);
/* import: 'env' '_19ccd7ef' */
extern u32 (*Z_envZ__19ccd7efZ_iiiiii)(u32, u32, u32, u32, u32);
/* import: 'env' '_5cc58eb0' */
extern u32 (*Z_envZ__5cc58eb0Z_ii)(u32);
/* import: 'env' '_115012f0' */
extern void (*Z_envZ__115012f0Z_vi)(u32);
/* import: 'env' '_22252cf8' */
extern f64 (*Z_envZ__22252cf8Z_dv)(void);
/* import: 'env' '_e4cdb36' */
extern u32 (*Z_envZ__e4cdb36Z_iiii)(u32, u32, u32);
/* import: 'env' '_61f18182' */
extern void (*Z_envZ__61f18182Z_vi)(u32);
/* import: 'env' '_7d660d33' */
extern f64 (*Z_envZ__7d660d33Z_dii)(u32, u32);
/* import: 'env' '_52a356f1' */
extern u32 (*Z_envZ__52a356f1Z_iiddddi)(u32, f64, f64, f64, f64, u32);
/* import: 'env' '_3e7ca9b' */
extern void (*Z_envZ__3e7ca9bZ_vi)(u32);
/* import: 'env' '_4060cc22' */
extern u32 (*Z_envZ__4060cc22Z_ii)(u32);
/* import: 'env' '_56f21bc2' */
extern u32 (*Z_envZ__56f21bc2Z_iiid)(u32, u32, f64);
/* import: 'env' '_2e372215' */
extern u32 (*Z_envZ__2e372215Z_iii)(u32, u32);
/* import: 'env' '_61e8302c' */
extern u32 (*Z_envZ__61e8302cZ_iii)(u32, u32);
/* import: 'env' '_3bfb841' */
extern void (*Z_envZ__3bfb841Z_vi)(u32);
/* import: 'env' '_2aba1908' */
extern u32 (*Z_envZ__2aba1908Z_iiiddi)(u32, u32, f64, f64, u32);
/* import: 'env' '_426972f0' */
extern u32 (*Z_envZ__426972f0Z_iiii)(u32, u32, u32);
/* import: 'env' '_11f425a8' */
extern u32 (*Z_envZ__11f425a8Z_iiidddd)(u32, u32, f64, f64, f64, f64);
/* import: 'env' '_383e6222' */
extern u32 (*Z_envZ__383e6222Z_iiiii)(u32, u32, u32, u32);
/* import: 'env' '_702d1ddb' */
extern void (*Z_envZ__702d1ddbZ_vi)(u32);
/* import: 'env' '_3ae2ec65' */
extern u32 (*Z_envZ__3ae2ec65Z_iiiidd)(u32, u32, u32, f64, f64);
/* import: 'env' '_345d6750' */
extern u32 (*Z_envZ__345d6750Z_iii)(u32, u32);
/* import: 'env' '_28fdec04' */
extern f64 (*Z_envZ__28fdec04Z_diii)(u32, u32, u32);
/* import: 'env' '_491b2aae' */
extern u32 (*Z_envZ__491b2aaeZ_iii)(u32, u32);
/* import: 'env' '_20a10768' */
extern u32 (*Z_envZ__20a10768Z_iiiidddd)(u32, u32, u32, f64, f64, f64, f64);
/* import: 'env' '_1d28ae0c' */
extern void (*Z_envZ__1d28ae0cZ_vv)(void);
/* import: 'env' '_74f3be46' */
extern u32 (*Z_envZ__74f3be46Z_iii)(u32, u32);
/* import: 'env' '_22e6dc70' */
extern void (*Z_envZ__22e6dc70Z_vv)(void);
/* import: 'asm2wasm' 'f64-to-int' */
extern u32 (*Z_asm2wasmZ_f64Z2DtoZ2DintZ_id)(f64);
/* import: 'env' 'memory' */
extern wasm_rt_memory_t (*Z_envZ_memory);
/* import: 'env' 'table' */
extern wasm_rt_table_t (*Z_envZ_table);
/* import: 'env' 'memoryBase' */
extern u32 (*Z_envZ_memoryBaseZ_i);
/* import: 'env' 'tableBase' */
extern u32 (*Z_envZ_tableBaseZ_i);

/* export: '_64f2b350' */
extern void (*WASM_RT_ADD_PREFIX(Z__64f2b350Z_vii))(u32, u32);
/* export: '_1d045cdf' */
extern f64 (*WASM_RT_ADD_PREFIX(Z__1d045cdfZ_dd))(f64);
/* export: '_4227afd1' */
extern void (*WASM_RT_ADD_PREFIX(Z__4227afd1Z_vv))(void);
/* export: '_6010ab46' */
extern u32 (*WASM_RT_ADD_PREFIX(Z__6010ab46Z_iv))(void);
/* export: '_7cc924cb' */
extern void (*WASM_RT_ADD_PREFIX(Z__7cc924cbZ_vv))(void);
/* export: '_7fb38e6a' */
extern u32 (*WASM_RT_ADD_PREFIX(Z__7fb38e6aZ_iiiii))(u32, u32, u32, u32);
/* export: '_457a9951' */
extern void (*WASM_RT_ADD_PREFIX(Z__457a9951Z_vv))(void);
/* export: '_5cf87cb2' */
extern u32 (*WASM_RT_ADD_PREFIX(Z__5cf87cb2Z_iv))(void);
/* export: '_259f1567' */
extern void (*WASM_RT_ADD_PREFIX(Z__259f1567Z_vv))(void);
/* export: '_f079fe0' */
extern u32 (*WASM_RT_ADD_PREFIX(Z__f079fe0Z_iiii))(u32, u32, u32);
/* export: '_5f2110e5' */
extern u32 (*WASM_RT_ADD_PREFIX(Z__5f2110e5Z_iiiiii))(u32, u32, u32, u32, u32);
/* export: '_3bf19ce4' */
extern void (*WASM_RT_ADD_PREFIX(Z__3bf19ce4Z_vi))(u32);
/* export: '_7ef0856b' */
extern void (*WASM_RT_ADD_PREFIX(Z__7ef0856bZ_vi))(u32);
/* export: '_54673141' */
extern void (*WASM_RT_ADD_PREFIX(Z__54673141Z_vi))(u32);
/* export: '_2a02ad61' */
extern u32 (*WASM_RT_ADD_PREFIX(Z__2a02ad61Z_iiii))(u32, u32, u32);
/* export: '_6f5a6879' */
extern u32 (*WASM_RT_ADD_PREFIX(Z__6f5a6879Z_ii))(u32);
/* export: '_3301197c' */
extern u32 (*WASM_RT_ADD_PREFIX(Z__3301197cZ_iiii))(u32, u32, u32);
/* export: '_610df677' */
extern u32 (*WASM_RT_ADD_PREFIX(Z__610df677Z_iiiii))(u32, u32, u32, u32);
/* export: '_15f85807' */
extern u32 (*WASM_RT_ADD_PREFIX(Z__15f85807Z_iiii))(u32, u32, u32);
/* export: '_3cbe58af' */
extern u32 (*WASM_RT_ADD_PREFIX(Z__3cbe58afZ_iiiii))(u32, u32, u32, u32);
/* export: '_70cd50c7' */
extern void (*WASM_RT_ADD_PREFIX(Z__70cd50c7Z_vv))(void);
/* export: '_72ac6d9' */
extern void (*WASM_RT_ADD_PREFIX(Z__72ac6d9Z_vi))(u32);
/* export: '_241521df' */
extern u32 (*WASM_RT_ADD_PREFIX(Z__241521dfZ_iiiii))(u32, u32, u32, u32);
/* export: '_36219dcf' */
extern void (*WASM_RT_ADD_PREFIX(Z__36219dcfZ_vi))(u32);
/* export: '_486a4c06' */
extern void (*WASM_RT_ADD_PREFIX(Z__486a4c06Z_viiii))(u32, u32, u32, u32);
/* export: '_7a235762' */
extern u32 (*WASM_RT_ADD_PREFIX(Z__7a235762Z_iiiii))(u32, u32, u32, u32);
/* export: '_cfcfa95' */
extern void (*WASM_RT_ADD_PREFIX(Z__cfcfa95Z_vi))(u32);
/* export: '_49b12fc' */
extern u32 (*WASM_RT_ADD_PREFIX(Z__49b12fcZ_ii))(u32);
/* export: '_5652a074' */
extern u32 (*WASM_RT_ADD_PREFIX(Z__5652a074Z_iv))(void);
/* export: '_2be46f37' */
extern void (*WASM_RT_ADD_PREFIX(Z__2be46f37Z_vv))(void);
/* export: '_401ae241' */
extern u32 (*WASM_RT_ADD_PREFIX(Z__401ae241Z_ii))(u32);
/* export: '_49050864' */
extern u32 (*WASM_RT_ADD_PREFIX(Z__49050864Z_ii))(u32);
/* export: '_498bebf7' */
extern u32 (*WASM_RT_ADD_PREFIX(Z__498bebf7Z_iii))(u32, u32);
/* export: '_530dd54e' */
extern void (*WASM_RT_ADD_PREFIX(Z__530dd54eZ_vv))(void);
/* export: '_f507dfc' */
extern void (*WASM_RT_ADD_PREFIX(Z__f507dfcZ_vi))(u32);
/* export: '_7a60a355' */
extern u32 (*WASM_RT_ADD_PREFIX(Z__7a60a355Z_iii))(u32, u32);
/* export: '_5f328e02' */
extern u32 (*WASM_RT_ADD_PREFIX(Z__5f328e02Z_iiii))(u32, u32, u32);
/* export: '_160b004a' */
extern u32 (*WASM_RT_ADD_PREFIX(Z__160b004aZ_ii))(u32);
/* export: '_19331fe7' */
extern u32 (*WASM_RT_ADD_PREFIX(Z__19331fe7Z_ii))(u32);
/* export: '_440ea961' */
extern u32 (*WASM_RT_ADD_PREFIX(Z__440ea961Z_ii))(u32);
/* export: '_112e0eec' */
extern u32 (*WASM_RT_ADD_PREFIX(Z__112e0eecZ_iv))(void);
/* export: '_787b04f9' */
extern void (*WASM_RT_ADD_PREFIX(Z__787b04f9Z_vv))(void);
/* export: '_76484455' */
extern void (*WASM_RT_ADD_PREFIX(Z__76484455Z_vv))(void);
/* export: 'runPostSets' */
extern void (*WASM_RT_ADD_PREFIX(Z_runPostSetsZ_vv))(void);
/* export: 'stackAlloc' */
extern u32 (*WASM_RT_ADD_PREFIX(Z_stackAllocZ_ii))(u32);
/* export: 'stackSave' */
extern u32 (*WASM_RT_ADD_PREFIX(Z_stackSaveZ_iv))(void);
/* export: 'stackRestore' */
extern void (*WASM_RT_ADD_PREFIX(Z_stackRestoreZ_vi))(u32);
/* export: 'establishStackSpace' */
extern void (*WASM_RT_ADD_PREFIX(Z_establishStackSpaceZ_vii))(u32, u32);
/* export: 'setTempRet0' */
extern void (*WASM_RT_ADD_PREFIX(Z_setTempRet0Z_vi))(u32);
/* export: 'getTempRet0' */
extern u32 (*WASM_RT_ADD_PREFIX(Z_getTempRet0Z_iv))(void);
/* export: 'setThrew' */
extern void (*WASM_RT_ADD_PREFIX(Z_setThrewZ_vii))(u32, u32);
/* export: 'dynCall_iiiiiiii' */
extern u32 (*WASM_RT_ADD_PREFIX(Z_dynCall_iiiiiiiiZ_iiiiiiiii))(u32, u32, u32, u32, u32, u32, u32, u32);
/* export: 'dynCall_iiii' */
extern u32 (*WASM_RT_ADD_PREFIX(Z_dynCall_iiiiZ_iiiii))(u32, u32, u32, u32);
/* export: 'dynCall_viiiiii' */
extern void (*WASM_RT_ADD_PREFIX(Z_dynCall_viiiiiiZ_viiiiiii))(u32, u32, u32, u32, u32, u32, u32);
/* export: 'dynCall_viiiii' */
extern void (*WASM_RT_ADD_PREFIX(Z_dynCall_viiiiiZ_viiiiii))(u32, u32, u32, u32, u32, u32);
/* export: 'dynCall_dii' */
extern f64 (*WASM_RT_ADD_PREFIX(Z_dynCall_diiZ_diii))(u32, u32, u32);
/* export: 'dynCall_iiiiiid' */
extern u32 (*WASM_RT_ADD_PREFIX(Z_dynCall_iiiiiidZ_iiiiiiid))(u32, u32, u32, u32, u32, u32, f64);
/* export: 'dynCall_vi' */
extern void (*WASM_RT_ADD_PREFIX(Z_dynCall_viZ_vii))(u32, u32);
/* export: 'dynCall_vii' */
extern void (*WASM_RT_ADD_PREFIX(Z_dynCall_viiZ_viii))(u32, u32, u32);
/* export: 'dynCall_iiiiiii' */
extern u32 (*WASM_RT_ADD_PREFIX(Z_dynCall_iiiiiiiZ_iiiiiiii))(u32, u32, u32, u32, u32, u32, u32);
/* export: 'dynCall_ii' */
extern u32 (*WASM_RT_ADD_PREFIX(Z_dynCall_iiZ_iii))(u32, u32);
/* export: 'dynCall_viii' */
extern void (*WASM_RT_ADD_PREFIX(Z_dynCall_viiiZ_viiii))(u32, u32, u32, u32);
/* export: 'dynCall_v' */
extern void (*WASM_RT_ADD_PREFIX(Z_dynCall_vZ_vi))(u32);
/* export: 'dynCall_iiiiiiiii' */
extern u32 (*WASM_RT_ADD_PREFIX(Z_dynCall_iiiiiiiiiZ_iiiiiiiiii))(u32, u32, u32, u32, u32, u32, u32, u32, u32);
/* export: 'dynCall_iiiii' */
extern u32 (*WASM_RT_ADD_PREFIX(Z_dynCall_iiiiiZ_iiiiii))(u32, u32, u32, u32, u32);
/* export: 'dynCall_idd' */
extern u32 (*WASM_RT_ADD_PREFIX(Z_dynCall_iddZ_iidd))(u32, f64, f64);
/* export: 'dynCall_viiii' */
extern void (*WASM_RT_ADD_PREFIX(Z_dynCall_viiiiZ_viiiii))(u32, u32, u32, u32, u32);
/* export: 'dynCall_iii' */
extern u32 (*WASM_RT_ADD_PREFIX(Z_dynCall_iiiZ_iiii))(u32, u32, u32);
/* export: 'dynCall_iiiiid' */
extern u32 (*WASM_RT_ADD_PREFIX(Z_dynCall_iiiiidZ_iiiiiid))(u32, u32, u32, u32, u32, f64);
/* export: 'dynCall_iiiiii' */
extern u32 (*WASM_RT_ADD_PREFIX(Z_dynCall_iiiiiiZ_iiiiiii))(u32, u32, u32, u32, u32, u32);
#ifdef __cplusplus
}
#endif

#endif  /* BUILD_F5A73AC23037A88EAEE793B998F78853CCE1130C_WASM_H_GENERATED_ */
