import { FC, ReactNode, useEffect, useRef } from 'react'
import styled from 'styled-components'
import Container from '../Container'
import { mq } from '../../styles.config'
import { useState } from 'react'

const Root = styled.section`
  position: relative;
  width: 100vw;
`
const StrictSlider = styled.div`
  display: grid;
  position: relative;
  width: 100vw;
  overflow-x: auto;

  scroll-snap-type: x mandatory;

  padding-left: 8vw;
  padding-right: 8vw;

  ${mq['large']} {
    scroll-padding-left: 8vw;
  }

  &::-webkit-scrollbar {
    display: none;
  }
`

const Track = styled.div<{ numberOfSlides: number }>`
  position: relative;
  display: grid;
  grid-gap: 20px;
  grid-auto-flow: column;
  // grid-auto-columns: minmax(70vw, 400px);
  grid-auto-columns: 280px 280px;
  & > * {
    scroll-snap-align: center;
  }
  ${mq['large']} {
    //   grid-auto-columns: minmax(400px, 30vw);
    grid-auto-columns: 400px;

    & > * {
      scroll-snap-align: start;
    }
  }
`
const Header = styled.div`
  display: flex;
  
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;

  h2 {
    margin: 0;
    font-size: 20px;

    ${mq['large']} {
      font-size: 40px;
    }
  }

  button {
    appearance: none;
    border: 0;
    cursor: pointer;
    background: black;
    color: white;
    display: grid;
    place-content: center;
    position: relative;

    &:before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      border: 1px solid black;
      transform: translate(2px, 2px);
    }

    &:hover {
      transform: translate(-2px, -2px);
      &:before {
        transform: translate(4px, 4px);
      }
    }

    &:active {
      transform: translate(0px, 0px);
      &:before {
        transform: translate(2px, 2px);
      }
    }

    &:disabled, &[disabled]{
      cursor: not-allowed;
      pointer-events: none;
      opacity: 0.5;
      transform: translate(0px, 0px);
      &:before {
        transform: translate(2px, 2px);
      }
    }
  }
`
const Controls = styled.div`
  display: grid;
  grid-gap: 10px;
  grid-template-columns: 44px 44px;
  grid-template-rows: 44px;
`

function isSlideIntersecting(entry: IntersectionObserverEntry, slide: Element, buttonDisable: Function) {
  if(entry.target === slide) {
    console.log(entry);
    buttonDisable(entry.isIntersecting)
  }
}

const Slider: FC<{ children: ReactNode[]; title: string }> = ({ children, title }) => {
  const sliderRef = useRef<null | HTMLDivElement>(null)
  const trackRef = useRef<null | HTMLDivElement>(null)
  const observerRef = useRef<null | IntersectionObserver>(null)

  const [isFirstSlideVisible, setIsFirstSlideVisible] = useState(true);
  const [isLastSlideVisible, setIsLastSlideVisible] = useState(false);

  const scrollSlides = (slidesToScroll: number) => {
    const sliderElem = sliderRef.current
    if (!sliderElem) return

    const slides = sliderElem.firstChild?.childNodes as NodeListOf<Element>;
    const slide1 = slides[0];
    const slide2 = slides[1];

    if (!slide1 || !slide2) return
    const slideWidth = slide1.getBoundingClientRect().width
    const gutterWidth = slide2.getBoundingClientRect().left - slide1.getBoundingClientRect().right
    const destination = slidesToScroll * slideWidth + slidesToScroll * gutterWidth
    sliderElem.scrollBy({
      left: destination,
      behavior: 'smooth'
    })

    const firstSlideRef = trackRef.current?.firstChild as Element;
    const lastSlideRef = trackRef.current?.lastChild as Element;

    if (observerRef.current) observerRef.current.disconnect() 

    observerRef.current = new IntersectionObserver(entries => { 
      entries.forEach(entry => {
        isSlideIntersecting(entry, firstSlideRef, setIsFirstSlideVisible);
        isSlideIntersecting(entry, lastSlideRef, setIsLastSlideVisible);
      });
    }, {
      threshold: 1,
      rootMargin: "100% 0% 100% 0%"
    })

    observerRef.current?.observe(firstSlideRef);
    observerRef.current?.observe(lastSlideRef);
  }

  return (
    <Root>
      <Container>
        <Header>
          <h2>{title}</h2>
          <Controls>
            <button disabled={isFirstSlideVisible} onClick={() => scrollSlides(-2)}>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M6.85355 3.14645C7.04882 3.34171 7.04882 3.65829 6.85355 3.85355L3.70711 7H12.5C12.7761 7 13 7.22386 13 7.5C13 7.77614 12.7761 8 12.5 8H3.70711L6.85355 11.1464C7.04882 11.3417 7.04882 11.6583 6.85355 11.8536C6.65829 12.0488 6.34171 12.0488 6.14645 11.8536L2.14645 7.85355C1.95118 7.65829 1.95118 7.34171 2.14645 7.14645L6.14645 3.14645C6.34171 2.95118 6.65829 2.95118 6.85355 3.14645Z"
                  fill="currentColor"
                />
              </svg>
            </button>
            <button disabled={isLastSlideVisible} onClick={() => scrollSlides(2)}>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </Controls>
        </Header>
      </Container>
      <StrictSlider ref={sliderRef}>
        <Track ref={trackRef} numberOfSlides={children?.length}>
          {children}
        </Track>
      </StrictSlider>
    </Root>
  )
}

export default Slider
