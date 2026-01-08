export interface AppState {
  currentProfile: string | null;
  lastScan: string | null;
}

export class StateStore {
  private state: AppState = {
    currentProfile: null,
    lastScan: null,
  };

  async load(): Promise<AppState> {
    return this.state;
  }

  async save(_state: Partial<AppState>): Promise<void> {
    this.state = { ...this.state, ..._state };
  }

  async setCurrentProfile(profile: string): Promise<void> {
    this.state.currentProfile = profile;
  }

  getCurrentProfile(): string | null {
    return this.state.currentProfile;
  }
}
