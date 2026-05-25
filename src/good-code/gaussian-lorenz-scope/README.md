# Gaussian Lorenz Scope

Keeper implementation for the scratch oscilloscope drawing method.

- Full-page square WebGL canvas.
- Lorenz attractor test signal.
- Gaussian dot shader for the beam.
- Screen burn via preserved drawing buffer plus alpha fade.
- Screen-space connector stamps between adjacent Lorenz samples.
- Click-hold controls for width, frequency, and burn.

Use this as the reference when building future oscilloscope widgets or extracting a reusable drop-in scope component.
