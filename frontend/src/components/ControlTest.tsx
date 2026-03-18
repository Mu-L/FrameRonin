import { useCallback, useEffect, useRef, useState } from 'react'
import { Button, Switch, Typography, Upload } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import type { UploadFile } from 'antd'
import { useLanguage } from '../i18n/context'
import StashDropZone from './StashDropZone'

const { Dragger } = Upload
const { Text } = Typography

interface ControlTestProps {
  onBack?: () => void
}

const IMAGE_ACCEPT = ['.png', '.jpg', '.jpeg', '.webp']
const AUDIO_ACCEPT = ['.mp3', '.wav', '.ogg', '.m4a', '.aac']
const DEFAULT_BG_URL = `${import.meta.env.BASE_URL}debg.png`
const DEFAULT_CHAR_URL = `${import.meta.env.BASE_URL}decha.png`
const DEFAULT_BGM_URL = `${import.meta.env.BASE_URL}defultbgm.ogg`

/** 帧区域定义：id -> {x, y, w, h}，对应 GDScript Rect2i */
const REGIONS: Record<string, { x: number; y: number; w: number; h: number }> = {
  uk1xb: { x: 0, y: 168, w: 42, h: 42 },
  m5je3: { x: 42, y: 168, w: 42, h: 42 },
  '2ij6o': { x: 84, y: 168, w: 42, h: 42 },
  kmxfq: { x: 126, y: 168, w: 42, h: 42 },
  cpoga: { x: 168, y: 168, w: 42, h: 42 },
  '02845': { x: 210, y: 168, w: 42, h: 42 },
  hg6s0: { x: 0, y: 210, w: 42, h: 42 },
  kwjof: { x: 42, y: 210, w: 42, h: 42 },
  '5u6fn': { x: 126, y: 84, w: 21, h: 42 },
  t2na7: { x: 147, y: 84, w: 21, h: 42 },
  '3kx8u': { x: 168, y: 84, w: 21, h: 42 },
  y5pas: { x: 189, y: 84, w: 21, h: 42 },
  '8pc1g': { x: 210, y: 84, w: 21, h: 42 },
  '3cyhk': { x: 231, y: 84, w: 21, h: 42 },
  w25ly: { x: 168, y: 126, w: 21, h: 42 },
  rdd8s: { x: 189, y: 210, w: 63, h: 42 },
  '72hcl': { x: 210, y: 126, w: 21, h: 42 },
  rydce: { x: 189, y: 126, w: 21, h: 42 },
  '1et3y': { x: 231, y: 126, w: 21, h: 42 },
  uwgfa: { x: 147, y: 210, w: 21, h: 42 },
  y65iy: { x: 168, y: 210, w: 21, h: 42 },
  '8al5y': { x: 105, y: 210, w: 21, h: 42 },
  '3js2j': { x: 126, y: 210, w: 21, h: 42 },
  bbcvv: { x: 0, y: 126, w: 28, h: 42 },
  foxtp: { x: 28, y: 126, w: 28, h: 42 },
  aw8dg: { x: 56, y: 126, w: 28, h: 42 },
  evrtr: { x: 84, y: 126, w: 28, h: 42 },
  pyoh8: { x: 112, y: 126, w: 28, h: 42 },
  t4rff: { x: 140, y: 126, w: 28, h: 42 },
  koy62: { x: 0, y: 0, w: 21, h: 42 },
  '3ygc0': { x: 21, y: 0, w: 21, h: 42 },
  yfrrb: { x: 42, y: 0, w: 21, h: 42 },
  '2enbr': { x: 63, y: 0, w: 21, h: 42 },
  s2yql: { x: 84, y: 0, w: 21, h: 42 },
  idc64: { x: 105, y: 0, w: 21, h: 42 },
  '8mwul': { x: 0, y: 42, w: 21, h: 42 },
  snwwj: { x: 21, y: 42, w: 21, h: 42 },
  ynglr: { x: 42, y: 42, w: 21, h: 42 },
  p3oo0: { x: 63, y: 42, w: 21, h: 42 },
  pfwvy: { x: 84, y: 42, w: 21, h: 42 },
  tvkvf: { x: 105, y: 42, w: 21, h: 42 },
  '20ynl': { x: 84, y: 210, w: 21, h: 42 },
  '3c66l': { x: 0, y: 84, w: 21, h: 42 },
  wq5ia: { x: 21, y: 84, w: 21, h: 42 },
  '11gwb': { x: 42, y: 84, w: 21, h: 42 },
  iitav: { x: 63, y: 84, w: 21, h: 42 },
  '360a7': { x: 84, y: 84, w: 21, h: 42 },
  ffd0g: { x: 105, y: 84, w: 21, h: 42 },
  ahlcx: { x: 126, y: 0, w: 21, h: 42 },
  '4i3vm': { x: 147, y: 0, w: 21, h: 42 },
  '0qwcd': { x: 168, y: 0, w: 21, h: 42 },
  y1030: { x: 189, y: 0, w: 21, h: 42 },
  '3sl87': { x: 210, y: 0, w: 21, h: 42 },
  '8kwsb': { x: 231, y: 0, w: 21, h: 42 },
  umveo: { x: 126, y: 42, w: 21, h: 42 },
  v6ado: { x: 147, y: 42, w: 21, h: 42 },
  syfy0: { x: 168, y: 42, w: 21, h: 42 },
  us0w8: { x: 189, y: 42, w: 21, h: 42 },
  pf2m2: { x: 210, y: 42, w: 21, h: 42 },
  '876dv': { x: 231, y: 42, w: 21, h: 42 },
}

