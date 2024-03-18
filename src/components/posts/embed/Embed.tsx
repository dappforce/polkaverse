import clsx from 'clsx'
import { useEffect, useMemo, useRef, useState } from 'react'
import LiteYouTubeEmbed from 'react-lite-youtube-embed'
import { InstagramEmbed, TikTokEmbed } from 'react-social-media-embed'
import { Tweet } from 'react-tweet'
import styles from './Embed.module.sass'

type EmbedProps = {
  link: string
  className?: string
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

export const allowEmbedList = [
  {
    name: 'Youtube' as const,
    checker: (link: string) => YOUTUBE_REGEX.test(link),
    url: 'youtube.com',
  },
  {
    name: 'Gleev (Joystream)' as const,
    checker: (link: string) => {
      return link.includes('gleev.xyz') && !!getGleevVideoId(link)
    },
    url: 'gleev.xyz',
  },
  {
    name: 'X' as const,
    checker: (link: string) =>
      (/(?:https?:\/\/)?(?:www\.)?(?:x\.com)\/(.+)/.test(link) ||
        /(?:https?:\/\/)?(?:www\.)?(?:twitter\.com)\/(.+)/.test(link)) &&
      /\/status\/\d+/.test(link),
    url: 'x.com',
  },
  {
    name: 'Instagram' as const,
    checker: (link: string) => /(?:https?:\/\/)?(?:www\.)?(?:instagram\.com)\/(.+)/.test(link),
    url: 'instagram.com',
  },
  {
    name: 'Tiktok' as const,
    checker: (link: string) => /(?:https?:\/\/)?(?:www\.)?(?:tiktok\.com)\/(.+)/.test(link),
    url: 'tiktok.com',
  },
  {
    name: 'Vimeo' as const,
    checker: (link: string) => {
      return VIMEO_REGEX.test(link) && !!getVimeoVideoId(link)
    },
    url: 'vimeo.com',
  },
  {
    name: 'SoundCloud' as const,
    checker: (link: string) => link.includes('soundcloud.com'),
    url: 'soundcloud.com',
  },
] satisfies { name: string; checker: (link: string) => boolean; url: string }[]
type AllowedList = (typeof allowEmbedList)[number]['name']
const componentMap: {
  [key in AllowedList]?: (props: { src: string }) => JSX.Element | null
} = {
  Youtube: ({ src }) => (
    <div
      className={clsx('RoundedLarge')}
      style={{
        paddingBottom: '56.25%',
        position: 'relative',
        display: 'block',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <YoutubeEmbed src={src} />
    </div>
  ),
  Instagram: ({ src }) => {
    return (
      <div className={clsx(styles.CustomEmbedWrapper, 'RoundedLarge')}>
        <InstagramEmbed url={src} key={src} />
      </div>
    )
  },
  Tiktok: ({ src }) => (
    <div className={clsx(styles.CustomEmbedWrapper, 'RoundedLarge')}>
      <TikTokEmbed key={src} url={src} />
    </div>
  ),
  X: ({ src }) => {
    const urlWithoutQuery = src.split('?')[0]
    const tweetId = urlWithoutQuery.split('/').pop()
    if (!tweetId) return null
    return (
      <div className={clsx('w-100', styles.Tweet, styles.CustomEmbedWrapper, 'light RoundedLarge')}>
        <Tweet id={tweetId} />
      </div>
    )
  },
}

const getEmbedUrl = (url: string, embed: AllowedList | undefined) => {
  if (!embed) return

  const urls: { [key in AllowedList]?: string } = {
    Vimeo: `https://player.vimeo.com/video/${getVimeoVideoId(url)}`,
    Youtube: `https://www.youtube.com/embed/${getYoutubeVideoId(url)}`,
    SoundCloud: `https://w.soundcloud.com/player/
      ?url=${url}&amp;auto_play=false&amp;hide_related=true&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;visual=true`,
    'Gleev (Joystream)': `https://gleev.xyz/embedded/video/${getGleevVideoId(url)}`,
  }

  return urls[embed] || url
}

export function getEmbedLinkType(link: string | undefined) {
  if (!link) return undefined
  const foundEmbed = allowEmbedList.find(embed => embed.checker(link))
  if (!foundEmbed) return undefined

  return foundEmbed.name
}

const Embed = ({ link, className }: EmbedProps) => {
  const embed = getEmbedLinkType(link)
  const src = getEmbedUrl(link, embed)

  if (!src || !embed) return null
  let Component = componentMap[embed]

  if (Component) {
    return (
      <div className={className}>
        <Component src={src} />
      </div>
    )
  }

  return (
    <div className={className}>
      {src && (
        <div
          className={clsx('RoundedLarge')}
          style={{
            paddingBottom: '56.25%',
            position: 'relative',
            display: 'block',
            width: '100%',
            overflow: 'hidden',
          }}
        >
          <GeneralEmbed src={src} />
        </div>
      )}
    </div>
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
