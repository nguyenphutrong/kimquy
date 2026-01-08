import { BaseAdapter, type AdapterContext } from './base.ts';

export class ClaudeCodeAdapter extends BaseAdapter {
  name = 'claude-code';

  async generate(_context: AdapterContext): Promise<void> {
    throw new Error('Not implemented');
  }

  async validate(): Promise<boolean> {
    return true;
  }
}