/** 动画定义 */
const ANIMS: { name: string; frames: string[]; loop: boolean; speed: number }[] = [
  { name: 'attractL', frames: ['uk1xb', 'm5je3', '2ij6o', 'kmxfq', 'cpoga', '02845', 'hg6s0', 'kwjof'], loop: false, speed: 5 },
  { name: 'climb', frames: ['5u6fn', 't2na7', '3kx8u', 'y5pas', '8pc1g', '3cyhk'], loop: true, speed: 7 },
  { name: 'defence', frames: ['w25ly'], loop: true, speed: 5 },
  { name: 'die', frames: ['rdd8s'], loop: true, speed: 5 },
  { name: 'idleL', frames: ['72hcl'], loop: true, speed: 5 },
  { name: 'idledown', frames: ['rydce'], loop: true, speed: 5 },
  { name: 'idleup', frames: ['1et3y'], loop: true, speed: 5 },
  { name: 'item', frames: ['uwgfa', 'y65iy'], loop: false, speed: 5 },
  { name: 'jump', frames: ['8al5y', '3js2j'], loop: true, speed: 1 },
  { name: 'runL', frames: ['bbcvv', 'foxtp', 'aw8dg', 'evrtr', 'pyoh8', 't4rff'], loop: true, speed: 5 },
  { name: 'rundown', frames: ['koy62', '3ygc0', 'yfrrb', '2enbr', 's2yql', 'idc64'], loop: true, speed: 5 },
  { name: 'runup', frames: ['8mwul', 'snwwj', 'ynglr', 'p3oo0', 'pfwvy', 'tvkvf'], loop: true, speed: 5 },
  { name: 'sitdown', frames: ['20ynl'], loop: false, speed: 5 },
  { name: 'walkL', frames: ['3c66l', 'wq5ia', '11gwb', 'iitav', '360a7', 'ffd0g'], loop: true, speed: 5 },
  { name: 'walkdown', frames: ['ahlcx', '4i3vm', '0qwcd', 'y1030', '3sl87', '8kwsb'], loop: true, speed: 5 },
  { name: 'walkup', frames: ['umveo', 'v6ado', 'syfy0', 'us0w8', 'pf2m2', '876dv'], loop: true, speed: 5 },
]

const MOVE_SPEED = 0.375
const RUN_SPEED_MUL = 2
const ARENA_W = 480
const ARENA_H = 320
const PIXEL_SCALE = 2

