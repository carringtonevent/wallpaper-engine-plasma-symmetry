import { Listenable } from '../helpers/listenable'

const possibleEvents = {
  // boolean
  supportfpssettings: (_: boolean) => {},
  // int (0 - 10) default: 3
  mousefollowstrength: (_: number) => {},
  // int (-150 - 150) default: 150
  mousefollowmodifier: (_: number) => {},
  // int (0 - 15) default: 3
  foldsymmetryiterations: (_: number) => {},
  // int (0 - 9) default: 9
  linemodulationiterations: (_: number) => {},
  // int (0 - 300) default: 150
  linexmodulationstrength: (_: number) => {},
  // int (0 - 300) default: 250
  lineymodulationstrength: (_: number) => {},
  // int (-200 - 200) default: 30
  linexmodulationspeed: (_: number) => {},
  // int (-200 - 200) default: 20
  lineymodulationspeed: (_: number) => {},
  // int (-200 - 200) default: 10
  rotationspeed: (_: number) => {},
  // int (1 - 10) default: 6
  layers: (_: number) => {},
  // int (-50 - 50) default: 1
  scalespeed: (_: number) => {},
  // '0.70 0.30 0.10'
  color: (_: String) => {},
  // int (3 - 10) default: 10
  highlightsize: (_: number) => {},
  // int (-100 - 100) default: 20
  highlightspeed: (_: number) => {},
}

type UserPropertyEvents = typeof possibleEvents

interface GeneralPropertyEvents {
  fps: (fps: number) => void
}

type UserProperties = {
  [K in keyof UserPropertyEvents]?: {
    value: Parameters<UserPropertyEvents[K]>[0]
  }
}

interface GeneralProperties {
  fps?: number
}

export type AllEvents = UserPropertyEvents & GeneralPropertyEvents

type AllEventsCache = {
  [K in keyof AllEvents]?: Parameters<AllEvents[K]>[0]
}

declare global {
  interface Window {
    wallpaperPropertyListener?: {
      applyUserProperties: (properties: UserProperties) => void
      applyGeneralProperties: (properties: GeneralProperties) => void
    }
  }
}

class WallpaperEngineEventsAbstractionLayer extends Listenable<AllEvents> {
  private readonly _allEventsCache: AllEventsCache = {}

  constructor() {
    super()

    window.wallpaperPropertyListener = {
      applyUserProperties: (properties: UserProperties) => {
        const eventsActivationCache: AllEventsCache = {}

        for (const keyString in possibleEvents) {
          const key = keyString as keyof UserPropertyEvents
          const property = properties[key]
          if (property && property.value != this._allEventsCache[key]) {
            this._allEventsCache[key] = eventsActivationCache[key] = property.value as any
          }
        }

        for (const keyString in eventsActivationCache) {
          const key = keyString as keyof AllEventsCache
          this.activateListeners(key, eventsActivationCache[key]!)
        }
      },
      applyGeneralProperties: (properties: GeneralProperties) => {
        const eventsActivationCache: AllEventsCache = {}

        if (properties.fps != undefined && properties.fps != this._allEventsCache.fps) {
          this._allEventsCache.fps = eventsActivationCache.fps = properties.fps
        }

        for (const keyString in eventsActivationCache) {
          const key = keyString as keyof AllEventsCache
          this.activateListeners(key, eventsActivationCache[key]!)
        }
      },
    }
  }

  public getLastEventValueOf<T extends keyof AllEventsCache>(event: T): AllEventsCache[T] {
    return this._allEventsCache[event]
  }
}

export const wallpaperEngineEventsAbstractionLayer = new WallpaperEngineEventsAbstractionLayer()
