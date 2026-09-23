"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { FiStar } from "react-icons/fi";

export default function LandingHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Add spring physics for buttery smooth inertia when scrolling stops
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // As we scroll down, cards slowly drift completely out of frame
  const leftCardX = useTransform(smoothProgress, [0, 1], [0, -150]);
  const leftCardRotate = useTransform(smoothProgress, [0, 1], [0, -25]);
  const leftCardY = useTransform(smoothProgress, [0, 1], [0, 50]);
  
  const rightCardX = useTransform(smoothProgress, [0, 1], [0, 150]);
  const rightCardRotate = useTransform(smoothProgress, [0, 1], [0, 25]);
  const rightCardY = useTransform(smoothProgress, [0, 1], [0, 50]);

  // Front card slowly drops down and away
  const centerCardY = useTransform(smoothProgress, [0, 1], [0, 150]);
  const centerCardRotate = useTransform(smoothProgress, [0, 1], [0, -5]);
  const centerCardScale = useTransform(smoothProgress, [0, 1], [1, 0.9]);

  return (
    <section ref={containerRef} className="relative w-full min-h-[600px] rounded-3xl overflow-hidden bg-bg-surface shadow-lg flex items-center justify-between px-8 py-16 md:px-16 border border-text-secondary/10">
      
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-bg-surface via-bg-surface/90 to-transparent z-10" />
      {/* Softened Glow */}
      <div className="absolute top-0 right-0 w-2/3 h-full bg-brand-primary/5 blur-[100px]" />

      {/* Text Content */}
      <div className="relative z-20 flex flex-col items-start h-full justify-center max-w-xl">
        <motion.h1 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="font-heading text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-text-primary drop-shadow-sm mb-6 leading-tight"
        >
          Discover the Soul of <br />
          <span className="text-brand-primary">Nigerian Cooking</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
          className="text-base md:text-lg text-text-secondary font-sans mb-8 leading-relaxed"
        >
          Let Chef Ada guide you through generations of flavor. Save, share, and master traditional dishes like never before.
        </motion.p>
        
        <Link href="/explore">
          <motion.button 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-brand-primary text-white px-8 py-4 rounded-full font-bold text-lg"
          >
            Explore Recipes
          </motion.button>
        </Link>
      </div>

      {/* Creative Stacked Images with Scroll Animation */}
      <div className="hidden lg:block relative z-10 w-[500px] h-[400px]">
        {/* Back Card (Left) */}
        <motion.div
          initial={{ opacity: 0, x: 100, rotate: 0 }}
          animate={{ opacity: 0.9, x: -40, rotate: -15 }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
          className="absolute top-10 left-0 w-64 h-80"
        >
          <motion.div
            style={{ x: leftCardX, y: leftCardY, rotate: leftCardRotate }}
            className="w-full h-full rounded-2xl overflow-hidden border-4 border-bg-surface shadow-xl"
          >
            <Image src="/images/home.jpeg" alt="Chef Ada" fill className="object-cover" />
            {/* Removed the dark overlay to make it brighter */}
          </motion.div>
        </motion.div>

        {/* Back Card (Right) */}
        <motion.div
          initial={{ opacity: 0, x: -100, rotate: 0 }}
          animate={{ opacity: 0.95, x: 120, rotate: 15 }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
          className="absolute top-10 right-0 w-64 h-80"
        >
          <motion.div
            style={{ x: rightCardX, y: rightCardY, rotate: rightCardRotate }}
            className="w-full h-full rounded-2xl overflow-hidden border-4 border-bg-surface shadow-xl"
          >
            <Image src="/images/home3.jpeg" alt="Traditional Food" fill className="object-cover" />
            {/* Removed the dark overlay to make it brighter */}
          </motion.div>
        </motion.div>

        {/* Front Card (Center) */}
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.8 }}
          animate={{ opacity: 1, y: -20, scale: 1, rotate: -2 }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-96 z-20"
        >
          <motion.div
            style={{ y: centerCardY, rotate: centerCardRotate, scale: centerCardScale }}
            whileHover={{ scale: 1.05 }}
            className="w-full h-full rounded-2xl overflow-hidden shadow-2xl shadow-brand-primary/20 border-4 border-bg-surface bg-bg-primary flex flex-col justify-end"
          >
            <Image src="/images/partyjollof.jpeg" alt="Featured Recipe" fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-surface via-transparent to-transparent z-10" />
            <div className="relative z-20 p-6 bg-bg-surface/80 backdrop-blur-sm border-t border-text-secondary/10">
              <h3 className="text-text-primary font-bold font-heading text-xl">Classic Party Jollof</h3>
              <p className="text-brand-primary font-medium text-sm">45 mins • West Africa</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
