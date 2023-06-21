// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import clsx from 'clsx'

type EmbedProps = {
  link: string
  className?: string
}

const allowEmbedList = ['vimeo', 'youtube', 'youtu.be', 'soundcloud']

const getEmbedUrl = (url: string, embed: string | undefined) => {
  if (!embed) return

  const urls: Record<string, string> = {
    vimeo: `https://player.vimeo.com/video/${url.split('/').pop()}`,
    youtube: `https://www.youtube.com/embed/${url.split('=').pop()}`,
    'youtu.be': `https://www.youtube.com/embed/${url.split('/').pop()}`,
    soundcloud: `https://w.soundcloud.com/player/
      ?url=${url}&amp;auto_play=false&amp;hide_related=true&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;visual=true`,
  }

  return urls[embed]
}

const Embed = ({ link, className }: EmbedProps) => {
  const embed = allowEmbedList.find(embed => link.includes(embed))
  const src = getEmbedUrl(link, embed)

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
        </div>
      )}
    </>
  )
}

export default Embed
