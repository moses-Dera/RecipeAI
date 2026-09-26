"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import Image from "next/image";
import { useSession } from "next-auth/react";

export default function FinalCta() {
  const { data: session } = useSession();

  return (
    <section className="w-full py-8 md:py-12 relative">
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full bg-brand-primary rounded-[2.5rem] p-8 md:py-12 md:px-8 relative overflow-hidden flex flex-col items-center text-center border-4 border-brand-primary/20 shadow-2xl"
      >
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <Image src="/images/partyjollof2.jpeg" alt="Texture" fill className="object-cover" />
        </div>
        <div className="absolute inset-0 bg-brand-primary/90 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white mb-4 tracking-tight leading-tight">
            Ready to cook like a Nigerian grandmother?
          </h2>
          
          <p className="text-base md:text-lg text-white/90 font-sans mb-8 max-w-xl leading-relaxed">
            Join thousands of food lovers preserving and mastering authentic West African cuisine. 
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            {session ? (
              <Link 
                href="/recipe/create" 
                className="bg-bg-surface text-brand-primary px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-xl"
              >
                Share a Recipe
                <FiArrowRight />
              </Link>
            ) : (
              <Link 
                href="/recipe/create" 
                className="bg-bg-surface text-brand-primary px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-xl"
              >
                Share a Recipe
                <FiArrowRight />
              </Link>
            )}
            <Link 
              href="/explore" 
              className="bg-brand-primary border-2 border-white/20 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition-colors flex items-center justify-center"
            >
              Explore Recipes
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
