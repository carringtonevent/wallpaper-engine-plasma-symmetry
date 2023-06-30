import { wallpaperEngineEventsAbstractionLayer } from '../wallpaper_engine_api/wallpaper_engine_events_abstraction_layer'

let showed = false

wallpaperEngineEventsAbstractionLayer.addListener('showwarninghint', show => {
  if (showed) return

  showed = true

  if (!show) return

  const warningDialog = document.createElement('div')
  warningDialog.classList.add('warning-dialog')

  warningDialog.innerHTML = `
    <h1 class="header">Warning</h1>
    <div class="text-box">
      <p>This wallpaper can cause epilepsy in some people.</p>
      <p>Even if you are not at risk, please do not overdo it with the settings.</p>
      <p>Otherwise you may get slight nausea like I did when I created this wallpaper.</p>
      <p class="extra-padding">For a good preconfigured starting point you can copy the JSON files from my Github repository and paste them into the wallpaper engine editor (link in the wallpaper description).</p>
    </div>
  `

  document.body.appendChild(warningDialog)
  window.setTimeout(
    () => warningDialog.remove(),
    parseFloat(window.getComputedStyle(warningDialog).animationDuration) * 1000
  )
})
