// libs/model/src/index.ts

// Placeholder för att få bygg/grön pipeline direkt.
// Här kommer kanoniska enums/typer för Game/Cycle/Round senare.
export type Brand<T, B extends string> = T & { readonly __brand: B };
