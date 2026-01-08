import type { BaseAdapter } from './base.ts';
import { ClaudeCodeAdapter } from './claude-code.ts';

class AdapterRegistry {
  private adapters: Map<string, BaseAdapter> = new Map();

  constructor() {
    this.register(new ClaudeCodeAdapter());
  }

  register(adapter: BaseAdapter): void {
    this.adapters.set(adapter.name, adapter);
  }

  get(name: string): BaseAdapter | undefined {
    return this.adapters.get(name);
  }

  list(): string[] {
    return Array.from(this.adapters.keys());
  }
}

export const adapterRegistry = new AdapterRegistry();
