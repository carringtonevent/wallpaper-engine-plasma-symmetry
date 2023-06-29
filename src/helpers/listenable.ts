export type UnknownListener = (...params: any[]) => any

export class Listenable<T extends {[K in keyof T]: UnknownListener}> {
  private static removeValue<T>(valueArray: T[], value: T): void {
    const index: number = valueArray.indexOf(value)
    if (index > -1) {
      valueArray.splice(index, 1)
    }
  }

  private static addValue<T>(valueArray: T[], value: T): void {
    Listenable.removeValue(valueArray, value)
    valueArray.push(value)
  }

  private static removeMultipleValues<T>(valueArray: T[], ...values: T[]): void {
    for (const value of values) {
      Listenable.removeValue(valueArray, value)
    }
  }

  private static addMultipleValues<T>(valueArray: T[], ...values: T[]): void {
    for (const value of values) {
      Listenable.addValue(valueArray, value)
    }
  }

  private static activateListeners<T extends UnknownListener>(listeners: T[], ...params: Parameters<T>): void {
    for (const listener of listeners) {
      listener(...params)
    }
  }

  private listenerCollection?: {[K in keyof T]?: T[K][]}

  protected activateListeners<K extends keyof T>(listenerKey: K, ...params: Parameters<T[K]>): void {
    if (this.listenerCollection && this.listenerCollection[listenerKey]) {
      Listenable.activateListeners(this.listenerCollection[listenerKey] as T[K][], ...params)
    }
  }

  protected removeAllListeners(): void {
    if (!this.listenerCollection) {
      return
    }

    for (const listenerKey in this.listenerCollection) {
      (this.listenerCollection[listenerKey] as T[keyof T][]).length = 0
      delete this.listenerCollection[listenerKey]
    }

    delete this.listenerCollection
  }

  public addListener<K extends keyof T>(listenerKey: K, ...listeners: T[K][]): void {
    if (!this.listenerCollection) {
      this.listenerCollection = {}
    }

    if (!this.listenerCollection[listenerKey]) {
      this.listenerCollection[listenerKey] = []
    }

    Listenable.addMultipleValues(this.listenerCollection[listenerKey] as T[K][], ...listeners)
  }

  public removeListener<K extends keyof T>(listenerKey: K, ...listeners: T[K][]): void {
    if (this.listenerCollection && this.listenerCollection[listenerKey]) {
      Listenable.removeMultipleValues(this.listenerCollection[listenerKey] as T[K][], ...listeners)
      if (!(this.listenerCollection[listenerKey] as T[K][]).length) {
        delete this.listenerCollection[listenerKey]
        if (!Object.keys(this.listenerCollection).length) {
          delete this.listenerCollection
        }
      }
    }
  }
}
