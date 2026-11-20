import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

const QQ_HEADERS = {
  Referer: 'https://y.qq.com/',
  Origin: 'https://y.qq.com',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
}

async function resolveQqPlaylistId(rawInput: string): Promise<string | null> {
  const trimmed = rawInput.trim()
  if (!trimmed) return null
  if (/^\d{5,15}$/.test(trimmed)) return trimmed
  const urlMatch = trimmed.match(/https?:\/\/[^\s]+/i)
  const targetUrl = urlMatch ? urlMatch[0] : trimmed
  const parseId = (u: string) => {
    for (const re of [/playlist\/(\d{5,15})/i, /[?&]id=(\d{5,15})/i, /[?&]disstid=(\d{5,15})/i]) {
      const m = u.match(re)
      if (m?.[1]) return m[1]
    }
    return null
  }
  const direct = parseId(targetUrl)
  if (direct) return direct
  if (/^https?:\/\//i.test(targetUrl)) {
    const resp = await fetch(targetUrl, { redirect: 'follow', headers: QQ_HEADERS })
    const redirected = parseId(resp.url)
    if (redirected) return redirected
    const html = await resp.text()
    const m = html.match(/(?:disstid|playlistId|taogeId)["':=\s]+(\d{5,15})/i)
    if (m?.[1]) return m[1]
  }
  return null
}

async function fetchQqTrackLyric(songmid: string): Promise<string> {
  if (!songmid) return ''
  try {
    const resp = await fetch(
      `https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg?songmid=${encodeURIComponent(songmid)}&format=json&nobase64=1`,
      { headers: QQ_HEADERS },
    )
    if (!resp.ok) return ''
    const text = await resp.text()
    const jsonStr = text.trim().replace(/^MusicJsonCallback\(/, '').replace(/\)\s*;?$/, '')
    const parsed = JSON.parse(jsonStr) as { lyric?: string }
    const raw = (parsed.lyric || '').trim()
    if (!raw) return ''
    if (!raw.includes('[') && /^[A-Za-z0-9+/=\s]+$/.test(raw)) {
      return Buffer.from(raw, 'base64').toString('utf-8').trim()
    }
    return raw
  } catch {
    return ''
  }
}

function qqPlaylistDevPlugin(): Plugin {
  return {
    name: 'qq-playlist-dev-resolver',
    configureServer(server) {
      server.middlewares.use('/__dev/qq-playlist', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end(JSON.stringify({ error: 'Method Not Allowed' }))
          return
        }
        try {
          const chunks: Buffer[] = []
          for await (const chunk of req) chunks.push(Buffer.from(chunk))
          const body = JSON.parse(Buffer.concat(chunks).toString('utf-8') || '{}') as {
            playlistInput?: string
            limit?: number
          }
          const playlistId = await resolveQqPlaylistId(body.playlistInput || '')
          if (!playlistId) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: '无法识别 QQ 音乐歌单 ID，请检查链接' }))
            return
          }
          const resp = await fetch(
            `https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg?type=1&json=1&utf8=1&onlysong=0&disstid=${encodeURIComponent(playlistId)}&format=json`,
            { headers: QQ_HEADERS },
          )
          const rawText = await resp.text()
          const cleaned = rawText.trim().replace(/^playlistinfoCallback\(/, '').replace(/\)\s*;?$/, '')
          const data = JSON.parse(cleaned)
          const cd = Array.isArray(data?.cdlist) ? data.cdlist[0] : null
          const rawSongs: any[] = Array.isArray(cd?.songlist) ? cd.songlist : []
          if (!cd || rawSongs.length === 0) {
            res.statusCode = 404
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: '未获取到歌单曲目，请确认歌单已设为公开' }))
            return
          }
          const maxTracks = Math.max(1, Math.min(50, Number(body.limit) || 20))
          const selected = rawSongs.slice(0, maxTracks)
          const tracks: any[] = []
          for (let i = 0; i < selected.length; i += 4) {
            const batch = selected.slice(i, i + 4)
            const resolved = await Promise.all(
              batch.map(async (song, offset) => {
                const title = String(song.songname || song.name || '未命名歌曲').trim()
                const artist = Array.isArray(song.singer)
                  ? song.singer.map((s: any) => s?.name).filter(Boolean).join(' / ') || '未知歌手'
                  : '未知歌手'
                const albummid = String(song.albummid || song.album?.mid || '').trim()
                const songmid = String(song.songmid || song.mid || '').trim()
                const lyrics = await fetchQqTrackLyric(songmid)
                return {
                  title,
                  artist,
                  coverUrl: albummid
                    ? `https://y.gtimg.cn/music/photo_new/T002R300x300M000${albummid}.jpg`
                    : '',
                  platform: 'qq',
                  url: '',
                  lyrics,
                  description: songmid ? `https://y.qq.com/n/ryqq/songDetail/${songmid}` : '',
                  orderIndex: i + offset,
                  isVisible: true,
                }
              }),
            )
            tracks.push(...resolved)
          }
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({
              status: 'success',
              data: {
                playlistId,
                playlistName: String(cd.dissname || `QQ 歌单 ${playlistId}`),
                tracks,
              },
            }),
          )
        } catch (err: any) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: err?.message || '拉取 QQ 音乐歌单失败' }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), qqPlaylistDevPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('/three/') || id.includes('\\three\\')) {
              return 'three-vendor';
            }
            if (id.includes('echarts') || id.includes('zrender')) {
              return 'echarts-vendor';
            }
            if (id.includes('antd') || id.includes('@ant-design')) {
              return 'antd-vendor';
            }
            if (id.includes('framer-motion')) {
              return 'motion-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'icons-vendor';
            }
            if (id.includes('yet-another-react-lightbox')) {
              return 'lightbox-vendor';
            }
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'react-vendor';
            }
            return 'vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1500,
    minify: 'esbuild', // Faster than terser, and builtin
    sourcemap: false,
    cssCodeSplit: true,
  },
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: process.env.VITE_PROXY_TARGET || 'https://hyxhhh.site',
        changeOrigin: true,
        secure: true,
      },
      '/uploads': {
        target: process.env.VITE_PROXY_TARGET || 'https://hyxhhh.site',
        changeOrigin: true,
        secure: true,
      },
    },
  },
  preview: {
    port: 5173,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'antd'],
  },
})
