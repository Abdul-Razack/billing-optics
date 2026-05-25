/* eslint-disable typescript.react.portability.i18next.jsx-not-internationalized.jsx-not-internationalized */
import { QueryClient, dehydrate, hydrate } from '@tanstack/react-query';

const CACHE_KEY = 'optics_pos_query_cache';
const MAX_AGE = 24 * 60 * 60 * 1000;

export async function persistQueryCache(queryClient: QueryClient) {
  const dehydratedState = dehydrate(queryClient, {
    shouldDehydrateQuery: (query) => {
      return query.state.status === 'success';
    },
  });

  const payload = {
    timestamp: Date.now(),
    state: dehydratedState,
  };

  try {
    const db = await openDB();
    const tx = db.transaction('cache', 'readwrite');
    tx.objectStore('cache').put(payload, CACHE_KEY);
  } catch (err) {
    console.error('Failed to persist cache', err);
  }
}

export async function restoreQueryCache(queryClient: QueryClient) {
  try {
    const db = await openDB();
    const tx = db.transaction('cache', 'readonly');
    const payload = await new Promise<any>((resolve, reject) => {
      const request = tx.objectStore('cache').get(CACHE_KEY);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    if (payload && Date.now() - payload.timestamp < MAX_AGE) {
      hydrate(queryClient, payload.state);
    }
  } catch (err) {
    console.error('Failed to restore cache', err);
  }
}

function openDB(): Promise<IDBDatabase> {
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
