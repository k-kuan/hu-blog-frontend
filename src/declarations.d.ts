declare module '@babel/standalone' {
  import type { TransformOptions } from '@babel/core';

  interface BabelStandalone {
    transform(code: string, options?: TransformOptions): { code?: string | null; map?: unknown; ast?: unknown };
    transformSync(code: string, options?: TransformOptions): { code?: string | null; map?: unknown; ast?: unknown };
    registerPlugin(name: string, plugin: unknown): void;
    registerPreset(name: string, preset: unknown): void;
  }

  const Babel: BabelStandalone;
  export default Babel;
}

