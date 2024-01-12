import clsx from 'clsx'
import { useMemo } from 'react'
import LiteYouTubeEmbed from 'react-lite-youtube-embed'
import styles from './Embed.module.sass'

type EmbedProps = {
  link: string
  className?: string
}

const allowEmbedList = ['vimeo', 'youtube', 'youtu.be', 'soundcloud'] as const
const componentMap: {
  [key in (typeof allowEmbedList)[number]]?: (props: { src: string }) => JSX.Element | null
} = {
  'youtu.be': YoutubeEmbed,
  youtube: YoutubeEmbed,
}

const YOUTUBE_REGEX = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/
export function getYoutubeVideoId(youtubeLink: string) {
  const match = youtubeLink.match(YOUTUBE_REGEX)
  if (match && match[2].length == 11) {
    return match[2]
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

const getEmbedUrl = (url: string, embed: string | undefined) => {
  if (!embed) return

  const urls: Record<string, string> = {
    vimeo: `https://player.vimeo.com/video/${getVimeoVideoId(url)}`,
    youtube: `https://www.youtube.com/embed/${getYoutubeVideoId(url)}`,
    'youtu.be': `https://www.youtube.com/embed/${getYoutubeVideoId(url)}`,
    soundcloud: `https://w.soundcloud.com/player/
      ?url=${url}&amp;auto_play=false&amp;hide_related=true&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;visual=true`,
  }

  return urls[embed]
}

export function getEmbedLinkType(link: string) {
  return allowEmbedList.find(embed => link.includes(embed))
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

function YoutubeEmbed({ src }: { src: string }) {
  const youtubeId = useMemo(() => getYoutubeVideoId(src), [src])
  console.log(youtubeId, src)

  if (!youtubeId) return null

  return (
    <LiteYouTubeEmbed
      id={youtubeId}
      adNetwork={true}
      params=''
      playlist={false}
      poster='maxresdefault'
      title='YouTube Embed'
      noCookie={true}
      wrapperClass={clsx(styles.YoutubeEmbedWrapper)}
      activatedClass='youtube-activated'
      playerClass={clsx(styles.YoutubeEmbedPlayer)}
      iframeClass={styles.YoutubeEmbedIframe}
      aspectHeight={9}
      aspectWidth={16}
    />
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
