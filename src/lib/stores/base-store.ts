import { Emitter, Disposable } from 'event-kit'

export class TypedBaseStore<T> {
  protected readonly emitter = new Emitter()

  protected emitUpdate(data: T) {
    this.emitter.emit('did-update', data)
  }

  protected emitError(error: Error) {
    this.emitter.emit('did-error', error)
  }

  public onDidUpdate(fn: (data: T) => void): Disposable {
    return this.emitter.on('did-update', fn)
  }

  public onDidError(fn: (e: Error) => void): Disposable {
    return this.emitter.on('did-error', fn)
  }
}