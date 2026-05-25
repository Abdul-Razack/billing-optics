/* eslint-disable typescript.react.portability.i18next.jsx-not-internationalized.jsx-not-internationalized */
export interface QueuedMutation {
  id: string;
  type: string;
  payload: any;
  createdAt: number;
  retryCount: number;
}

export class MutationQueue {
  private async getDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('optics_pos_db', 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains('cache')) {
          request.result.createObjectStore('cache');
        }
        if (!request.result.objectStoreNames.contains('mutations')) {
          request.result.createObjectStore('mutations', { keyPath: 'id' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async enqueue(type: string, payload: any) {
    const db = await this.getDB();
    const mutation: QueuedMutation = {
      id: crypto.randomUUID(),
      type,
      payload,
      createdAt: Date.now(),
      retryCount: 0,
    };
    const tx = db.transaction('mutations', 'readwrite');
    tx.objectStore('mutations').put(mutation);
  }

  async dequeue(id: string) {
    const db = await this.getDB();
    const tx = db.transaction('mutations', 'readwrite');
    tx.objectStore('mutations').delete(id);
  }

  async getQueue(): Promise<QueuedMutation[]> {
    const db = await this.getDB();
    const tx = db.transaction('mutations', 'readonly');
    return new Promise((resolve, reject) => {
      const request = tx.objectStore('mutations').getAll();
      request.onsuccess = () => {
        const sorted = (request.result as QueuedMutation[]).sort((a, b) => a.createdAt - b.createdAt);
        resolve(sorted);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async updateRetryCount(id: string, count: number) {
    const db = await this.getDB();
    const tx = db.transaction('mutations', 'readwrite');
    const store = tx.objectStore('mutations');
    const request = store.get(id);
    request.onsuccess = () => {
      if (request.result) {
        request.result.retryCount = count;
        store.put(request.result);
      }
    };
  }
}

export const mutationQueue = new MutationQueue();
