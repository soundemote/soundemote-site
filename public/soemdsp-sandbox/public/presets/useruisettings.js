(function (settings) {
  window.nodeUiDevBundledDefaultSettings = settings;
  document.documentElement.dataset.nodeUiDevBundledDefaultSettings = JSON.stringify(settings);
})({
  "format": {
    "kind": "soemdsp-sandbox-user-ui-settings",
    "version": 3
  },
  "controls": {
    "mouseLightEnabled": true,
    "showOriginMarker": false,
    "modularShaderEnabled": false,
    "scopeBloomEnabled": false,
    "settingsHeaderTextSize": 100,
    "uiDevButtonTextSize": 50,
    "liveToggleTextSize": 76,
    "modularHeaderButtonBackground": 62,
    "tooltipTextSize": 14,
    "minimumGridBrightness": 0,
    "moduleLightSpread": 78,
    "textGlowLevel": 18,
    "moduleGridInset": 6,
    "moduleRoundness": 10,
    "gridColor": "#ffffff",
    "workspaceBackgroundColor": "#0d0d0d",
    "settingsHeaderTopRatio": 62,
    "settingsHeaderPadding": 2,
    "floatingWindowHeaderHeight": 30,
    "sliderDotSize": 4,
    "moduleTitleFont": "cascadia",
    "moduleTitleHeight": 26,
    "moduleTitleTextFill": 62,
    "moduleIoSectionHeight": 24,
    "moduleNodeSize": 57,
    "sliderWidth": 100,
    "sliderHeight": 28,
    "sliderLabelColor": "#cfdde5",
    "sliderValueColor": "#ffffff",
    "sliderUnitColor": "#7fc7d9",
    "sliderFillHoverColor": "#7fc7d9",
    "sliderFillHoverAlpha": 28,
    "nodeGlowSize": 50,
    "wirePatchPointSize": 36,
    "wireThickness": 19,
    "traceWireThickness": 1,
    "choiceSlideEmptyBorder": 2,
    "choiceDividerHeight": 35,
    "choiceSlideDebugBoxes": false,
    "bypassIconSize": 36,
    "bypassIconGlowSpread": 40,
    "bypassIconGlowColor": "#f25d5d",
    "bypassIconOnColor": "#f7b758",
    "bypassOnBackgroundColor": "#5c1818",
    "bypassOffBackgroundColor": "#000000",
    "moveSymbolSize": 60,
    "closeIconSize": 50,
    "settingsHeaderHighlights": false
  },
  "exposedControls": {
    "mouseLightEnabled": true,
    "showOriginMarker": false,
    "modularShaderEnabled": true,
    "scopeBloomEnabled": true,
    "settingsHeaderTextSize": false,
    "uiDevButtonTextSize": false,
    "liveToggleTextSize": true,
    "modularHeaderButtonBackground": true,
    "tooltipTextSize": true,
    "minimumGridBrightness": true,
    "moduleLightSpread": true,
    "textGlowLevel": true,
    "moduleGridInset": true,
    "moduleRoundness": true,
    "gridColor": true,
    "workspaceBackgroundColor": true,
    "settingsHeaderTopRatio": false,
    "settingsHeaderPadding": false,
    "floatingWindowHeaderHeight": true,
    "sliderDotSize": true,
    "moduleTitleFont": true,
    "moduleTitleHeight": true,
    "moduleTitleTextFill": true,
    "moduleIoSectionHeight": true,
    "moduleNodeSize": true,
    "sliderWidth": true,
    "sliderHeight": true,
    "sliderLabelColor": true,
    "sliderValueColor": true,
    "sliderUnitColor": true,
    "sliderFillHoverColor": true,
    "sliderFillHoverAlpha": true,
    "nodeGlowSize": true,
    "wirePatchPointSize": true,
    "wireThickness": true,
    "traceWireThickness": true,
    "choiceSlideEmptyBorder": false,
    "choiceDividerHeight": true,
    "choiceSlideDebugBoxes": false,
    "bypassIconSize": false,
    "bypassIconGlowSpread": false,
    "bypassIconGlowColor": false,
    "bypassIconOnColor": false,
    "bypassOnBackgroundColor": false,
    "bypassOffBackgroundColor": false,
    "moveSymbolSize": false,
    "closeIconSize": false,
    "settingsHeaderHighlights": false
  },
  "nodeColors": {
    "--node-module-fill": "#171a1f",
    "--node-module-stroke": "#f3f1ec",
    "--node-module-selected-stroke": "#e2a86d",
    "--node-module-drag-stroke": "#e2a86d",
    "--node-port-idle-fill": "#000000",
    "--node-port-idle-stroke": "#f3f1ec",
    "--node-port-hover-fill": "#f3f1ec",
    "--node-port-hover-stroke": "#f3f1ec",
    "--node-input-fill": "#7fc7d9",
    "--node-input-stroke": "#7fc7d9",
    "--node-output-fill": "#e2a86d",
    "--node-output-stroke": "#e2a86d",
    "--node-mod-input-fill": "#b184ff",
    "--node-mod-input-stroke": "#b184ff",
    "--node-param-output-fill": "#66e0a3",
    "--node-param-output-stroke": "#66e0a3"
  },
  "moduleDefaultOverrides": {},
  "view": {
    "gridVisible": false,
    "keyboardDebugInfoVisible": false,
    "moduleButtonsVisible": false,
    "moduleInterfaceControlsVisible": true,
    "moduleOscilloscopesVisible": true,
    "moduleSlidersVisible": true,
    "moduleScopeBackgroundColor": "#000000",
    "globalSmoothingSeconds": 1,
    "globalSmoothingManual": true,
    "moduleScopeDotCore1Enabled": true,
    "moduleScopeDotCore1Size": 1.94,
    "moduleScopeDotCore1Brightness": 33.5,
    "moduleScopeDotCore1Color": "#ffffff",
    "moduleScopeFramesPerSecond": 60,
    "moduleScopePointBudget": 4096,
    "moduleScopeLineThickness": 1,
    "moduleScopeDiscontinuitySkipSamples": 1,
    "macroKnobArcThickness": 7,
    "macroKnobArcGapBrightness": 0,
    "macroKnobSizeScale": 1,
    "macroKnobHitboxOutlineVisible": false,
    "macroKnobLabelPosition": "top",
    "macroKnobValuePosition": "bottom",
    "traceSettings": {
      "brightness": 0.92,
      "color": "#abcdef",
      "dot1Enabled": true,
      "dot1Size": 0.0175,
      "secondaryBrightness": 0.18,
      "secondaryColor": "#00ffaa",
      "secondaryEnabled": true,
      "secondarySize": 0.24,
      "secondaryLineThickness": 0.48,
      "cycles": 2,
      "lineThickness": 0.2,
      "padding": 0,
      "skipDiscontinuities": true,
      "sourceSync": false,
      "zoomSeconds": 0.05
    },
    "sliderLayout": "text-inside",
    "sliderAmountVisible": true,
    "sliderPositionVisible": true,
    "hideMouseWhileDragging": true,
    "moduleCatalogVisibility": {
      "audioInput": {
        "developer": true,
        "home": false
      },
      "codeblock": {
        "developer": true,
        "home": false
      },
      "scriptBox": {
        "developer": true,
        "home": false
      },
      "graph": {
        "developer": true,
        "home": false
      },
      "graph2": {
        "developer": true,
        "home": false
      },
      "groupInput": {
        "developer": true,
        "home": false
      },
      "groupOutput": {
        "developer": true,
        "home": false
      },
      "moduleGroup": {
        "developer": true,
        "home": false
      },
      "osc": {
        "developer": true,
        "home": false
      },
      "polyBlep": {
        "developer": true,
        "home": false
      },
      "blit": {
        "developer": true,
        "home": false
      },
      "sineWavetable": {
        "developer": true,
        "home": false
      },
      "archimedes": {
        "developer": true,
        "home": false
      },
      "aliasSine": {
        "developer": true,
        "home": false
      },
      "additiveOsc": {
        "developer": true,
        "home": false
      },
      "gpuAdditiveOsc": {
        "developer": true,
        "home": false
      },
      "ellipsoid": {
        "developer": true,
        "home": false
      },
      "spiral": {
        "developer": true,
        "home": false
      },
      "fractalSpiral": {
        "developer": true,
        "home": false
      },
      "logSpiral": {
        "developer": true,
        "home": false
      },
      "lorenzAttractor": {
        "developer": true,
        "home": false
      },
      "logisticMap": {
        "developer": true,
        "home": false
      },
      "antisaw": {
        "developer": true,
        "home": false
      },
      "bradley2a": {
        "developer": true,
        "home": false
      },
      "henonMap": {
        "developer": true,
        "home": false
      },
      "wirdoSpiral": {
        "developer": true,
        "home": false
      },
      "blubb": {
        "developer": true,
        "home": false
      },
      "mushroom": {
        "developer": true,
        "home": false
      },
      "boing": {
        "developer": true,
        "home": false
      },
      "torus": {
        "developer": true,
        "home": false
      },
      "keplerBouwkamp": {
        "developer": true,
        "home": false
      },
      "nyquistShannon": {
        "developer": true,
        "home": false
      },
      "radar": {
        "developer": true,
        "home": false
      },
      "chuaAttractor": {
        "developer": true,
        "home": false
      },
      "chordMemory": {
        "developer": true,
        "home": false
      },
      "turingMachine": {
        "developer": true,
        "home": false
      },
      "pitchQuantizer": {
        "developer": true,
        "home": false
      },
      "surgeOscillator": {
        "developer": true,
        "home": false
      },
      "dsfOscillator": {
        "developer": true,
        "home": false
      },
      "robinSupersaw": {
        "developer": true,
        "home": false
      },
      "hypersaw": {
        "developer": true,
        "home": false
      },
      "chordSequencer": {
        "developer": true,
        "home": false
      },
      "lutCell": {
        "developer": true,
        "home": false
      },
      "metallicRatio": {
        "developer": true,
        "home": false
      },
      "noiseGenerator": {
        "developer": true,
        "home": false
      },
      "randomWalk": {
        "developer": true,
        "home": false
      },
      "piSpigotNoise": {
        "developer": true,
        "home": false
      },
      "fractalBrownianNoise": {
        "developer": true,
        "home": false
      },
      "clock": {
        "developer": true,
        "home": false
      },
      "transport": {
        "developer": true,
        "home": false
      },
      "randomClock": {
        "developer": true,
        "home": false
      },
      "clockDivider": {
        "developer": true,
        "home": false
      },
      "delayedTrigger": {
        "developer": true,
        "home": false
      },
      "buttonEvents": {
        "developer": true,
        "home": false
      },
      "wireBreak": {
        "developer": true,
        "home": false
      },
      "wireConnect": {
        "developer": true,
        "home": false
      },
      "wireDisconnect": {
        "developer": true,
        "home": false
      },
      "windowReopen": {
        "developer": true,
        "home": false
      },
      "shootingStarTail": {
        "developer": true,
        "home": false
      },
      "shootingStarExplosion": {
        "developer": true,
        "home": false
      },
      "nextPatch": {
        "developer": true,
        "home": false
      },
      "previousPatch": {
        "developer": true,
        "home": false
      },
      "triggerCounter": {
        "developer": true,
        "home": false
      },
      "stepSequencer": {
        "developer": true,
        "home": false
      },
      "triggerDivider": {
        "developer": true,
        "home": false
      },
      "minMax": {
        "developer": true,
        "home": false
      },
      "comparator": {
        "developer": true,
        "home": false
      },
      "clapPlugin": {
        "developer": true,
        "home": false
      },
      "bitConverter": {
        "developer": true,
        "home": false
      },
      "gain": {
        "developer": true,
        "home": false
      },
      "bias": {
        "developer": true,
        "home": false
      },
      "softClipper": {
        "developer": true,
        "home": false
      },
      "rotate3dTo2d": {
        "developer": true,
        "home": false
      },
      "macroKnob": {
        "developer": true,
        "home": false
      },
      "bipolarKnob": {
        "developer": true,
        "home": false
      },
      "valueSlider": {
        "developer": true,
        "home": false
      },
      "passiveFilter": {
        "developer": true,
        "home": false
      },
      "papoulisFilter": {
        "developer": true,
        "home": false
      },
      "cookbookFilter": {
        "developer": true,
        "home": false
      },
      "rsmetFilter": {
        "developer": true,
        "home": false
      },
      "yellowjacketFilter": {
        "developer": true,
        "home": false
      },
      "superloveFilter": {
        "developer": true,
        "home": false
      },
      "chaoticPhaseLockingFilter": {
        "developer": true,
        "home": false
      },
      "resonatorFilter": {
        "developer": true,
        "home": false
      },
      "humanFilter": {
        "developer": true,
        "home": false
      },
      "pulseExplosion": {
        "developer": true,
        "home": false
      },
      "flowerChildFilter": {
        "developer": true,
        "home": false
      },
      "ladderFilter": {
        "developer": true,
        "home": false
      },
      "tb303Filter": {
        "developer": true,
        "home": false
      },
      "delayEffect": {
        "developer": true,
        "home": false
      },
      "pingPongDelay": {
        "developer": true,
        "home": false
      },
      "reverbEffect": {
        "developer": true,
        "home": false
      },
      "pll": {
        "developer": true,
        "home": false
      },
      "helmholtzPitch": {
        "developer": true,
        "home": false
      },
      "slewLimiter": {
        "developer": true,
        "home": false
      },
      "sampleHold": {
        "developer": true,
        "home": false
      },
      "midiOut": {
        "developer": true,
        "home": false
      },
      "midiNotePitch": {
        "developer": true,
        "home": false
      },
      "keyboardController": {
        "developer": true,
        "home": false
      },
      "samplePlayer": {
        "developer": true,
        "home": false
      },
      "sampleLooper": {
        "developer": true,
        "home": false
      },
      "phosphillator": {
        "developer": true,
        "home": false
      },
      "audioPlayer": {
        "developer": true,
        "home": false
      },
      "macroControls": {
        "developer": true,
        "home": false
      },
      "pitchModWheel": {
        "developer": true,
        "home": false
      },
      "expAdsr": {
        "developer": true,
        "home": false
      },
      "linearEnvelope": {
        "developer": true,
        "home": false
      },
      "pluckEnvelope": {
        "developer": true,
        "home": false
      },
      "vactrolEnvelopeSeries": {
        "developer": true,
        "home": false
      },
      "vactrolEnvelopeCustom": {
        "developer": true,
        "home": false
      },
      "impulseButton": {
        "developer": true,
        "home": false
      },
      "flowerChildEnvelopeFollower": {
        "developer": true,
        "home": false
      },
      "sandboxVisuals": {
        "developer": true,
        "home": false
      },
      "screenSpaceShader": {
        "developer": true,
        "home": false
      },
      "bloomGlow": {
        "developer": true,
        "home": false
      },
      "rgbaHsla": {
        "developer": true,
        "home": false
      },
      "chromaColor": {
        "developer": true,
        "home": false
      },
      "image": {
        "developer": true,
        "home": false
      },
      "canvas": {
        "developer": true,
        "home": false
      },
      "visualOscilloscope": {
        "developer": true,
        "home": false
      },
      "traceDisplay": {
        "developer": true,
        "home": false
      },
      "dotOscilloscope": {
        "developer": true,
        "home": false
      },
      "oscilloscopeBank": {
        "developer": true,
        "home": false
      },
      "videoscope": {
        "developer": true,
        "home": false
      },
      "valueOscilloscope": {
        "developer": true,
        "home": false
      },
      "numberReadout": {
        "developer": true,
        "home": false
      },
      "lineBurnOscilloscope": {
        "developer": true,
        "home": false
      },
      "scope2d": {
        "developer": true,
        "home": false
      },
      "scope2dTrace": {
        "developer": true,
        "home": false
      },
      "badvalMonitor": {
        "developer": true,
        "home": false
      },
      "speakerProtection": {
        "developer": true,
        "home": false
      },
      "textBox": {
        "developer": true,
        "home": false
      },
      "animatedTextBox": {
        "developer": true,
        "home": false
      },
      "output": {
        "developer": true,
        "home": false
      },
      "led": {
        "developer": true,
        "home": false
      },
      "stepGrid": {
        "developer": true,
        "home": false
      }
    },
    "sceneContextWindowSize": {
      "width": 143
    },
    "moduleActionWindowSize": {
      "width": 188,
      "height": 474
    },
    "workspaceWindowStatesVersion": 1,
    "workspaceWindowStates": {
      "commandCenter": {
        "open": false,
        "position": {
          "left": 261,
          "top": 230
        }
      },
      "moduleActions": {
        "open": false
      },
      "metaparameters": {
        "open": false
      },
      "oscilloscopeSettings": {
        "open": false
      },
      "patchExplorer": {
        "open": false,
        "position": {
          "left": 804,
          "top": 238
        }
      },
      "moduleBrowser": {
        "open": false,
        "position": {
          "left": 67,
          "top": 228
        },
        "size": {
          "width": 191,
          "height": 514
        }
      },
      "visibilityMenu": {
        "open": false,
        "position": {
          "left": 483,
          "top": 153
        }
      },
      "uiSettings": {
        "open": false,
        "position": {
          "left": 813,
          "top": 172
        }
      },
      "uiDev": {
        "open": false,
        "position": {
          "left": 0,
          "top": 0
        }
      },
      "traceDisplaySettings": {
        "open": false,
        "targetNode": "traceDisplay-3"
      },
      "standaloneMidiKeyboard": {
        "open": false
      },
      "tooltipWindow": {
        "open": false,
        "position": {
          "left": 287,
          "top": 698
        }
      }
    },
    "sharedInspectorActive": "",
    "sharedInspectorWindowState": {},
    "workspaceView": {
      "pan": {
        "x": 184.01999999999998,
        "y": 204.64000000000001
      },
      "zoom": 1.1878873465372088
    },
    "moduleStoreDepartment": "",
    "savedPatchBankIndex": 0,
    "savedPatchBankName": "chaos",
    "savedPatchGridColumns": 3,
    "savedPatchExplorerView": "banks",
    "workingPatch": null,
    "currentSavedPatchFilename": "bank000-program000-lorenz-demonstration-chaos--lorenz--attractor--strange.json",
    "patchDirtyState": "untouched"
  }
});
