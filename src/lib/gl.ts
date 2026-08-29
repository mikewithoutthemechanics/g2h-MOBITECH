/**
 * Hand-rolled WebGL background.
 *
 * Renders a domain-warped fBm field that reads as current moving through a
 * grid: deep void, ember filaments, amber flare where the pointer sits. No
 * three.js — a single full-screen triangle and one fragment shader.
 *
 * Guarantees:
 *  - returns null when WebGL is unavailable so callers can fall back to CSS
 *  - pauses when the tab is hidden or the canvas leaves the viewport
 *  - renders exactly one static frame under prefers-reduced-motion
 *  - survives (and recovers from) WebGL context loss
 */

const VERT = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2  u_res;
uniform float u_time;
uniform vec2  u_pointer;
uniform float u_energy;
uniform float u_seed;

float hash(vec2 p) {
  p = fract(p * vec2(233.34, 851.73));
  p += dot(p, p + 23.45);
  return fract(p.x * p.y);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(1.62, 1.18, -1.18, 1.62);
  for (int i = 0; i < 5; i++) {
    v += a * vnoise(p);
    p = m * p;
    a *= 0.52;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float aspect = u_res.x / max(u_res.y, 1.0);
  vec2 p = vec2(uv.x * aspect, uv.y);

  float t = u_time * 0.05 + u_seed;

  vec2 q = vec2(
    fbm(p * 1.75 + vec2(0.0, t)),
    fbm(p * 1.75 + vec2(4.3, 1.7 - t))
  );
  vec2 r = vec2(
    fbm(p * 2.1 + 2.3 * q + vec2(1.7, 9.2) + 0.42 * t),
    fbm(p * 2.1 + 2.3 * q + vec2(8.3, 2.8) - 0.36 * t)
  );
  float f = fbm(p * 2.35 + 2.0 * r);

  vec2 pt = vec2(u_pointer.x * aspect, u_pointer.y);
  float charge = exp(-distance(p, pt) * 2.5) * (0.5 + 0.5 * u_energy);

  float band = sin((p.y * 5.5 + f * 5.5 - u_time * 0.3) * 3.14159265);
  float filament = 1.0 - pow(abs(band), 6.0);
  filament *= smoothstep(0.26, 0.86, f);

  float glow = f * f * 1.28 + charge * 0.85 + filament * (0.18 + 0.34 * u_energy);

  vec3 cVoid  = vec3(0.031, 0.031, 0.039);
  vec3 cDeep  = vec3(0.086, 0.058, 0.105);
  vec3 cEmber = vec3(0.560, 0.185, 0.070);
  vec3 cAmber = vec3(1.000, 0.702, 0.180);

  vec3 col = mix(cVoid, cDeep, smoothstep(0.04, 0.55, glow));
  col = mix(col, cEmber, smoothstep(0.42, 0.98, glow) * (0.5 + 0.5 * u_energy));
  col = mix(col, cAmber, smoothstep(0.82, 1.38, glow) * (0.32 + 0.5 * u_energy));

  vec2 g = abs(fract(p * vec2(17.0, 10.0)) - 0.5);
  float grid = 1.0 - smoothstep(0.0, 0.036, min(g.x, g.y));
  col += grid * 0.032 * (0.3 + charge * 1.4);

  col += vec3(0.105, 0.055, 0.010) * pow(1.0 - uv.y, 3.0) * 0.85;

  vec2 vc = uv - 0.5;
  col *= 1.0 - dot(vc, vc) * 0.92;

  float grain = hash(gl_FragCoord.xy + fract(u_time) * 91.7);
  col += (grain - 0.5) * 0.042;

  gl_FragColor = vec4(max(col, 0.0), 1.0);
}
`

export interface ShaderHandle {
  destroy: () => void
  setEnergy: (value: number) => void
}

interface Options {
  seed?: number
  energy?: number
  reducedMotion?: boolean
  maxDpr?: number
}

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader)
    return null
  }
  return shader
}

export function mountShader(canvas: HTMLCanvasElement, options: Options = {}): ShaderHandle | null {
  const { seed = 0, energy = 0.35, reducedMotion = false, maxDpr = 1.75 } = options

  let gl: WebGLRenderingContext | null = null
  try {
    gl = (canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'low-power',
      preserveDrawingBuffer: false,
    }) ||
      canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null
  } catch {
    return null
  }
  if (!gl) return null

  const vs = compile(gl, gl.VERTEX_SHADER, VERT)
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG)
  if (!vs || !fs) return null

  const program = gl.createProgram()
  if (!program) return null
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null
  gl.useProgram(program)

  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const aPos = gl.getAttribLocation(program, 'a_pos')
  gl.enableVertexAttribArray(aPos)
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

  const uRes = gl.getUniformLocation(program, 'u_res')
  const uTime = gl.getUniformLocation(program, 'u_time')
  const uPointer = gl.getUniformLocation(program, 'u_pointer')
  const uEnergy = gl.getUniformLocation(program, 'u_energy')
  const uSeed = gl.getUniformLocation(program, 'u_seed')

  gl.uniform1f(uSeed, seed)

  let width = 0
  let height = 0
  let energyTarget = energy
  let energyCurrent = energy
  const pointer = { x: 0.5, y: 0.62 }
  const pointerTarget = { x: 0.5, y: 0.62 }

  let raf = 0
  let running = false
  let visible = true
  let onScreen = true
  let lost = false
  const start = performance.now()

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr)
    const rect = canvas.getBoundingClientRect()
    const w = Math.max(1, Math.round(rect.width * dpr))
    const h = Math.max(1, Math.round(rect.height * dpr))
    if (w === width && h === height) return
    width = w
    height = h
    canvas.width = w
    canvas.height = h
    gl!.viewport(0, 0, w, h)
    gl!.uniform2f(uRes, w, h)
  }

  const draw = (time: number) => {
    if (lost || !gl) return
    energyCurrent += (energyTarget - energyCurrent) * 0.06
    pointer.x += (pointerTarget.x - pointer.x) * 0.055
    pointer.y += (pointerTarget.y - pointer.y) * 0.055
    gl.uniform1f(uTime, time)
    gl.uniform1f(uEnergy, energyCurrent)
    gl.uniform2f(uPointer, pointer.x, pointer.y)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }

  const loop = () => {
    if (!running) return
    resize()
    draw((performance.now() - start) / 1000)
    raf = requestAnimationFrame(loop)
  }

  const play = () => {
    if (running || reducedMotion || lost) return
    running = true
    raf = requestAnimationFrame(loop)
  }

  const pause = () => {
    running = false
    cancelAnimationFrame(raf)
  }

  const sync = () => {
    if (visible && onScreen) play()
    else pause()
  }

  const onPointerMove = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect()
    if (rect.height === 0) return
    pointerTarget.x = (event.clientX - rect.left) / rect.width
    pointerTarget.y = 1 - (event.clientY - rect.top) / rect.height
  }

  const onVisibility = () => {
    visible = document.visibilityState === 'visible'
    sync()
  }

  const onContextLost = (event: Event) => {
    event.preventDefault()
    lost = true
    pause()
  }

  const observer =
    typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver(
          (entries) => {
            onScreen = entries.some((entry) => entry.isIntersecting)
            sync()
          },
          { rootMargin: '120px' },
        )
      : null
  observer?.observe(canvas)

  window.addEventListener('pointermove', onPointerMove, { passive: true })
  document.addEventListener('visibilitychange', onVisibility)
  canvas.addEventListener('webglcontextlost', onContextLost)

  resize()
  if (reducedMotion) {
    // One deterministic frame: full composition, zero motion.
    energyCurrent = energyTarget
    draw(11.5)
  } else {
    play()
  }

  return {
    destroy() {
      pause()
      observer?.disconnect()
      window.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('visibilitychange', onVisibility)
      canvas.removeEventListener('webglcontextlost', onContextLost)
      if (gl) {
        gl.deleteProgram(program)
        gl.deleteShader(vs)
        gl.deleteShader(fs)
        gl.deleteBuffer(buffer)
        const ext = gl.getExtension('WEBGL_lose_context')
        ext?.loseContext()
      }
      gl = null
    },
    setEnergy(value: number) {
      energyTarget = Math.max(0, Math.min(1, value))
      if (reducedMotion && !lost && gl) {
        energyCurrent = energyTarget
        draw(11.5)
      }
    },
  }
}
