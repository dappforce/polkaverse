import clsx from 'clsx'
import { useEffect, useMemo, useRef, useState } from 'react'
import LiteYouTubeEmbed from 'react-lite-youtube-embed'
import styles from './Embed.module.sass'

type EmbedProps = {
  link: string
  className?: string
}

const allowEmbedList = ['vimeo', 'youtube', 'youtu.be', 'soundcloud', 'gleev'] as const
const componentMap: {
  [key in (typeof allowEmbedList)[number]]?: (props: { src: string }) => JSX.Element | null
} = {
  'youtu.be': YoutubeEmbed,
  youtube: YoutubeEmbed,
}

const YOUTUBE_REGEX = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/
export function getYoutubeVideoId(youtubeLink: string) {
  const match = youtubeLink.match(YOUTUBE_REGEX)
  const id = decodeURIComponent(match?.[2] ?? '')
  if (id.length === 11) {
    return id
  } else {
    return undefined
  }
}

const VIMEO_REGEX = /^.*(vimeo\.com\/)((channels\/[A-z]+\/)|(groups\/[A-z]+\/videos\/))?([0-9]+)/
export function getVimeoVideoId(vimeoLink: string) {
  const parseUrl = vimeoLink.match(VIMEO_REGEX)
  if (!parseUrl) return undefined
  return parseUrl[5]
}

export function getGleevVideoId(gleevLink: string) {
  const url = gleevLink.split('?')[0]
  return url.split('/').pop()
}

const getEmbedUrl = (url: string, embed: string | undefined) => {
  if (!embed) return

  const urls: Record<string, string> = {
    vimeo: `https://player.vimeo.com/video/${getVimeoVideoId(url)}`,
    youtube: `https://www.youtube.com/embed/${getYoutubeVideoId(url)}`,
    'youtu.be': `https://www.youtube.com/embed/${getYoutubeVideoId(url)}`,
    soundcloud: `https://w.soundcloud.com/player/
      ?url=${url}&amp;auto_play=false&amp;hide_related=true&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;visual=true`,
    gleev: `https://gleev.xyz/embedded/video/${getGleevVideoId(url)}`,
  }

  return urls[embed]
}

export function getEmbedLinkType(link: string | undefined) {
  if (!link) return undefined
  const foundEmbed = allowEmbedList.find(embed => link.includes(embed))
  if (!foundEmbed) return undefined

  if (foundEmbed === 'youtu.be' || foundEmbed === 'youtube') {
    return getYoutubeVideoId(link) ? foundEmbed : undefined
  }
  if (foundEmbed === 'gleev') {
    return getGleevVideoId(link) ? foundEmbed : undefined
  }
  if (foundEmbed === 'vimeo') {
    return getVimeoVideoId(link) ? foundEmbed : undefined
  }

  return foundEmbed
}

const Embed = ({ link, className }: EmbedProps) => {
  const embed = getEmbedLinkType(link)
  const src = getEmbedUrl(link, embed)

  if (!src) return null
  let Component = componentMap[embed as (typeof allowEmbedList)[number]] || GeneralEmbed

  return (
    <>
      {src && (
        <div
          className={clsx('RoundedLarge', className)}
          style={{
            paddingBottom: '56.25%',
            position: 'relative',
            display: 'block',
            width: '100%',
            overflow: 'hidden',
          }}
        >
          <Component src={src} />
        </div>
      )}
    </>
  )
}

const thumbnail = ['maxresdefault', 'sddefault', 'hqdefault', 'mqdefault', 'default'] as const
export type ThumbnailRes = (typeof thumbnail)[number]

export function YoutubeThumbnailChecker({
  setThumbnailRes,
  src,
}: {
  src: string
  setThumbnailRes: (res: ThumbnailRes) => void
}) {
  const currentRetries = useRef(0)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const youtubeId = useMemo(() => getYoutubeVideoId(src), [src])
  const [res, setRes] = useState(0)
  useEffect(() => {
    setThumbnailRes(thumbnail[res])
  }, [res])

  useEffect(() => {
    function checkImage() {
      if (imgRef.current?.complete) {
        if (imgRef.current.naturalWidth === 120 && imgRef.current.naturalHeight === 90) {
          if (res < thumbnail.length - 1) {
            setRes(res + 1)
          }
        }
      } else {
        currentRetries.current++
        if (currentRetries.current <= 5)
          setTimeout(() => {
            checkImage()
          }, 200)
      }
    }
    checkImage()
  }, [res])

  return (
    <img
      ref={imgRef}
      style={{ display: 'none' }}
      src={`https://i3.ytimg.com/vi/${youtubeId}/${thumbnail[res]}.jpg`}
    />
  )
}

function YoutubeEmbed({ src }: { src: string }) {
  const youtubeId = useMemo(() => getYoutubeVideoId(src), [src])
  const [thumbnailRes, setThumbnailRes] = useState<ThumbnailRes>('maxresdefault')

  if (!youtubeId) return null

  return (
    <>
      <YoutubeThumbnailChecker src={src} setThumbnailRes={setThumbnailRes} />
      <LiteYouTubeEmbed
        id={youtubeId}
        adNetwork={true}
        params=''
        playlist={false}
        poster={thumbnailRes}
        title='YouTube Embed'
        noCookie={true}
        wrapperClass={clsx(styles.YoutubeEmbedWrapper)}
        activatedClass='youtube-activated'
        playerClass={clsx(styles.YoutubeEmbedPlayer)}
        iframeClass={styles.YoutubeEmbedIframe}
        aspectHeight={9}
        aspectWidth={16}
      />
    </>
  )
}

function GeneralEmbed({ src }: { src: string }) {
  return (
    <iframe
      width='100%'
      height='100%'
      src={src}
      frameBorder='0'
      loading='lazy'
      allow='autoplay; encrypted-media; picture-in-picture;'
      allowFullScreen
      title='Embedded'
      style={{ position: 'absolute', top: 0, left: 0 }}
    />
  )
}

export default Embed
