/**
 * 去除 Gemini 可见水印
 * 算法参考: https://github.com/allenk/GeminiWatermarkTool (MIT)
 * 仅去除可见水印，不涉及 SynthID 隐形水印
 */
import { useEffect, useState } from 'react'
import { Radio, Space, Typography, Upload } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import type { UploadFile } from 'antd'
import { useLanguage } from '../i18n/context'
import StashDropZone from './StashDropZone'
import StashableImage from './StashableImage'
import {
  getWatermarkSize,
  getWatermarkParams,
  removeWatermarkReverseAlpha,
  getEmbeddedAlphaMask,
  createApproxAlphaMap,
  type WatermarkSize,
} from '../lib/geminiWatermark'

const { Dragger } = Upload
const { Text } = Typography

const IMAGE_ACCEPT = ['.png', '.jpg', '.jpeg', '.webp']
const IMAGE_MAX_MB = 20

export default function ImageGeminiWatermark() {
  const { t } = useLanguage()
  const [file, setFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [sizeMode, setSizeMode] = useState<'auto' | '48' | '96'>('auto')

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file)
      setImageUrl(url)
      setResultUrl(null)
      return () => URL.revokeObjectURL(url)
    }
    setImageUrl(null)
    setResultUrl(null)
  }, [file])

  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl)
    }
  }, [resultUrl])

  const processImage = async () => {
    if (!imageUrl || !file) return
    setProcessing(true)
    setResultUrl((old) => {
      if (old) URL.revokeObjectURL(old)
      return null
    })
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new Image()
        i.onload = () => resolve(i)
        i.onerror = reject
        i.src = imageUrl
      })

      const w = img.naturalWidth
      const h = img.naturalHeight
      const baseSize: WatermarkSize = sizeMode === 'auto' ? getWatermarkSize(w, h) : sizeMode === '48' ? 48 : 96
      const params = getWatermarkParams(w, h, baseSize)

      let alphaMap: Float32Array
      let mapW: number
      let mapH: number

      try {
        const loaded = await getEmbeddedAlphaMask(baseSize)
        alphaMap = loaded.alpha
        mapW = loaded.width
        mapH = loaded.height
      } catch {
        alphaMap = createApproxAlphaMap(baseSize)
        mapW = mapH = baseSize
      }

      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, w, h)

      const alphaScale = baseSize === 96 ? 0.85 : 1
      removeWatermarkReverseAlpha(imageData, alphaMap, mapW, mapH, params.x, params.y, 255, alphaScale)
      ctx.putImageData(imageData, 0, 0)

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), 'image/png')
      })
      if (blob) {
        setResultUrl(URL.createObjectURL(blob))
      }
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: 720 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Text type="secondary">{t('geminiWatermarkHint')}</Text>
        <StashDropZone onStashDrop={(f) => setFile(f)} maxSizeMB={IMAGE_MAX_MB}>
          <Dragger
            accept={IMAGE_ACCEPT.join(',')}
            maxCount={1}
            fileList={file ? [{ uid: '1', name: file.name } as UploadFile] : []}
            beforeUpload={(f) => {
              setFile(f)
              return false
            }}
            onRemove={() => setFile(null)}
          >
            <p className="ant-upload-text">{t('imageUploadHint')}</p>
            <p className="ant-upload-hint">{t('imageFormats')}</p>
          </Dragger>
        </StashDropZone>

        {file && imageUrl && (
          <>
            <Space wrap align="center">
              <Text type="secondary">{t('geminiWatermarkSize')}:</Text>
              <Radio.Group
                value={sizeMode}
                onChange={(e) => setSizeMode(e.target.value)}
                optionType="button"
                size="small"
              >
                <Radio.Button value="auto">{t('geminiWatermarkSizeAuto')}</Radio.Button>
                <Radio.Button value="48">48×48</Radio.Button>
                <Radio.Button value="96">96×96</Radio.Button>
              </Radio.Group>
            </Space>
            <Space wrap>
              <button
                type="button"
                onClick={processImage}
                disabled={processing}
                style={{
                  padding: '10px 24px',
                  border: '1px solid #9a8b78',
                  borderRadius: 4,
                  background: '#b55233',
                  color: '#fff',
                  cursor: processing ? 'not-allowed' : 'pointer',
                  fontSize: 14,
                  fontWeight: 600,
                  opacity: processing ? 0.7 : 1,
                }}
              >
                {processing ? t('geminiWatermarkProcessing') : t('geminiWatermarkRemove')}
              </button>
              {resultUrl && (
                <a
                  href={resultUrl}
                  download={`${file.name.replace(/\.[^.]+$/, '')}-no-watermark.png`}
                  style={{
                    padding: '10px 24px',
                    border: '1px solid #9a8b78',
                    borderRadius: 4,
                    background: '#e4dbcf',
                    color: '#3d3428',
                    textDecoration: 'none',
                    fontSize: 14,
                    fontWeight: 500,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <DownloadOutlined /> {t('geminiWatermarkDownload')}
                </a>
              )}
            </Space>

            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              <div>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>{t('geminiWatermarkOriginal')}</Text>
                <StashableImage src={imageUrl} alt="" style={{ maxWidth: 360, maxHeight: 360, borderRadius: 8, border: '1px solid #9a8b78' }} />
              </div>
              {resultUrl && (
                <div>
                  <Text strong style={{ display: 'block', marginBottom: 8 }}>{t('geminiWatermarkResult')}</Text>
                  <StashableImage src={resultUrl} alt="" style={{ maxWidth: 360, maxHeight: 360, borderRadius: 8, border: '1px solid #9a8b78' }} />
                </div>
              )}
            </div>

            <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
              {t('geminiWatermarkDisclaimer')}
            </Text>
          </>
        )}
      </Space>
    </div>
  )
}
