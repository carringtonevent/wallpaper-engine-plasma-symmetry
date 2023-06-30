import * as BABYLON from 'babylonjs'
import { wallpaperEngineEventsAbstractionLayer } from '../wallpaper_engine_api/wallpaper_engine_events_abstraction_layer'

const canvas = document.getElementById('game') as HTMLCanvasElement
const engine = new BABYLON.Engine(canvas, true, {
  preserveDrawingBuffer: true,
  stencil: true,
})

const scene = new BABYLON.Scene(engine, {
  useGeometryUniqueIdsMap: true,
  useMaterialMeshMap: true,
  useClonedMeshMap: true,
})
scene.autoClear = false
scene.skipFrustumClipping = true
scene.autoClearDepthAndStencil = false

const camera = new BABYLON.UniversalCamera('camera', BABYLON.Vector3.Zero(), scene)
const shader = new BABYLON.PostProcess(
  'shader',
  './assets/shaders/plasma-symmetry',
  [
    'iResolution',
    'iTime',
    'iMouse',
    'foldSymmetryIterations',
    'lineModulationIterations',
    'lineXModulationStrength',
    'lineYModulationStrength',
    'lineXModulationSpeed',
    'lineYModulationSpeed',
    'mouseFollowModifier',
    'rotationSpeed',
    'layers',
    'scaleSpeed',
    'color',
    'highlightSize',
    'highlightSpeed'
  ],
  null,
  1.0,
  camera,
)

// resolution
const iResolution = new BABYLON.Vector3(canvas.width, canvas.height, 0)
window.addEventListener('resize', _ => {
  engine.resize()
  iResolution.set(canvas.width, canvas.height, 0)
})

// mouse
const iMouse = new BABYLON.Vector4(window.innerWidth / 2, window.innerHeight / 2, 0, 0)
const iMouseSmooth = iMouse.clone()
window.addEventListener('pointermove', e => iMouse.set(e.clientX, canvas.height - e.clientY, 0, 0))

// mouse follow strength
let mouseFollowStrength = 3
wallpaperEngineEventsAbstractionLayer.addListener('mousefollowstrength', strength => mouseFollowStrength = strength)

// mouse follow modifier
let mouseFollowModifier = 0.2
let mouseFollowModifierSmooth = mouseFollowModifier
wallpaperEngineEventsAbstractionLayer.addListener('mousefollowmodifier', modifier => mouseFollowModifier = modifier * 0.01)

// fold symmetry iterations
let foldSymmetryIterations = 3
wallpaperEngineEventsAbstractionLayer.addListener('foldsymmetryiterations', iterations => foldSymmetryIterations = iterations)

// line modulation iterations
let lineModulationIterations = 9
wallpaperEngineEventsAbstractionLayer.addListener('linemodulationiterations', iterations => lineModulationIterations = iterations)

// line x modulation strength
let lineXModulationStrength = 1.5
wallpaperEngineEventsAbstractionLayer.addListener('linexmodulationstrength', strength => lineXModulationStrength = strength * 0.01)

// line y modulation strength
let lineYModulationStrength = 2.5
wallpaperEngineEventsAbstractionLayer.addListener('lineymodulationstrength', strength => lineYModulationStrength = strength * 0.01)

// line x modulation speed
let lineXModulationSpeed = 0.3
wallpaperEngineEventsAbstractionLayer.addListener('linexmodulationspeed', speed => lineXModulationSpeed = speed * 0.01)

// line y modulation speed
let lineYModulationSpeed = 0.2
wallpaperEngineEventsAbstractionLayer.addListener('lineymodulationspeed', speed => lineYModulationSpeed = speed * 0.01)

// rotation speed
let rotationSpeed = 0.1
wallpaperEngineEventsAbstractionLayer.addListener('rotationspeed', speed => rotationSpeed = speed * 0.01)

// layers
let layers = 6
wallpaperEngineEventsAbstractionLayer.addListener('layers', l => layers = l)

