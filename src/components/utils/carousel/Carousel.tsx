import { EmblaOptionsType } from 'embla-carousel'
import Autoplay from 'embla-carousel-autoplay'
import useEmblaCarousel from 'embla-carousel-react'
import React, { ReactNode } from 'react'

type PropType = {
  slides: ReactNode[]
  options?: EmblaOptionsType
}

const Carousel: React.FC<PropType> = props => {
  const { slides, options } = props
  const [emblaRef] = useEmblaCarousel(options, [
    Autoplay({ delay: 5000, stopOnInteraction: false }),
  ])

  // const onButtonClick = useCallback((emblaApi: EmblaCarouselType) => {
  //   const { autoplay } = emblaApi.plugins()
  //   if (!autoplay) return
  //   if (autoplay.options.stopOnInteraction !== false) autoplay.stop()
  // }, [])

  // const { selectedIndex, scrollSnaps, onDotButtonClick } = useDotButton(emblaApi, onButtonClick)

  return (
    <div className='embla'>
      <div className='embla__viewport' ref={emblaRef}>
        <div className='embla__container'>
          {slides.map((slide, index) => (
            <div className='embla__slide' key={index}>
              <div className='embla__slide__content'>{slide}</div>
            </div>
          ))}
        </div>
      </div>

      {/* <div className='embla__dots'>
        {scrollSnaps.map((_, index) => (
          <DotButton
            key={index}
            onClick={() => onDotButtonClick(index)}
            className={'embla__dot'.concat(index === selectedIndex ? ' embla__dot--selected' : '')}
          />
        ))}
      </div> */}
    </div>
  )
}

export default Carousel
