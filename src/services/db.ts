import {
  Project,
  Artist,
  Session,
  Instrumental,
  PluginItem,
  ProcessingChain,
  Experience,
  JournalEntry,
  LearningCategory,
  LibraryItem,
  StudioSettings,
  StudioStats,
} from '../types';
import {
  INITIAL_PROJECTS,
  INITIAL_ARTISTS,
  INITIAL_SESSIONS,
  INITIAL_INSTRUMENTALS,
  INITIAL_PLUGINS,
  INITIAL_CHAINS,
  INITIAL_EXPERIENCES,
  INITIAL_JOURNAL,
  INITIAL_LEARNING,
  INITIAL_LIBRARY,
  INITIAL_SETTINGS,
} from '../data/initialData';

const DB_NAME = 'MeloStudioHubDB';
const DB_VERSION = 1;

type StoreName =
  | 'projects'
  | 'artists'
  | 'sessions'
  | 'instrumentals'
  | 'plugins'
  | 'chains'
  | 'experiences'
  | 'journal'
  | 'learning'
  | 'library'
  | 'settings';

class StudioDB {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private memoryFallback: Record<string, any[]> = {};
  private settingsFallback: StudioSettings = INITIAL_SETTINGS;

  constructor() {
    this.initFallback();
  }

  private initFallback() {
    try {
      const storedSettings = localStorage.getItem('msh_settings');
      if (storedSettings) {
        this.settingsFallback = JSON.parse(storedSettings);
      }
    } catch (e) {
      console.warn('LocalStorage not available, utilizing memory fallback');
    }
  }

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    if (typeof window === 'undefined' || !window.indexedDB) {
      return Promise.reject(new Error('IndexedDB não suportado'));
    }

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Erro ao abrir IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const stores: StoreName[] = [
          'projects',
          'artists',
          'sessions',
          'instrumentals',
          'plugins',
          'chains',
          'experiences',
          'journal',
          'learning',
          'library',
          'settings',
        ];