/** 脚底阴影：相对脚底 y 偏移、缩放（与 Godot 一致） */
const SHADOW_OFFSET_Y = -2
const SHADOW_SCALE = 0.8

let shadowTexCache: HTMLCanvasElement | null = null
/** 程序生成椭圆阴影贴图，对应 Godot _ShadowTex.build_texture() */
function getShadowTexture(): HTMLCanvasElement {
  if (shadowTexCache) return shadowTexCache
  const c = document.createElement('canvas')
  const w = 28
  const h = 10
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')!
  ctx.fillStyle = 'rgba(0,0,0,0.45)'
  ctx.beginPath()
  ctx.ellipse(w / 2, h / 2, w / 2 - 1, h / 2 - 1, 0, 0, Math.PI * 2)
  ctx.fill()
  shadowTexCache = c
  return c
}

/** AABB 碰撞检测 */
function rectOverlap(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number }
): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}

function extractFrame(img: HTMLImageElement, key: string): HTMLCanvasElement | null {
  const r = REGIONS[key]
  if (!r) return null
  const c = document.createElement('canvas')
  c.width = r.w
  c.height = r.h
  const ctx = c.getContext('2d')!
  ctx.drawImage(img, r.x, r.y, r.w, r.h, 0, 0, r.w, r.h)
  return c
}

