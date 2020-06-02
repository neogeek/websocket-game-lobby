import { removeArrayItem } from './utils';

import { IDataStore, IListeners } from './types';

export default class Listeners<T> implements IListeners<T> {
    listeners: any = {};

    addEventListener(
        type: T,
        callback: (data: any, datastore: IDataStore) => Promise<void>
    ): void {
        if (!this.listeners[type]) {
            this.listeners[type] = [];
        }
        if (typeof callback === 'function') {
            this.listeners[type].push(callback);
        }
    }

    removeEventListener(
        type: T,
        callback: (data: any, datastore: IDataStore) => Promise<void>
    ): void {
        if (this.listeners[type]) {
            removeArrayItem(this.listeners[type], callback);
        }
    }

    removeAllEventListeners(): void {
        Object.keys(this.listeners).forEach(type => {
            this.listeners[type].splice(0, this.listeners[type].length);
        });
    }

    async runEventListeners(
        type: T,
        data: any,
        datastore: IDataStore
    ): Promise<void> {
        if (this.listeners[type]) {
            for (let i = 0; i < this.listeners[type].length; i += 1) {
                await this.listeners[type][i](data, datastore);
            }
        }
    }
}
