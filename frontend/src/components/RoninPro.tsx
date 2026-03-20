import { useEffect, useState } from 'react'
import { Button, Card, Space, Typography } from 'antd'
import { ArrowLeftOutlined, ExpandOutlined, LockOutlined, MergeCellsOutlined, ScissorOutlined } from '@ant-design/icons'
import { useAuth } from '../auth/context'
import { RONIN_PRO_REQUIRE_NFT } from '../config/features'
import { useNftOwnership } from '../hooks/useNftOwnership'
import { useLanguage } from '../i18n/context'
import RoninProCustomScale from './RoninProCustomScale'
import RoninProCustomSlice from './RoninProCustomSlice'
import RoninProUnifySize from './RoninProUnifySize'

interface RoninProProps {
  onBack?: () => void
  /** 外部一次性格子模块（如首页快捷键），进入后由 onDeepLinkConsumed 清空 */
  deepLinkFeature?: string | null
  onDeepLinkConsumed?: () => void
}

export default function RoninPro({ onBack, deepLinkFeature = null, onDeepLinkConsumed }: RoninProProps) {
  const { t } = useLanguage()
  const { address, isConnected } = useAuth()
  const ownsNft = useNftOwnership(RONIN_PRO_REQUIRE_NFT ? address : null)
  const [activeFeature, setActiveFeature] = useState<string | null>(null)

  useEffect(() => {
    if (!deepLinkFeature) return
    setActiveFeature(deepLinkFeature)
    onDeepLinkConsumed?.()
  }, [deepLinkFeature, onDeepLinkConsumed])

  if (!isConnected) {
    return (
      <div style={{ padding: 24 }}>
        {onBack && (
          <div style={{ marginBottom: 16 }}>
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={onBack}>
              {t('backToHome')}
            </Button>
          </div>
        )}
        <div style={{ textAlign: 'center', padding: 48 }}>
          <LockOutlined style={{ fontSize: 48, color: '#b55233', marginBottom: 16 }} />
          <Typography.Title level={4}>{t('roninProRequireLogin')}</Typography.Title>
          <Typography.Text type="secondary">{t('roninProRequireLoginDesc')}</Typography.Text>
        </div>
      </div>
    )
  }

  if (RONIN_PRO_REQUIRE_NFT && ownsNft === false) {
    return (
      <div style={{ padding: 24 }}>
        {onBack && (
          <div style={{ marginBottom: 16 }}>
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={onBack}>
              {t('backToHome')}
            </Button>
          </div>
        )}
        <div style={{ textAlign: 'center', padding: 48 }}>
          <LockOutlined style={{ fontSize: 48, color: '#b55233', marginBottom: 16 }} />
          <Typography.Title level={4}>{t('roninProRequireNft')}</Typography.Title>
          <Typography.Text type="secondary">{t('roninProRequireNftDesc')}</Typography.Text>
        </div>
      </div>
    )
  }

  if (RONIN_PRO_REQUIRE_NFT && ownsNft === null) {
    return (
      <div style={{ padding: 24 }}>
        {onBack && (
          <div style={{ marginBottom: 16 }}>
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={onBack}>
              {t('backToHome')}
            </Button>
          </div>
        )}
        <div style={{ textAlign: 'center', padding: 48 }}>
          <Typography.Text type="secondary">{t('roninProChecking')}</Typography.Text>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        {activeFeature ? (
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => setActiveFeature(null)}
          >
            {t('roninProBack')}
          </Button>
        ) : onBack ? (
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={onBack}>
            {t('backToHome')}
          </Button>
        ) : null}
        <Typography.Title level={4} style={{ margin: 0 }}>
          RoninPro
        </Typography.Title>
      </div>

      {!activeFeature ? (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Typography.Text type="secondary">{t('moduleRoninProDesc')}</Typography.Text>
          <Card
            hoverable
            style={{ maxWidth: 360 }}
            onClick={() => setActiveFeature('customSlice')}
          >
            <Space>
              <ScissorOutlined style={{ fontSize: 24, color: '#b55233' }} />
              <div>
                <Typography.Text strong>{t('roninProCustomSlice')}</Typography.Text>
                <div>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {t('roninProCustomSliceHint')}
                  </Typography.Text>
                </div>
              </div>
            </Space>
          </Card>
          <Card
            hoverable
            style={{ maxWidth: 360 }}
            onClick={() => setActiveFeature('customScale')}
          >
            <Space>
              <ExpandOutlined style={{ fontSize: 24, color: '#b55233' }} />
              <div>
                <Typography.Text strong>{t('roninProCustomScale')}</Typography.Text>
                <div>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {t('roninProCustomScaleHint')}
                  </Typography.Text>
                </div>
              </div>
            </Space>
          </Card>
          <Card
            hoverable
            style={{ maxWidth: 360 }}
            onClick={() => setActiveFeature('unifySize')}
          >
            <Space>
              <MergeCellsOutlined style={{ fontSize: 24, color: '#b55233' }} />
              <div>
                <Typography.Text strong>{t('roninProUnifySize')}</Typography.Text>
                <div>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {t('roninProUnifySizeHint')}
                  </Typography.Text>
                </div>
              </div>
            </Space>
          </Card>
        </Space>
      ) : activeFeature === 'customSlice' ? (
        <RoninProCustomSlice />
      ) : activeFeature === 'customScale' ? (
        <RoninProCustomScale />
      ) : activeFeature === 'unifySize' ? (
        <RoninProUnifySize />
      ) : null}
    </div>
  )
}