// scale speed
let scaleSpeed = 0.01
wallpaperEngineEventsAbstractionLayer.addListener('scalespeed', speed => scaleSpeed = speed * 0.01)

// color
const color = new BABYLON.Vector3(0.7, 0.3, 0.1)
const colorSmooth = color.clone()
wallpaperEngineEventsAbstractionLayer.addListener('color', c => color.set(...c.split(' ').map(float => parseFloat(float)) as [number, number, number]))

// highlight size
let highlightSize = 0.1
let highlightSizeSmooth = highlightSize
wallpaperEngineEventsAbstractionLayer.addListener('highlightsize', size => highlightSize = size * 0.01)

// highlight speed
let highlightSpeed = 0.2
wallpaperEngineEventsAbstractionLayer.addListener('highlightspeed', speed => highlightSpeed = speed * 0.01)

// smooth operations
const settingsTransitionStrength = 10
scene.onBeforeRenderObservable.add(() => {
  // delta
  const delta = engine.getDeltaTime()
  // smoothing mouse
  iMouseSmooth.x += (iMouse.x - iMouseSmooth.x) * mouseFollowStrength * delta * 0.001
  iMouseSmooth.y += (iMouse.y - iMouseSmooth.y) * mouseFollowStrength * delta * 0.001
  // smoothing applied options
  mouseFollowModifierSmooth += (mouseFollowModifier - mouseFollowModifierSmooth) * settingsTransitionStrength * delta * 0.001
  colorSmooth.x += (color.x - colorSmooth.x) * settingsTransitionStrength * delta * 0.001
  colorSmooth.y += (color.y - colorSmooth.y) * settingsTransitionStrength * delta * 0.001
  colorSmooth.z += (color.z - colorSmooth.z) * settingsTransitionStrength * delta * 0.001
  highlightSizeSmooth += (highlightSize - highlightSizeSmooth) * settingsTransitionStrength * delta * 0.001
})

// uniform apply per frame
shader.onApply = effect => {
  effect.setVector3('iResolution', iResolution)
  effect.setFloat('iTime', window.performance.now() * 0.001)
  effect.setVector4('iMouse', iMouseSmooth)
  effect.setFloat('foldSymmetryIterations', foldSymmetryIterations)
  effect.setFloat('lineModulationIterations', lineModulationIterations)
  effect.setFloat('lineXModulationStrength', lineXModulationStrength)
  effect.setFloat('lineYModulationStrength', lineYModulationStrength)
  effect.setFloat('lineXModulationSpeed', lineXModulationSpeed)
  effect.setFloat('lineYModulationSpeed', lineYModulationSpeed)
  effect.setFloat('mouseFollowModifier', mouseFollowModifierSmooth)
  effect.setFloat('rotationSpeed', rotationSpeed)
  effect.setFloat('layers', layers)
  effect.setFloat('scaleSpeed', scaleSpeed)
  effect.setVector3('color', colorSmooth)
  effect.setFloat('highlightSize', highlightSizeSmooth)
  effect.setFloat('highlightSpeed', highlightSpeed)
}

// Wallpaper engine FPS
let fps = 0
let fpsThreshold = 0
let supportFpsSettings = true

wallpaperEngineEventsAbstractionLayer.addListener('supportfpssettings', newSupportFpsSettings => supportFpsSettings = newSupportFpsSettings)
wallpaperEngineEventsAbstractionLayer.addListener('fps', newFps => fps = newFps)

// Render Loop
engine.runRenderLoop(() => {
  // <comment this to test in browser>
  if (supportFpsSettings) {
    if (fps > 0) {
      fpsThreshold += engine.getDeltaTime() / 1000
  
      if (fpsThreshold < 1 / fps) return
  
      fpsThreshold -= 1 / fps
    } else {
      return
    }
  }
  // </comment this to test in browser>

  scene.render()
})

// <uncomment this to debug>
// scene.debugLayer.show({
//   showExplorer: true,
//   showInspector: true,
//   overlay: true,
//   inspectorURL: './assets/js/inspector.js'
// })
// </uncomment this to debug>
