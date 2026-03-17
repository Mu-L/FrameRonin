import { useCallback, useEffect, useRef, useState } from 'react'

const PREVIEW_MAX = 480
const HANDLE_SIZE = 12
const MIN_CROP = 4

export type CropValues = { top: number; bottom: number; left: number; right: number }

type DragHandle = 'top' | 'bottom' | 'left' | 'right' | 'tl' | 'tr' | 'bl' | 'br' | 'move'

interface CropPreviewProps {
  imageUrl: string
  cropTop: number
  cropBottom: number
  cropLeft: number
  cropRight: number
  onChange: (crop: CropValues) => void
  onImageSize?: (w: number, h: number) => void
  loadingText?: string
  /** 允许负值（扩边），并显示裁切框与扩边区域 */
  allowNegative?: boolean
}

export default function CropPreview({
  imageUrl,
  cropTop,
  cropBottom,
  cropLeft,
  cropRight,
  onChange,
  onImageSize,
  loadingText = 'Loading...',
  allowNegative = false,
}: CropPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [imgSize, setImgSize] = useState<{ w: number; h: number } | null>(null)
  const [drag, setDrag] = useState<{
    handle: DragHandle
    startX: number
    startY: number
    startTop: number
    startBottom: number
    startLeft: number
    startRight: number
    scale: number
  } | null>(null)

  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      const size = { w: img.naturalWidth, h: img.naturalHeight }
      setImgSize(size)
      onImageSize?.(size.w, size.h)
    }
    img.onerror = () => setImgSize(null)
    img.src = imageUrl
  }, [imageUrl, onImageSize])

  const getDisplayRect = useCallback(() => {
    if (!imgSize) return null
    // 按图片实际分辨率：小图 1:1 显示，大图按比例缩小至 PREVIEW_MAX 内
    const scale = Math.min(1, PREVIEW_MAX / Math.max(imgSize.w, imgSize.h))
    const cw = imgSize.w * scale
    const ch = imgSize.h * scale
    const dw = cw
    const dh = ch
    const dx = 0
    const dy = 0
    return { dx, dy, dw, dh, scale, cw, ch }
  }, [imgSize])

  const hasNegative = allowNegative && (cropLeft < 0 || cropRight < 0 || cropTop < 0 || cropBottom < 0)

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, handle: DragHandle) => {
      e.preventDefault()
      if (hasNegative) return
      const rect = getDisplayRect()
      if (!rect || !imgSize) return
      const { scale } = rect
      setDrag({
        handle,
        startX: e.clientX,
        startY: e.clientY,
        startTop: cropTop,
        startBottom: cropBottom,
        startLeft: cropLeft,
        startRight: cropRight,
        scale,
      })
    },
    [cropTop, cropBottom, cropLeft, cropRight, getDisplayRect, imgSize, hasNegative]
  )

  useEffect(() => {
    if (!drag) return
    const onMove = (e: MouseEvent) => {
      const dx = (e.clientX - drag.startX) / drag.scale
      const dy = (e.clientY - drag.startY) / drag.scale
      const { handle, startTop, startBottom, startLeft, startRight } = drag
      if (!imgSize) return
      const { w, h } = imgSize
      let top = startTop
      let bottom = startBottom
      let left = startLeft
      let right = startRight

      switch (handle) {
        case 'top':
          top = Math.max(0, Math.min(h - bottom - MIN_CROP, startTop + dy))
          break
        case 'bottom':
          bottom = Math.max(0, Math.min(h - top - MIN_CROP, startBottom - dy))
          break
        case 'left':
          left = Math.max(0, Math.min(w - right - MIN_CROP, startLeft + dx))
          break
        case 'right':
          right = Math.max(0, Math.min(w - left - MIN_CROP, startRight - dx))
          break
        case 'tl':
          top = Math.max(0, Math.min(h - bottom - MIN_CROP, startTop + dy))
          left = Math.max(0, Math.min(w - right - MIN_CROP, startLeft + dx))
          break
        case 'tr':
          top = Math.max(0, Math.min(h - bottom - MIN_CROP, startTop + dy))
          right = Math.max(0, Math.min(w - left - MIN_CROP, startRight - dx))
          break
        case 'bl':
          bottom = Math.max(0, Math.min(h - top - MIN_CROP, startBottom - dy))
          left = Math.max(0, Math.min(w - right - MIN_CROP, startLeft + dx))
          break
        case 'br':
          bottom = Math.max(0, Math.min(h - top - MIN_CROP, startBottom - dy))
          right = Math.max(0, Math.min(w - left - MIN_CROP, startRight - dx))
          break
        case 'move': {
          const sw = w - startLeft - startRight
          const sh = h - startTop - startBottom
          const maxLeft = w - sw - 0
          const maxTop = h - sh - 0
          const newLeft = Math.max(0, Math.min(maxLeft, startLeft + dx))
          const newTop = Math.max(0, Math.min(maxTop, startTop + dy))
          left = newLeft
          top = newTop
          right = w - left - sw
          bottom = h - top - sh
          break
        }
      }
      onChange({ top, bottom, left, right })
    }
    const onUp = () => setDrag(null)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [drag, imgSize, onChange])

  if (!imgSize) {
    return (
      <div
        ref={containerRef}
        style={{
          width: PREVIEW_MAX,
          height: PREVIEW_MAX,
          background: 'repeating-conic-gradient(#c9bfb0 0% 25%, #e4dbcf 0% 50%) 50% / 16px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#888',
          borderRadius: 8,
        }}
      >
        {loadingText}
      </div>
    )
  }

  const rect = getDisplayRect()
  if (!rect) return null
  const { scale, cw, ch } = rect
  const dw = cw
  const dh = ch
  const boxL = cropLeft * scale
  const boxT = cropTop * scale
  const boxW = (imgSize.w - cropLeft - cropRight) * scale
  const boxH = (imgSize.h - cropTop - cropBottom) * scale

  if (hasNegative) {
    const left = Math.min(0, boxL)
    const topVal = Math.min(0, boxT)
    const right = Math.max(cw, boxL + boxW)
    const bottom = Math.max(ch, boxT + boxH)
    const containerW = right - left
    const containerH = bottom - topVal
    const offsetX = -left
    const offsetY = -topVal
    const imgLeft = offsetX
    const imgTop = offsetY
    const boxLeft = boxL + offsetX
    const boxTop = boxT + offsetY
    const negScale = Math.min(1, PREVIEW_MAX / Math.max(containerW, containerH))
    const displayW = containerW * negScale
    const displayH = containerH * negScale
    return (
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: displayW,
          height: displayH,
          minWidth: 120,
          minHeight: 120,
          flexShrink: 0,
          overflow: 'hidden',
          borderRadius: 8,
          border: '1px solid #9a8b78',
          background: 'repeating-conic-gradient(#c9bfb0 0% 25%, #e4dbcf 0% 50%) 50% / 16px 16px',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: containerW,
            height: containerH,
            transform: `scale(${negScale})`,
            transformOrigin: 'top left',
          }}
        >
          <img
            src={imageUrl}
            alt=""
            style={{
              position: 'absolute',
              left: imgLeft,
              top: imgTop,
              width: dw,
              height: dh,
              objectFit: 'none',
              objectPosition: '0 0',
              pointerEvents: 'none',
            }}
          />
          {/* 扩边区域（半透明蓝） */}
          {boxL < 0 && (
            <div
              style={{
                position: 'absolute',
                left: boxLeft,
                top: boxTop,
                width: -boxL,
                height: boxH,
                background: 'rgba(0, 100, 255, 0.2)',
                pointerEvents: 'none',
              }}
            />
          )}
          {boxL + boxW > cw && (
            <div
              style={{
                position: 'absolute',
                left: imgLeft + cw,
                top: boxTop,
                width: boxL + boxW - cw,
                height: boxH,
                background: 'rgba(0, 100, 255, 0.2)',
                pointerEvents: 'none',
              }}
            />
          )}
          {boxT < 0 && (
            <div
              style={{
                position: 'absolute',
                left: boxLeft,
                top: boxTop,
                width: boxW,
                height: -boxT,
                background: 'rgba(0, 100, 255, 0.2)',
                pointerEvents: 'none',
              }}
            />
          )}
          {boxT + boxH > ch && (
            <div
              style={{
                position: 'absolute',
                left: boxLeft,
                top: imgTop + ch,
                width: boxW,
                height: boxT + boxH - ch,
                background: 'rgba(0, 100, 255, 0.2)',
                pointerEvents: 'none',
              }}
            />
          )}
          {/* 裁切区域（暗色遮罩） */}
          {boxL > 0 && (
            <div
              style={{
                position: 'absolute',
                left: imgLeft,
                top: imgTop,
                width: boxL,
                height: dh,
                background: 'rgba(0,0,0,0.5)',
                pointerEvents: 'none',
              }}
            />
          )}
          {boxL + boxW < cw && (
            <div
              style={{
                position: 'absolute',
                left: imgLeft + boxL + boxW,
                top: imgTop,
                width: cw - boxL - boxW,
                height: dh,
                background: 'rgba(0,0,0,0.5)',
                pointerEvents: 'none',
              }}
            />
          )}
          {boxT > 0 && (
            <div
              style={{
                position: 'absolute',
                left: imgLeft,
                top: imgTop,
                width: dw,
                height: boxT,
                background: 'rgba(0,0,0,0.5)',
                pointerEvents: 'none',
              }}
            />
          )}
          {boxT + boxH < ch && (
            <div
              style={{
                position: 'absolute',
                left: imgLeft,
                top: imgTop + boxT + boxH,
                width: dw,
                height: ch - boxT - boxH,
                background: 'rgba(0,0,0,0.5)',
                pointerEvents: 'none',
              }}
            />
          )}
          {/* 输出框边框 */}
          <div
            style={{
              position: 'absolute',
              left: boxLeft,
              top: boxTop,
              width: boxW,
              height: boxH,
              border: '1px dashed rgba(255,255,255,0.95)',
              boxSizing: 'border-box',
              boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.25)',
              pointerEvents: 'none',
              zIndex: 5,
            }}
          />
          {/* 图片范围边框 */}
          <div
            style={{
              position: 'absolute',
              left: imgLeft,
              top: imgTop,
              width: dw,
              height: dh,
              border: '1px solid rgba(255,165,0,0.8)',
              boxSizing: 'border-box',
              pointerEvents: 'none',
              zIndex: 4,
            }}
          />
        </div>
      </div>
    )
  }

  const handleStyle: React.CSSProperties = {
    position: 'absolute',
    width: 6,
    height: 6,
    background: '#fff',
    border: '1px solid rgba(0,0,0,0.35)',
    borderRadius: '50%',
    cursor: 'pointer',
    zIndex: 10,
    boxShadow: '0 0 0 1px rgba(255,255,255,0.8)',
  }
  const cornerSize = Math.min(HANDLE_SIZE, Math.max(6, boxW / 4), Math.max(6, boxH / 4))

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: `${cw}px`,
        height: `${ch}px`,
        minWidth: `${cw}px`,
        minHeight: `${ch}px`,
        flexShrink: 0,
        overflow: 'hidden',
        borderRadius: 8,
        border: '1px solid #9a8b78',
        background: 'repeating-conic-gradient(#c9bfb0 0% 25%, #e4dbcf 0% 50%) 50% / 16px 16px',
      }}
    >
      <img
        src={imageUrl}
        alt=""
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: `${dw}px`,
          height: `${dh}px`,
          objectFit: 'none',
          objectPosition: '0 0',
          pointerEvents: 'none',
        }}
      />
      {/* 半透明遮罩：裁掉区域 */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
        }}
      >
        {/* 上 */}
        <div style={{ position: 'absolute', left: 0, top: 0, right: 0, height: boxT, background: 'rgba(0,0,0,0.5)' }} />
        {/* 下 */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: boxT + boxH,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
          }}
        />
        {/* 左 */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: boxT,
            width: boxL - 0,
            height: boxH,
            background: 'rgba(0,0,0,0.5)',
          }}
        />
        {/* 右 */}
        <div
          style={{
            position: 'absolute',
            left: boxL + boxW,
            top: boxT,
            right: 0,
            height: boxH,
            background: 'rgba(0,0,0,0.5)',
          }}
        />
      </div>
      {/* 裁切框边框：细虚线 + 阴影增强对比 */}
      <div
        onMouseDown={(e) => handleMouseDown(e, 'move')}
        style={{
          position: 'absolute',
          left: boxL,
          top: boxT,
          width: boxW,
          height: boxH,
          border: '1px dashed rgba(255,255,255,0.95)',
          boxSizing: 'border-box',
          boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.25)',
          cursor: 'move',
          zIndex: 5,
        }}
      />
      {/* 拖动手柄：边 */}
      <div
        onMouseDown={(e) => handleMouseDown(e, 'top')}
        style={{
          position: 'absolute',
          left: boxL + cornerSize,
          top: boxT - 3,
          width: boxW - cornerSize * 2,
          height: 6,
          cursor: 'n-resize',
          zIndex: 10,
        }}
      />
      <div
        onMouseDown={(e) => handleMouseDown(e, 'bottom')}
        style={{
          position: 'absolute',
          left: boxL + cornerSize,
          top: boxT + boxH - 3,
          width: boxW - cornerSize * 2,
          height: 6,
          cursor: 's-resize',
          zIndex: 10,
        }}
      />
      <div
        onMouseDown={(e) => handleMouseDown(e, 'left')}
        style={{
          position: 'absolute',
          left: boxL - 3,
          top: boxT + cornerSize,
          width: 6,
          height: boxH - cornerSize * 2,
          cursor: 'w-resize',
          zIndex: 10,
        }}
      />
      <div
        onMouseDown={(e) => handleMouseDown(e, 'right')}
        style={{
          position: 'absolute',
          left: boxL + boxW - 3,
          top: boxT + cornerSize,
          width: 6,
          height: boxH - cornerSize * 2,
          cursor: 'e-resize',
          zIndex: 10,
        }}
      />
      {/* 四角 */}
      <div
        onMouseDown={(e) => handleMouseDown(e, 'tl')}
        style={{
          ...handleStyle,
          left: boxL - 3,
          top: boxT - 3,
          cursor: 'nwse-resize',
        }}
      />
      <div
        onMouseDown={(e) => handleMouseDown(e, 'tr')}
        style={{
          ...handleStyle,
          left: boxL + boxW - 3,
          top: boxT - 3,
          cursor: 'nesw-resize',
        }}
      />
      <div
        onMouseDown={(e) => handleMouseDown(e, 'bl')}
        style={{
          ...handleStyle,
          left: boxL - 3,
          top: boxT + boxH - 3,
          cursor: 'nesw-resize',
        }}
      />
      <div
        onMouseDown={(e) => handleMouseDown(e, 'br')}
        style={{
          ...handleStyle,
          left: boxL + boxW - 3,
          top: boxT + boxH - 3,
          cursor: 'nwse-resize',
        }}
      />
    </div>
  )
}
