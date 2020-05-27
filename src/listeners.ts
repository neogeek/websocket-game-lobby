import { removeArrayItem } from './utils';

import { DataStore } from './types';

export default class Listeners {
    listeners: any = {};

    constructor(defaultListeners?: any) {
        if (defaultListeners) {
            this.listeners = Object.freeze(defaultListeners);
        }
    }

    addEventListener(
        type: string,
        callback: (data: any, datastore: DataStore) => Promise<void>
    ): void {
        if (!(type in this.listeners)) {
            this.listeners = Object.freeze({ ...this.listeners, [type]: [] });
        }
        if (typeof callback === 'function') {
            this.listeners[type].push(callback);
        }
    }

    removeEventListener(
        type: string,
        callback: (data: any, datastore: DataStore) => Promise<void>
    ): void {
        if (type in this.listeners) {
            removeArrayItem(this.listeners[type], callback);
        }
    }

    removeAllEventListener(): void {
        Object.keys(this.listeners).forEach(type => {
            this.listeners[type].splice(0, this.listeners[type].length);
        });
    }

    async runEventListener(
        type: string,
        data: any,
        datastore: DataStore
    ): Promise<void> {
        if (type in this.listeners) {
            for (let i = 0; i < this.listeners[type].length; i += 1) {
                await this.listeners[type][i](data, datastore);
            }
        }
    }
}
