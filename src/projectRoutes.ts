// Route ids mirror the top-level folder ids in src/projectStructure.ts.
export const PROJECT_ROUTE_IDS = [
  'plan-to-build',
  'build-completed',
  'plan-to-render',
  'plan-optimize',
] as const

export const PROJECT_ROUTE_PATHS: string[] = PROJECT_ROUTE_IDS.map(
  (id) => `/projects/${id}`,
)

export function isProjectRoute(path: string): boolean {
  return PROJECT_ROUTE_PATHS.includes(path)
}