export default function ControlTest({ onBack }: ControlTestProps) {
  const { t } = useLanguage()
  const [spriteFile, setSpriteFile] = useState<File | null>(null)
  const [bgFile, setBgFile] = useState<File | null>(null)
  const [musicFile, setMusicFile] = useState<File | null>(null)
  const [frameCanvases, setFrameCanvases] = useState<Map<string, HTMLCanvasElement>>(new Map())
  const [ready, setReady] = useState(false)
  const [obstacleEditMode, setObstacleEditMode] = useState(false)
  const [obstacles, setObstacles] = useState<{ x: number; y: number; w: number; h: number }[]>([])
  const [dragRect, setDragRect] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const obstaclesRef = useRef<{ x: number; y: number; w: number; h: number }[]>([])
  const dragStartRef = useRef<{ x: number; y: number } | null>(null)
  const dragCurrentRef = useRef<{ x: number; y: number } | null>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const defaultSpriteImgRef = useRef<HTMLImageElement | null>(null)
  const bgImgRef = useRef<HTMLImageElement | null>(null)
  const defaultBgImgRef = useRef<HTMLImageElement | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const keysRef = useRef<Set<string>>(new Set())
  const posRef = useRef({ x: ARENA_W / 2 - 21, y: ARENA_H / 2 - 42 })
  const animRef = useRef({ name: 'idledown', frameIdx: 0, accum: 0 })
  const facingRef = useRef(1) // 1=right, -1=left
  const rafRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)
  const obstacleEditModeRef = useRef(false)
  const dragRectRef = useRef<{ x1: number; y1: number; x2: number; y2: number } | null>(null)

  useEffect(() => {
    obstaclesRef.current = obstacles
  }, [obstacles])
  obstacleEditModeRef.current = obstacleEditMode
  dragRectRef.current = dragRect

  const canvasWrapperRef = useRef<HTMLDivElement>(null)
  const clientToLogic = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const x = ((clientX - rect.left) / rect.width) * ARENA_W
    const y = ((clientY - rect.top) / rect.height) * ARENA_H
    return { x: Math.max(0, Math.min(ARENA_W, x)), y: Math.max(0, Math.min(ARENA_H, y)) }
  }, [])

  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!obstacleEditMode || e.button !== 0) return
      const { x, y } = clientToLogic(e.clientX, e.clientY)
      dragStartRef.current = { x, y }
      setDragRect({ x1: x, y1: y, x2: x, y2: y })
    },
    [obstacleEditMode, clientToLogic]
  )
  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!obstacleEditMode || !dragStartRef.current) return
      const { x, y } = clientToLogic(e.clientX, e.clientY)
      dragCurrentRef.current = { x, y }
      setDragRect((r) => (r ? { ...r, x2: x, y2: y } : null))
    },
    [obstacleEditMode, clientToLogic]
  )
  const finishDrag = useCallback(() => {
    const start = dragStartRef.current
    const current = dragCurrentRef.current
    if (!start || !current) return
    const x1 = Math.min(start.x, current.x)
    const y1 = Math.min(start.y, current.y)
    const x2 = Math.max(start.x, current.x)
    const y2 = Math.max(start.y, current.y)
    const w = Math.max(4, x2 - x1)
    const h = Math.max(4, y2 - y1)
    if (w >= 4 && h >= 4) {
      setObstacles((prev) => [...prev, { x: x1, y: y1, w, h }])
    }
    dragStartRef.current = null
    dragCurrentRef.current = null
    setDragRect(null)
  }, [])
  const handleCanvasMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (!obstacleEditMode || e.button !== 0) return
      dragCurrentRef.current = clientToLogic(e.clientX, e.clientY)
      finishDrag()
    },
    [obstacleEditMode, clientToLogic, finishDrag]
  )
  const handleCanvasMouseLeave = useCallback(() => {
    if (obstacleEditMode) {
      dragStartRef.current = null
      setDragRect(null)
    }
  }, [obstacleEditMode])

  useEffect(() => {
    const onWindowMouseUp = () => {
      if (dragStartRef.current) {
        if (!dragCurrentRef.current) dragCurrentRef.current = dragStartRef.current
        const start = dragStartRef.current
        const current = dragCurrentRef.current
        const x1 = Math.min(start.x, current.x)
        const y1 = Math.min(start.y, current.y)
        const x2 = Math.max(start.x, current.x)
        const y2 = Math.max(start.y, current.y)
        const w = Math.max(4, x2 - x1)
        const h = Math.max(4, y2 - y1)
        if (w >= 4 && h >= 4) {
          setObstacles((prev) => [...prev, { x: x1, y: y1, w, h }])
        }
        dragStartRef.current = null
        dragCurrentRef.current = null
        setDragRect(null)
      }
    }
    window.addEventListener('mouseup', onWindowMouseUp)
    return () => window.removeEventListener('mouseup', onWindowMouseUp)
  }, [])

  useEffect(() => {
    const buildFrames = (img: HTMLImageElement) => {
      const map = new Map<string, HTMLCanvasElement>()
      for (const key of Object.keys(REGIONS)) {
        const c = extractFrame(img, key)
        if (c) map.set(key, c)
      }
      setFrameCanvases(map)
      setReady(true)
    }
    if (spriteFile) {
      const url = URL.createObjectURL(spriteFile)
      const img = new Image()
      img.onload = () => {
        imgRef.current = img
        buildFrames(img)
      }
      img.src = url
      return () => {
        URL.revokeObjectURL(url)
        imgRef.current = null
        setFrameCanvases(new Map())
        setReady(false)
      }
    }
    imgRef.current = null
    const def = defaultSpriteImgRef.current
    if (def && def.complete && def.naturalWidth > 0) {
      buildFrames(def)
    } else {
      setFrameCanvases(new Map())
      setReady(false)
    }
  }, [spriteFile])

  const spriteFileRef = useRef<File | null>(null)
  spriteFileRef.current = spriteFile

  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      defaultSpriteImgRef.current = img
      if (!spriteFileRef.current && img.complete && img.naturalWidth > 0) {
        const map = new Map<string, HTMLCanvasElement>()
        for (const key of Object.keys(REGIONS)) {
          const c = extractFrame(img, key)
          if (c) map.set(key, c)
        }
        setFrameCanvases(map)
        setReady(true)
      }
    }
    img.src = DEFAULT_CHAR_URL
    return () => { defaultSpriteImgRef.current = null }
  }, [])

  useEffect(() => {
    if (bgFile) {
      const url = URL.createObjectURL(bgFile)
      const img = new Image()
      img.onload = () => {
        bgImgRef.current = img
      }
      img.src = url
      return () => {
        URL.revokeObjectURL(url)
        bgImgRef.current = null
      }
    }
    bgImgRef.current = null
  }, [bgFile])

  useEffect(() => {
    const img = new Image()
    img.onload = () => { defaultBgImgRef.current = img }
    img.src = DEFAULT_BG_URL
    return () => { defaultBgImgRef.current = null }
  }, [])

  useEffect(() => {
    if (musicFile) {
      const url = URL.createObjectURL(musicFile)
      const audio = new Audio(url)
      audio.loop = true
      audioRef.current = audio
      audio.play().catch(() => {})
      return () => {
        audio.pause()
        audio.src = ''
        URL.revokeObjectURL(url)
        audioRef.current = null
      }
    }
    const audio = new Audio(DEFAULT_BGM_URL)
    audio.loop = true
    audioRef.current = audio
    audio.play().catch(() => {})
    return () => {
      audio.pause()
      audio.src = ''
      audioRef.current = null
    }
  }, [musicFile])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.code || e.key
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyI', 'KeyJ', 'KeyK', 'ShiftLeft', 'ShiftRight'].includes(k)) {
        e.preventDefault()
      }
      keysRef.current.add(e.code || e.key.toLowerCase())
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.code || e.key.toLowerCase())
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  const gameLoop = useCallback((now?: number) => {
    const canvas = canvasRef.current
    const keys = keysRef.current
    rafRef.current = requestAnimationFrame(gameLoop)
    if (!canvas || !ready) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.imageSmoothingEnabled = false

    const t = typeof now === 'number' ? now : performance.now()
    const dt = lastTimeRef.current ? Math.min((t - lastTimeRef.current) / 1000, 1 / 15) : 1 / 60
    lastTimeRef.current = t

    const pos = posRef.current
    const anim = animRef.current
    const facing = facingRef.current

    let nextAnim = anim.name
    const w = keys.has('KeyW') || keys.has('w')
    const a = keys.has('KeyA') || keys.has('a')
    const s = keys.has('KeyS') || keys.has('s')
    const d = keys.has('KeyD') || keys.has('d')
    const i = keys.has('KeyI') || keys.has('i')
    const j = keys.has('KeyJ') || keys.has('j')
    const k = keys.has('KeyK') || keys.has('k')
    const shift = keys.has('ShiftLeft') || keys.has('ShiftRight')
    const moveSpeed = shift ? MOVE_SPEED * RUN_SPEED_MUL : MOVE_SPEED
    const walkPrefix = shift ? 'run' : 'walk'

    const CHAR_W = 21
    const CHAR_H = 42
    const CHAR_HITBOX_H = 6 // 脚底往上 6 像素有碰撞
    const obs = obstaclesRef.current
    const tryMove = (newX: number, newY: number) => {
      const charRect = {
        x: newX,
        y: newY + CHAR_H - CHAR_HITBOX_H,
        w: CHAR_W,
        h: CHAR_HITBOX_H,
      }
      for (const o of obs) {
        if (rectOverlap(charRect, o)) return false
      }
      return true
    }

    if (i) {
      nextAnim = 'item'
    } else if (j) {
      nextAnim = 'attractL'
    } else if (k) {
      nextAnim = 'defence'
    } else if (w && !s) {
      nextAnim = walkPrefix + 'up'
      const newY = Math.max(0, pos.y - moveSpeed)
      if (tryMove(pos.x, newY)) pos.y = newY
    } else if (s && !w) {
      nextAnim = walkPrefix + 'down'
      const newY = Math.min(ARENA_H - CHAR_H, pos.y + moveSpeed)
      if (tryMove(pos.x, newY)) pos.y = newY
    } else if (a && !d) {
      nextAnim = walkPrefix + 'L'
      facingRef.current = 1
      const newX = Math.max(0, pos.x - moveSpeed)
      if (tryMove(newX, pos.y)) pos.x = newX
    } else if (d && !a) {
      nextAnim = walkPrefix + 'L'
      facingRef.current = -1
      const newX = Math.min(ARENA_W - CHAR_W, pos.x + moveSpeed)
      if (tryMove(newX, pos.y)) pos.x = newX
    } else {
      nextAnim = facing === 1 ? 'idleL' : 'idledown'
    }

    let useAnim = anim
    if (nextAnim !== anim.name) {
      useAnim = { name: nextAnim, frameIdx: 0, accum: 0 }
      animRef.current = useAnim
    }

    const aDef = ANIMS.find((x) => x.name === useAnim.name) || ANIMS.find((x) => x.name === 'idledown')!
    const frameKey = aDef.frames[useAnim.frameIdx % aDef.frames.length]
    const frameCanvas = frameCanvases.get(frameKey)

    ctx.setTransform(PIXEL_SCALE, 0, 0, PIXEL_SCALE, 0, 0)
    const bgImg = bgImgRef.current ?? defaultBgImgRef.current
    if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
      const scale = Math.min(ARENA_W / bgImg.naturalWidth, ARENA_H / bgImg.naturalHeight)
      const drawW = bgImg.naturalWidth * scale
      const drawH = bgImg.naturalHeight * scale
      const dx = (ARENA_W - drawW) / 2
      const dy = (ARENA_H - drawH) / 2
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, 0, ARENA_W, ARENA_H)
      ctx.drawImage(bgImg, 0, 0, bgImg.naturalWidth, bgImg.naturalHeight, dx, dy, drawW, drawH)
    } else {
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, 0, ARENA_W, ARENA_H)
      ctx.fillStyle = '#16213e'
      for (let gy = 0; gy < ARENA_H; gy += 32) {
        for (let gx = 0; gx < ARENA_W; gx += 32) {
          if ((gx / 32 + gy / 32) % 2 === 0) ctx.fillRect(gx, gy, 32, 32)
        }
      }
    }

    if (frameCanvas) {
      const feetX = pos.x + frameCanvas.width / 2
      const feetY = pos.y + frameCanvas.height
      const shadowTex = getShadowTexture()
      const sw = shadowTex.width
      const sh = shadowTex.height
      const scale = SHADOW_SCALE
      ctx.save()
      ctx.translate(feetX, feetY + SHADOW_OFFSET_Y)
      ctx.scale(scale, scale)
      ctx.translate(-sw / 2, -sh / 2)
      ctx.drawImage(shadowTex, 0, 0)
      ctx.restore()

      ctx.save()
      ctx.translate(pos.x + frameCanvas.width / 2, pos.y + frameCanvas.height)
      ctx.scale(facingRef.current, 1)
      ctx.translate(-frameCanvas.width / 2, -frameCanvas.height)
      ctx.drawImage(frameCanvas, 0, 0)
      ctx.restore()
    }

    if (obstacleEditModeRef.current) {
      ctx.fillStyle = 'rgba(200, 80, 80, 0.4)'
      ctx.strokeStyle = 'rgba(200, 80, 80, 0.9)'
      ctx.lineWidth = 1
      for (const o of obstaclesRef.current) {
        ctx.fillRect(o.x, o.y, o.w, o.h)
        ctx.strokeRect(o.x, o.y, o.w, o.h)
      }
      const dr = dragRectRef.current
      if (dr) {
        const x = Math.min(dr.x1, dr.x2)
        const y = Math.min(dr.y1, dr.y2)
        const w = Math.max(4, Math.abs(dr.x2 - dr.x1))
        const h = Math.max(4, Math.abs(dr.y2 - dr.y1))
        ctx.fillStyle = 'rgba(255, 150, 150, 0.5)'
        ctx.strokeStyle = 'rgba(255, 100, 100, 1)'
        ctx.setLineDash([4, 4])
        ctx.fillRect(x, y, w, h)
        ctx.strokeRect(x, y, w, h)
        ctx.setLineDash([])
      }
    }

    useAnim.accum += aDef.speed * dt
    while (useAnim.accum >= 1) {
      useAnim.accum -= 1
      useAnim.frameIdx += 1
      if (!aDef.loop && useAnim.frameIdx >= aDef.frames.length) {
        useAnim.frameIdx = aDef.frames.length - 1
        useAnim.accum = 0
        break
      } else {
        useAnim.frameIdx %= aDef.frames.length
      }
    }
    animRef.current = useAnim
  }, [ready, frameCanvases])

  useEffect(() => {
    lastTimeRef.current = 0
    rafRef.current = requestAnimationFrame(gameLoop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [gameLoop])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10,
        background: '#0f0f1a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 8,
        }}
      >
        {onBack && (
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={onBack}
            style={{ color: 'rgba(255,255,255,0.85)' }}
          >
            {t('backToHome')}
          </Button>
        )}
        <StashDropZone onStashDrop={(f) => setSpriteFile(f)}>
          <div style={{ width: 200 }}>
            <Dragger
              accept={IMAGE_ACCEPT.join(',')}
              maxCount={1}
              fileList={spriteFile ? [{ uid: '1', name: spriteFile.name } as UploadFile] : []}
              beforeUpload={(f) => {
                setSpriteFile(f)
                return false
              }}
              onRemove={() => setSpriteFile(null)}
              style={{ padding: '8px' }}
            >
              <p className="ant-upload-text" style={{ margin: 0, fontSize: 12 }}>
                {t('controlTestUploadHint')}
              </p>
              <p className="ant-upload-hint" style={{ margin: 0, fontSize: 11 }}>
                {t('controlTestUploadNote')}
              </p>
            </Dragger>
          </div>
        </StashDropZone>
        <StashDropZone onStashDrop={(f) => setBgFile(f)}>
          <div style={{ width: 200 }}>
            <Dragger
              accept={IMAGE_ACCEPT.join(',')}
              maxCount={1}
              fileList={bgFile ? [{ uid: 'bg', name: bgFile.name } as UploadFile] : []}
              beforeUpload={(f) => {
                setBgFile(f)
                return false
              }}
              onRemove={() => setBgFile(null)}
              style={{ padding: '8px' }}
            >
              <p className="ant-upload-text" style={{ margin: 0, fontSize: 12 }}>
                {t('controlTestBgUploadHint')}
              </p>
            </Dragger>
          </div>
        </StashDropZone>
        <div style={{ width: 200 }}>
          <Dragger
            accept={AUDIO_ACCEPT.join(',')}
            maxCount={1}
            fileList={musicFile ? [{ uid: 'music', name: musicFile.name } as UploadFile] : []}
            beforeUpload={(f) => {
              setMusicFile(f)
              return false
            }}
            onRemove={() => setMusicFile(null)}
            style={{ padding: '8px' }}
          >
            <p className="ant-upload-text" style={{ margin: 0, fontSize: 12 }}>
              {t('controlTestMusicUploadHint')}
            </p>
          </Dragger>
        </div>
        <div style={{ width: 200, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Switch
              checked={obstacleEditMode}
              onChange={setObstacleEditMode}
              size="small"
            />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>
              {t('controlTestObstacleEdit')}
            </span>
          </div>
          {obstacleEditMode && (
            <>
              <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                {t('controlTestObstacleEditHint')}
              </Typography.Text>
              {obstacles.length > 0 && (
                <Button
                  size="small"
                  danger
                  onClick={() => setObstacles([])}
                >
                  {t('controlTestObstacleClear')}
                </Button>
              )}
            </>
          )}
        </div>
      </div>
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
        }}
      >
        <div
          style={{
            padding: 16,
            background: '#1a1a2e',
            borderRadius: 8,
            border: '1px solid #333',
          }}
        >
          <div
            ref={canvasWrapperRef}
            style={{
              position: 'relative',
              cursor: obstacleEditMode ? 'crosshair' : 'default',
            }}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseLeave}
          >
            <canvas
              ref={canvasRef}
              width={ARENA_W * PIXEL_SCALE}
              height={ARENA_H * PIXEL_SCALE}
              style={{
                display: 'block',
                imageRendering: 'pixelated',
                imageRendering: 'crisp-edges',
              }}
            />
          </div>
        </div>
      </div>
      <Text
        type="secondary"
        style={{
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 12,
          color: 'rgba(255,255,255,0.5)',
        }}
      >
        {t('controlTestKeys')}
      </Text>
    </div>
  )
}
