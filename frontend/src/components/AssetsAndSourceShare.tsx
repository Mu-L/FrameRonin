import { Button, Divider, Typography } from 'antd'
import { GithubOutlined, CloudDownloadOutlined } from '@ant-design/icons'
import { useLanguage } from '../i18n/context'

const { Text } = Typography

const GITHUB_REPO_URL = 'https://github.com/systemchester/FrameRonin'
const ASSETS_URL = 'https://github.com/systemchester/Spritesheetweapon/tree/master/01-%E7%BE%8E%E6%9C%AF'
const GITHUB_RELEASES_URL = 'https://github.com/systemchester/FrameRonin/releases'
const GODOT_CODE_URL = 'https://github.com/systemchester/Spritesheetweapon/tree/master/02-%E7%A8%8B%E5%BA%8F/godot%E8%84%9A%E6%9C%AC'

export default function AssetsAndSourceShare() {
  const { t } = useLanguage()

  return (
    <>
      <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
        {t('assetsAndSourceHint')}
      </Text>

      <div style={{ marginBottom: 24 }}>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>{t('assetsAndSourceCode')}</Text>
        <Button
          type="primary"
          icon={<GithubOutlined />}
          onClick={() => window.open(GITHUB_REPO_URL, '_blank')}
        >
          {t('assetsAndSourceRepo')}
        </Button>
        <Text type="secondary" style={{ display: 'block', marginTop: 4, fontSize: 12 }}>
          {t('assetsAndSourceRepoDesc')}
        </Text>
      </div>

      <Divider />

      <div style={{ marginBottom: 24 }}>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>{t('assetsAndSourceDownloads')}</Text>
        <Button
          icon={<CloudDownloadOutlined />}
          onClick={() => window.open(ASSETS_URL, '_blank')}
        >
          {t('assetsAndSourceReleases')}
        </Button>
        <Text type="secondary" style={{ display: 'block', marginTop: 4, fontSize: 12 }}>
          {t('assetsAndSourceReleasesDesc')}
        </Text>
      </div>

      <Divider />

      <div>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>{t('assetsAndSourceBilibili')}</Text>
        <Button onClick={() => window.open(GODOT_CODE_URL, '_blank')}>
          {t('assetsAndSourceGodotBtn')}
        </Button>
      </div>
    </>
  )
}
