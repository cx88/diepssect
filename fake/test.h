#ifndef TEST_H_GENERATED_
#define TEST_H_GENERATED_
#ifdef __cplusplus
extern "C" {
#endif

#include <stdint.h>

#include "wasm-rt.h"

#ifndef WASM_RT_MODULE_PREFIX
#define WASM_RT_MODULE_PREFIX
#endif

#define WASM_RT_PASTE_(x, y) x ## y
#define WASM_RT_PASTE(x, y) WASM_RT_PASTE_(x, y)
#define WASM_RT_ADD_PREFIX(x) WASM_RT_PASTE(WASM_RT_MODULE_PREFIX, x)

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
/* import: 'env' 'memory' */
extern wasm_rt_memory_t (*Z_envZ_memory);
/* import: 'env' 'table' */
extern wasm_rt_table_t (*Z_envZ_table);
/* import: 'env' 'memoryBase' */
extern u32 (*Z_envZ_memoryBaseZ_i);
/* import: 'env' 'tableBase' */
extern u32 (*Z_envZ_tableBaseZ_i);
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
/* import: 'env' '_44ec023f' */
extern u32 (*Z_envZ__44ec023fZ_iii)(u32, u32);
/* import: 'env' '_37ef5551' */
extern u32 (*Z_envZ__37ef5551Z_iiiiii)(u32, u32, u32, u32, u32);
/* import: 'env' '_1da92d65' */
extern f64 (*Z_envZ__1da92d65Z_didd)(u32, f64, f64);
/* import: 'env' '_5b160692' */
extern void (*Z_envZ__5b160692Z_vv)(void);
/* import: 'env' '_11e81c19' */
extern void (*Z_envZ__11e81c19Z_viiii)(u32, u32, u32, u32);
/* import: 'env' '_817d1bb' */
extern u32 (*Z_envZ__817d1bbZ_iv)(void);
/* import: 'env' '_1fed7088' */
extern u32 (*Z_envZ__1fed7088Z_iiidd)(u32, u32, f64, f64);
/* import: 'env' '_6ba99a3a' */
extern u32 (*Z_envZ__6ba99a3aZ_iii)(u32, u32);
/* import: 'env' '_3aa20c9f' */
extern f64 (*Z_envZ__3aa20c9fZ_dv)(void);
/* import: 'env' '_6d9039e0' */
extern u32 (*Z_envZ__6d9039e0Z_iiidddddd)(u32, u32, f64, f64, f64, f64, f64, f64);
/* import: 'env' '_e0a36e1' */
extern u32 (*Z_envZ__e0a36e1Z_iii)(u32, u32);
/* import: 'env' '_73b3f4dc' */
extern u32 (*Z_envZ__73b3f4dcZ_ii)(u32);
/* import: 'env' '_4849b562' */
extern void (*Z_envZ__4849b562Z_viii)(u32, u32, u32);
/* import: 'env' '_4f107009' */
extern u32 (*Z_envZ__4f107009Z_iiiiii)(u32, u32, u32, u32, u32);
/* import: 'env' '_7ca91a67' */
extern u32 (*Z_envZ__7ca91a67Z_ii)(u32);
/* import: 'env' '_466ffc59' */
extern void (*Z_envZ__466ffc59Z_vi)(u32);
/* import: 'env' '_3b9db1a9' */
extern f64 (*Z_envZ__3b9db1a9Z_dv)(void);
/* import: 'env' '_2eb15c7f' */
extern u32 (*Z_envZ__2eb15c7fZ_iiii)(u32, u32, u32);
/* import: 'env' '_202cac45' */
extern void (*Z_envZ__202cac45Z_vi)(u32);
/* import: 'env' '_1b63264b' */
extern f64 (*Z_envZ__1b63264bZ_dii)(u32, u32);
/* import: 'env' '_5fbc6ade' */
extern u32 (*Z_envZ__5fbc6adeZ_iiddddi)(u32, f64, f64, f64, f64, u32);
/* import: 'env' '_38fbe96a' */
extern void (*Z_envZ__38fbe96aZ_vi)(u32);
/* import: 'env' '_7d7f372d' */
extern u32 (*Z_envZ__7d7f372dZ_ii)(u32);
/* import: 'env' '_32d930c9' */
extern u32 (*Z_envZ__32d930c9Z_iiid)(u32, u32, f64);
/* import: 'env' '_4a49bc82' */
extern u32 (*Z_envZ__4a49bc82Z_iii)(u32, u32);
/* import: 'env' '_670f6e34' */
extern u32 (*Z_envZ__670f6e34Z_iii)(u32, u32);
/* import: 'env' '_1d677ada' */
extern void (*Z_envZ__1d677adaZ_vi)(u32);
/* import: 'env' '_4d41badc' */
extern u32 (*Z_envZ__4d41badcZ_iiiddi)(u32, u32, f64, f64, u32);
/* import: 'env' '_92581b2' */
extern u32 (*Z_envZ__92581b2Z_iiii)(u32, u32, u32);
/* import: 'env' '_4d537a01' */
extern u32 (*Z_envZ__4d537a01Z_iiidddd)(u32, u32, f64, f64, f64, f64);
/* import: 'env' '_4cdce971' */
extern u32 (*Z_envZ__4cdce971Z_iiiii)(u32, u32, u32, u32);
/* import: 'env' '_3d345949' */
extern void (*Z_envZ__3d345949Z_vi)(u32);
/* import: 'env' '_53a98c0a' */
extern u32 (*Z_envZ__53a98c0aZ_iiiidd)(u32, u32, u32, f64, f64);
/* import: 'env' '_4c6c9f1f' */
extern u32 (*Z_envZ__4c6c9f1fZ_iii)(u32, u32);
/* import: 'env' '_6a007f73' */
extern f64 (*Z_envZ__6a007f73Z_diii)(u32, u32, u32);
/* import: 'env' '_281d7ec1' */
extern u32 (*Z_envZ__281d7ec1Z_iii)(u32, u32);
/* import: 'env' '_6e7b7c8' */
extern u32 (*Z_envZ__6e7b7c8Z_iiiidddd)(u32, u32, u32, f64, f64, f64, f64);
/* import: 'env' '_9154e1b' */
extern void (*Z_envZ__9154e1bZ_vv)(void);
/* import: 'env' '_8a564b8' */
extern u32 (*Z_envZ__8a564b8Z_iii)(u32, u32);
/* import: 'env' '_f19f455' */
extern void (*Z_envZ__f19f455Z_vv)(void);
/* import: 'asm2wasm' 'f64-to-int' */
extern u32 (*Z_asm2wasmZ_f64Z2DtoZ2DintZ_id)(f64);

/* export: '_6c12216c' */
extern void (*WASM_RT_ADD_PREFIX(Z__6c12216cZ_vii))(u32, u32);
/* export: '_2b32e53b' */
extern f64 (*WASM_RT_ADD_PREFIX(Z__2b32e53bZ_dd))(f64);
/* export: '_bfc8fd4' */
extern void (*WASM_RT_ADD_PREFIX(Z__bfc8fd4Z_vv))(void);
/* export: '_e159e68' */
extern u32 (*WASM_RT_ADD_PREFIX(Z__e159e68Z_iv))(void);
/* export: '_57403805' */
extern void (*WASM_RT_ADD_PREFIX(Z__57403805Z_vv))(void);
/* export: '_79a796e5' */
extern u32 (*WASM_RT_ADD_PREFIX(Z__79a796e5Z_iiiii))(u32, u32, u32, u32);
/* export: '_16c61acd' */
extern void (*WASM_RT_ADD_PREFIX(Z__16c61acdZ_vv))(void);
/* export: '_1065663f' */
extern u32 (*WASM_RT_ADD_PREFIX(Z__1065663fZ_iv))(void);
/* export: '_6d876630' */
extern void (*WASM_RT_ADD_PREFIX(Z__6d876630Z_vv))(void);
/* export: '_664e9249' */
extern u32 (*WASM_RT_ADD_PREFIX(Z__664e9249Z_iiii))(u32, u32, u32);
/* export: '_64c247ec' */
extern u32 (*WASM_RT_ADD_PREFIX(Z__64c247ecZ_iiiiii))(u32, u32, u32, u32, u32);
/* export: '_4d17c882' */
extern void (*WASM_RT_ADD_PREFIX(Z__4d17c882Z_vi))(u32);
/* export: '_1bf64a7' */
extern void (*WASM_RT_ADD_PREFIX(Z__1bf64a7Z_vi))(u32);
/* export: '_10a6caac' */
extern void (*WASM_RT_ADD_PREFIX(Z__10a6caacZ_vi))(u32);
/* export: '_63a0450c' */
extern u32 (*WASM_RT_ADD_PREFIX(Z__63a0450cZ_iiii))(u32, u32, u32);
/* export: '_2a665258' */
extern u32 (*WASM_RT_ADD_PREFIX(Z__2a665258Z_ii))(u32);
/* export: '_17863535' */
extern u32 (*WASM_RT_ADD_PREFIX(Z__17863535Z_iiii))(u32, u32, u32);
/* export: '_74c2f7c3' */
extern u32 (*WASM_RT_ADD_PREFIX(Z__74c2f7c3Z_iiiii))(u32, u32, u32, u32);
/* export: '_3e2469d8' */
extern u32 (*WASM_RT_ADD_PREFIX(Z__3e2469d8Z_iiii))(u32, u32, u32);
/* export: '_4db4edc0' */
extern u32 (*WASM_RT_ADD_PREFIX(Z__4db4edc0Z_iiiii))(u32, u32, u32, u32);
/* export: '_7a61d285' */
extern void (*WASM_RT_ADD_PREFIX(Z__7a61d285Z_vv))(void);
/* export: '_644e12b6' */
extern void (*WASM_RT_ADD_PREFIX(Z__644e12b6Z_vi))(u32);
/* export: '_22910c01' */
extern u32 (*WASM_RT_ADD_PREFIX(Z__22910c01Z_iiiii))(u32, u32, u32, u32);
/* export: '_6ec285a3' */
extern void (*WASM_RT_ADD_PREFIX(Z__6ec285a3Z_vi))(u32);
/* export: '_1a8dc8b8' */
extern void (*WASM_RT_ADD_PREFIX(Z__1a8dc8b8Z_viiii))(u32, u32, u32, u32);
/* export: '_1e8531c8' */
extern u32 (*WASM_RT_ADD_PREFIX(Z__1e8531c8Z_iiiii))(u32, u32, u32, u32);
/* export: '_5d28bd2a' */
extern void (*WASM_RT_ADD_PREFIX(Z__5d28bd2aZ_vi))(u32);
/* export: '_6d900685' */
extern u32 (*WASM_RT_ADD_PREFIX(Z__6d900685Z_ii))(u32);
/* export: '_57391b49' */
extern u32 (*WASM_RT_ADD_PREFIX(Z__57391b49Z_iv))(void);
/* export: '_764d2878' */
extern void (*WASM_RT_ADD_PREFIX(Z__764d2878Z_vv))(void);
/* export: '_6830ed67' */
extern u32 (*WASM_RT_ADD_PREFIX(Z__6830ed67Z_ii))(u32);
/* export: '_3ac8e1f5' */
extern u32 (*WASM_RT_ADD_PREFIX(Z__3ac8e1f5Z_ii))(u32);
/* export: '_7c1fc741' */
extern u32 (*WASM_RT_ADD_PREFIX(Z__7c1fc741Z_iii))(u32, u32);
/* export: '_3e9bd0f2' */
extern void (*WASM_RT_ADD_PREFIX(Z__3e9bd0f2Z_vv))(void);
/* export: '_2a1a33e5' */
extern void (*WASM_RT_ADD_PREFIX(Z__2a1a33e5Z_vi))(u32);
/* export: '_70538cef' */
extern u32 (*WASM_RT_ADD_PREFIX(Z__70538cefZ_iii))(u32, u32);
/* export: '_1722603f' */
extern u32 (*WASM_RT_ADD_PREFIX(Z__1722603fZ_iiii))(u32, u32, u32);
/* export: '_52132039' */
extern u32 (*WASM_RT_ADD_PREFIX(Z__52132039Z_ii))(u32);
/* export: '_4528ffe0' */
extern u32 (*WASM_RT_ADD_PREFIX(Z__4528ffe0Z_ii))(u32);
/* export: '_1aa2133b' */
extern u32 (*WASM_RT_ADD_PREFIX(Z__1aa2133bZ_ii))(u32);
/* export: '_2f061953' */
extern u32 (*WASM_RT_ADD_PREFIX(Z__2f061953Z_iv))(void);
/* export: '_9df57d5' */
extern void (*WASM_RT_ADD_PREFIX(Z__9df57d5Z_vv))(void);
/* export: '_3ffb382d' */
extern void (*WASM_RT_ADD_PREFIX(Z__3ffb382dZ_vv))(void);
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

#endif  /* TEST_H_GENERATED_ */
