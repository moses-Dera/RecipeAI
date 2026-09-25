"use client";

import { motion } from "framer-motion";
import { FiMessageSquare, FiHeart, FiStar } from "react-icons/fi";
import Image from "next/image";
import Link from "next/link";

export default function AiFeatureHighlight() {
  return (
    <section className="w-full py-10 md:py-16 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-[120px] -translate-y-1/2" />
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-accent-blue/10 rounded-full blur-[120px] -translate-y-1/2" />

      <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        
        {/* Left: Text Content */}
        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/10 text-brand-primary font-bold text-sm mb-6"
          >
            <FiStar className="animate-pulse" />
            <span>AI-Powered Culinary Assistant</span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-text-primary tracking-tight mb-6"
          >
            Meet <span className="text-brand-primary italic">Chef Ada</span>
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg text-text-secondary font-sans leading-relaxed mb-8 max-w-lg"
          >
            Think of her as your personal Nigerian grandmother in the kitchen. Whether you need a substitute for iru, want to know how to get that authentic &quot;smoky&quot; jollof flavor, or have a dietary restriction, Chef Ada has the answer.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Link href="/chat" className="inline-flex flex-row items-center gap-3 bg-bg-surface border-2 border-brand-primary text-brand-primary px-8 py-4 rounded-full font-bold text-lg hover:bg-brand-primary hover:text-white transition-colors group shadow-lg shadow-brand-primary/20">
              <FiMessageSquare className="group-hover:scale-110 transition-transform" />
              Chat with Chef Ada
            </Link>
          </motion.div>
        </div>

        {/* Right: Mock Chat UI */}
        <div className="w-full lg:w-1/2 relative z-10">
          <div className="relative w-full max-w-md mx-auto bg-bg-surface rounded-[2.5rem] border border-text-secondary/10 shadow-2xl p-6 lg:p-8">
            
            {/* Header */}
            <div className="flex items-center gap-4 mb-8 border-b border-text-secondary/10 pb-6">
              <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-brand-primary">
                <Image src="/images/chef_ada_avatar.jpg" alt="Chef Ada" fill className="object-cover" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-text-primary text-lg">Chef Ada</h3>
                <p className="text-brand-primary text-xs font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Online
                </p>
              </div>
            </div>

            {/* Chat Bubbles */}
            <div className="flex flex-col gap-6">
              <motion.div 
                initial={{ opacity: 0, x: 20, scale: 0.9 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="self-end bg-brand-primary/10 text-text-primary p-4 rounded-2xl rounded-tr-sm max-w-[85%]"
              >
                <p className="text-sm font-medium">How do I make my Jollof rice smoky if I don&apos;t have firewood?</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: -20, scale: 0.9 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="self-start bg-brand-primary text-white p-4 rounded-2xl rounded-tl-sm max-w-[90%] shadow-lg shadow-brand-primary/20"
              >
                <p className="text-sm font-medium leading-relaxed">
                  Ah! The secret to that authentic party jollof smoke is letting the bottom burn just a little bit—we call it the &quot;bottom pot&quot;. 
                  <br/><br/>
                  You can also roast your tatashe and tomatoes in the oven before blending!
                </p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 1.4 }}
                className="self-end"
              >
                <div className="w-8 h-8 bg-accent-warm text-white rounded-full flex items-center justify-center shadow-md">
                  <FiHeart size={14} />
                </div>
              </motion.div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
