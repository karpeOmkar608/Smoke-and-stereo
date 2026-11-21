'use client';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ArrowDown, ArrowUpRight } from 'lucide-react';

export function CinematicHero({
  image,
  title,
  copy,
}: {
  image: string;
  title: string;
  copy: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '13%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '-14%']);
  const words = title.trim().split(/\s+/);
  const split = Math.max(1, words.length - 1);
  return (
    <section ref={ref} className="cinematic-hero" aria-labelledby="campaign-title">
      <motion.div className="cinematic-photo" style={reduce ? undefined : { y }}>
        <Image
          src={image}
          alt="Indian streetwear model in a monochrome concrete underpass campaign concept"
          fill
          preload
          sizes="100vw"
          unoptimized={!image.startsWith('/')}
        />
      </motion.div>
      <div className="cinematic-shade" />
      <div className="hero-topline">
        <span>INDEPENDENT INDIAN STREETWEAR</span>
        <span>DHH / STREET CULTURE / SELF EXPRESSION</span>
      </div>
      <motion.div
        className="cinematic-title"
        style={reduce ? undefined : { y: textY }}
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 id="campaign-title">
          <span>{words.slice(0, split).join(' ')}</span>
          <span>{words.slice(split).join(' ')}</span>
        </h1>
      </motion.div>
      <div className="hero-bottom">
        <div>
          <span className="eyebrow">NOT RAP MERCH. A WAY OF LIFE.</span>
          <p>{copy}</p>
          <Link className="button hero-cta" href="/new-drops">
            EXPLORE THE DROP{' '}
            <ArrowUpRight
              className="ui-icon"
              size={21}
              strokeWidth={1.5}
              aria-hidden="true"
              focusable="false"
            />
          </Link>
        </div>
        <div className="hero-side-note">
          <span className="hero-signal" aria-hidden="true">
            S/S
          </span>
          <span>
            ROOTED IN SOUND.
            <br />
            WORN WITHOUT PERMISSION.
          </span>
        </div>
      </div>
      <a className="hero-scroll" href="#manifesto">
        SCROLL TO ENTER{' '}
        <ArrowDown
          className="ui-icon"
          size={20}
          strokeWidth={1.5}
          aria-hidden="true"
          focusable="false"
        />
      </a>
    </section>
  );
}