        stores.forEach((storeName) => {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: 'id' });
          }
        });
      };
    });

    return this.dbPromise;
  }

  public async initializeDatabase(): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(['settings', 'chains', 'plugins'], 'readonly');
      const settingsStore = tx.objectStore('settings');
      const request = settingsStore.get('current');

      request.onsuccess = async () => {
        if (!request.result) {
          await this.seedInitialData();
        }
      };
    } catch (error) {
      console.warn('Fallback: inicializando memória local');
      this.seedFallbackMemory();
    }
  }

  private async seedInitialData(): Promise<void> {
    const db = await this.getDB();
    const tx = db.transaction(
      [
        'projects',
        'artists',
        'sessions',
        'instrumentals',
        'plugins',
        'chains',
        'experiences',
        'journal',
        'learning',
        'library',
        'settings',
      ],
      'readwrite'
    );

    INITIAL_PROJECTS.forEach((item) => tx.objectStore('projects').put(item));
    INITIAL_ARTISTS.forEach((item) => tx.objectStore('artists').put(item));
    INITIAL_SESSIONS.forEach((item) => tx.objectStore('sessions').put(item));
    INITIAL_INSTRUMENTALS.forEach((item) => tx.objectStore('instrumentals').put(item));
    INITIAL_PLUGINS.forEach((item) => tx.objectStore('plugins').put(item));
    INITIAL_CHAINS.forEach((item) => tx.objectStore('chains').put(item));
    INITIAL_EXPERIENCES.forEach((item) => tx.objectStore('experiences').put(item));
    INITIAL_JOURNAL.forEach((item) => tx.objectStore('journal').put(item));
    INITIAL_LEARNING.forEach((item) => tx.objectStore('learning').put(item));
    INITIAL_LIBRARY.forEach((item) => tx.objectStore('library').put(item));
    tx.objectStore('settings').put({ id: 'current', ...INITIAL_SETTINGS });

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  private seedFallbackMemory() {
    this.memoryFallback = {
      projects: [...INITIAL_PROJECTS],
      artists: [...INITIAL_ARTISTS],
      sessions: [...INITIAL_SESSIONS],
      instrumentals: [...INITIAL_INSTRUMENTALS],
      plugins: [...INITIAL_PLUGINS],
      chains: [...INITIAL_CHAINS],
      experiences: [...INITIAL_EXPERIENCES],
      journal: [...INITIAL_JOURNAL],
      learning: [...INITIAL_LEARNING],
      library: [...INITIAL_LIBRARY],
    };
    this.settingsFallback = { ...INITIAL_SETTINGS };
  }

  // Generic Operations
  public async getAll<T>(storeName: StoreName): Promise<T[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result as T[]);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      return (this.memoryFallback[storeName] as T[]) || [];
    }
  }

  public async getById<T>(storeName: StoreName, id: string): Promise<T | null> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.get(id);
        req.onsuccess = () => resolve((req.result as T) || null);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      const items = (this.memoryFallback[storeName] as any[]) || [];
      const found = items.find((i) => i.id === id);
      return found || null;
    }
  }

  public async saveItem<T extends { id: string }>(storeName: StoreName, item: T): Promise<T> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const req = store.put(item);
        req.onsuccess = () => resolve(item);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      if (!this.memoryFallback[storeName]) {
        this.memoryFallback[storeName] = [];
      }
      const index = this.memoryFallback[storeName].findIndex((i) => i.id === item.id);
      if (index >= 0) {
        this.memoryFallback[storeName][index] = item;
      } else {
        this.memoryFallback[storeName].push(item);
      }
      return item;
    }
  }

  public async deleteItem(storeName: StoreName, id: string): Promise<boolean> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const req = store.delete(id);
        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      if (this.memoryFallback[storeName]) {
        this.memoryFallback[storeName] = this.memoryFallback[storeName].filter((i) => i.id !== id);
      }
      return true;
    }
  }

  // Settings
  public async getSettings(): Promise<StudioSettings> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction('settings', 'readonly');
        const store = tx.objectStore('settings');
        const req = store.get('current');
        req.onsuccess = () => {
          if (req.result) {
            const { id, ...data } = req.result;
            resolve(data as StudioSettings);
          } else {
            resolve(INITIAL_SETTINGS);
          }
        };
        req.onerror = () => resolve(this.settingsFallback);
      });
    } catch (e) {
      return this.settingsFallback;
    }
  }

  public async saveSettings(settings: StudioSettings): Promise<StudioSettings> {
    this.settingsFallback = settings;
    try {
      localStorage.setItem('msh_settings', JSON.stringify(settings));
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('settings', 'readwrite');
        const store = tx.objectStore('settings');
        const req = store.put({ id: 'current', ...settings });
        req.onsuccess = () => resolve(settings);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      return settings;
    }
  }

  // Statistics
  public async getStats(): Promise<StudioStats> {
    const projects = await this.getAll<Project>('projects');
    const sessions = await this.getAll<Session>('sessions');
    const chains = await this.getAll<ProcessingChain>('chains');
    const plugins = await this.getAll<PluginItem>('plugins');
    const instrumentals = await this.getAll<Instrumental>('instrumentals');
    const experiences = await this.getAll<Experience>('experiences');

    return {
      projectsCount: projects.length,
      completedProjectsCount: projects.filter((p) => p.status === 'Finalizado').length,
      sessionsCount: sessions.length,
      chainsCount: chains.length,
      pluginsCount: plugins.length,
      ownedPluginsCount: plugins.filter((p) => p.owned).length,
      ideasCount: instrumentals.length,
      experiencesCount: experiences.length,
    };
  }

  // Complete Backup Export
  public async exportBackup(): Promise<string> {
    const data = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      settings: await this.getSettings(),
      projects: await this.getAll<Project>('projects'),
      artists: await this.getAll<Artist>('artists'),
      sessions: await this.getAll<Session>('sessions'),
      instrumentals: await this.getAll<Instrumental>('instrumentals'),
      plugins: await this.getAll<PluginItem>('plugins'),
      chains: await this.getAll<ProcessingChain>('chains'),
      experiences: await this.getAll<Experience>('experiences'),
      journal: await this.getAll<JournalEntry>('journal'),
      learning: await this.getAll<LearningCategory>('learning'),
      library: await this.getAll<LibraryItem>('library'),
    };
    return JSON.stringify(data, null, 2);
  }

  // Complete Backup Import
  public async importBackup(
    jsonString: string,
    strategy: 'replace' | 'merge' = 'replace'
  ): Promise<{ success: boolean; message: string }> {
    try {
      const data = JSON.parse(jsonString);
      if (!data || typeof data !== 'object') {
        throw new Error('Formato JSON inválido');
      }

      const db = await this.getDB();
      const stores: StoreName[] = [
        'projects',
        'artists',
        'sessions',
        'instrumentals',
        'plugins',
        'chains',
        'experiences',
        'journal',
        'learning',
        'library',
      ];

      const tx = db.transaction([...stores, 'settings'], 'readwrite');

      if (strategy === 'replace') {
        stores.forEach((s) => tx.objectStore(s).clear());
      }

      if (data.settings) {
        tx.objectStore('settings').put({ id: 'current', ...data.settings });
      }

      stores.forEach((storeName) => {
        const items = data[storeName];
        if (Array.isArray(items)) {
          const store = tx.objectStore(storeName);
          items.forEach((item) => store.put(item));
        }
      });

      return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve({ success: true, message: 'Backup importado com sucesso!' });
        tx.onerror = () => reject({ success: false, message: 'Falha ao gravar os dados do backup' });
      });
    } catch (e: any) {
      return { success: false, message: e?.message || 'Arquivo de backup inválido' };
    }
  }

  // Reset to Factory Demo Data
  public async resetToDemo(): Promise<void> {
    const db = await this.getDB();
    const stores: StoreName[] = [
      'projects',
      'artists',
      'sessions',
      'instrumentals',
      'plugins',
      'chains',
      'experiences',
      'journal',
      'learning',
      'library',
      'settings',
    ];
    const tx = db.transaction(stores, 'readwrite');
    stores.forEach((s) => tx.objectStore(s).clear());

    return new Promise((resolve, reject) => {
      tx.oncomplete = async () => {
        await this.seedInitialData();
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  }

  // Clear All Data
  public async clearAllData(): Promise<void> {
    const db = await this.getDB();
    const stores: StoreName[] = [
      'projects',
      'artists',
      'sessions',
      'instrumentals',
      'plugins',
      'chains',
      'experiences',
      'journal',
      'learning',
      'library',
    ];
    const tx = db.transaction(stores, 'readwrite');
    stores.forEach((s) => tx.objectStore(s).clear());

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
  // Convenient typed helpers
  public async init(): Promise<void> {
    return this.initializeDatabase();
  }

  public async getProjects(): Promise<Project[]> {
    return this.getAll<Project>('projects');
  }
  public async saveProject(item: Project): Promise<Project> {
    return this.saveItem<Project>('projects', item);
  }
  public async deleteProject(id: string): Promise<boolean> {
    return this.deleteItem('projects', id);
  }

  public async getArtists(): Promise<Artist[]> {
    return this.getAll<Artist>('artists');
  }
  public async saveArtist(item: Artist): Promise<Artist> {
    return this.saveItem<Artist>('artists', item);
  }
  public async deleteArtist(id: string): Promise<boolean> {
    return this.deleteItem('artists', id);
  }

  public async getSessions(): Promise<Session[]> {
    return this.getAll<Session>('sessions');
  }
  public async saveSession(item: Session): Promise<Session> {
    return this.saveItem<Session>('sessions', item);
  }
  public async deleteSession(id: string): Promise<boolean> {
    return this.deleteItem('sessions', id);
  }

  public async getChains(): Promise<ProcessingChain[]> {
    return this.getAll<ProcessingChain>('chains');
  }
  public async saveChain(item: ProcessingChain): Promise<ProcessingChain> {
    return this.saveItem<ProcessingChain>('chains', item);
  }
  public async deleteChain(id: string): Promise<boolean> {
    return this.deleteItem('chains', id);
  }

  public async getPlugins(): Promise<PluginItem[]> {
    return this.getAll<PluginItem>('plugins');
  }
  public async savePlugin(item: PluginItem): Promise<PluginItem> {
    return this.saveItem<PluginItem>('plugins', item);
  }
  public async deletePlugin(id: string): Promise<boolean> {
    return this.deleteItem('plugins', id);
  }

  public async getInstrumentals(): Promise<Instrumental[]> {
    return this.getAll<Instrumental>('instrumentals');
  }
  public async saveInstrumental(item: Instrumental): Promise<Instrumental> {
    return this.saveItem<Instrumental>('instrumentals', item);
  }
  public async deleteInstrumental(id: string): Promise<boolean> {
    return this.deleteItem('instrumentals', id);
  }

  public async getJournal(): Promise<JournalEntry[]> {
    return this.getAll<JournalEntry>('journal');
  }
  public async saveJournalEntry(item: JournalEntry): Promise<JournalEntry> {
    return this.saveItem<JournalEntry>('journal', item);
  }
  public async deleteJournalEntry(id: string): Promise<boolean> {
    return this.deleteItem('journal', id);
  }

  public async exportFullBackup(): Promise<string> {
    return this.exportBackup();
  }

  public async importFullBackup(jsonString: string): Promise<{ success: boolean; message: string }> {
    return this.importBackup(jsonString);
  }

  public async resetToFactoryData(): Promise<void> {
    return this.resetToDemo();
  }
}

export const studioDB = new StudioDB();
