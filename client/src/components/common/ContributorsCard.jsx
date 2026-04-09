import React, { useState } from "react";
import { motion as Motion } from "framer-motion";
import {
  Code2,
  ExternalLink,
  Github,
  Globe,
  Linkedin,
  Mail,
  Sparkles,
  Twitter,
} from "lucide-react";

const socialIcons = {
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  website: Globe,
  email: Mail,
};

const spring = {
  type: "spring",
  stiffness: 180,
  damping: 24,
  mass: 0.8,
};

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((part) => part[0] || "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

const ContributorsCard = ({ contributor }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const initials = getInitials(contributor.name);
  const quickSocials = (contributor.socials || []).slice(0, 3);
  const detailSections = [
    {
      key: "bio",
      isVisible: Boolean(contributor.bio),
      content: (
        <p className="mb-4 border-l-2 border-amber-200/70 pl-3 text-sm leading-relaxed text-zinc-100/90">
          {contributor.bio}
        </p>
      ),
    },
    {
      key: "tech",
      isVisible: contributor.techStack?.length > 0,
      content: (
        <div className="mb-4">
          <div className="mb-2 flex items-center gap-2 text-amber-50">
            <Code2 size={15} />
            <span className="text-xs uppercase tracking-[0.16em]">
              Tech Specialization
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {contributor.techStack?.map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-white/35 bg-white/10 px-3 py-1 text-xs font-medium text-zinc-100"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      ),
    },
    {
      key: "building",
      isVisible: Boolean(contributor.currentlyBuilding),
      content: (
        <div className="mb-1 rounded-xl border border-amber-100/30 bg-black/15 p-3">
          <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-amber-100">
            <Sparkles size={14} />
            Currently Building
          </p>
          <p className="mt-1 text-sm text-zinc-100/90">
            {contributor.currentlyBuilding}
          </p>
        </div>
      ),
    },
  ];

  const renderDetails = () => (
    <>
      {detailSections
        .filter((section) => section.isVisible)
        .map((section) => (
          <React.Fragment key={section.key}>{section.content}</React.Fragment>
        ))}
    </>
  );

  return (
    <Motion.article
      layout
      transition={spring}
      onHoverStart={() => setIsExpanded(true)}
      onHoverEnd={() => setIsExpanded(false)}
      onFocusCapture={() => setIsExpanded(true)}
      onBlurCapture={() => setIsExpanded(false)}
      animate={{
        y: isExpanded ? -10 : 0,
        opacity: isExpanded ? 1 : 0.9,
      }}
      className="group relative h-full"
    >
      <Motion.div
        layout
        transition={spring}
        className={`relative z-10 overflow-hidden rounded-2xl border border-amber-100/20 bg-white/10 p-5 backdrop-blur-xl shadow-[0_16px_45px_rgba(0,0,0,0.35)] ${
          isExpanded
            ? "lg:aspect-auto lg:min-h-120"
            : "lg:aspect-square"
        }`}
      >
        <Motion.div
          className="pointer-events-none absolute inset-x-8 top-3 h-16 rounded-full bg-linear-to-r from-amber-400/20 via-yellow-100/30 to-orange-400/20 blur-xl"
          animate={{ opacity: isExpanded ? 1 : 0.8, scale: isExpanded ? 1.04 : 1 }}
          transition={spring}
        />
        <Motion.div
          className="pointer-events-none absolute inset-0 rounded-2xl bg-[linear-gradient(130deg,transparent_35%,rgba(255,255,255,0.22)_50%,transparent_65%)]"
          animate={{ opacity: isExpanded ? 1 : 0 }}
          transition={{ duration: 0.25 }}
        />

        <div className="relative">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-25 w-25 shrink-0 overflow-hidden rounded-xl border border-white/40 bg-white/20 shadow-lg">
              {contributor.image ? (
                <Motion.img
                  src={contributor.image}
                  alt={contributor.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  animate={{ scale: isExpanded ? 1.03 : 1 }}
                  transition={spring}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-white">
                  {initials}
                </div>
              )}
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-amber-100/80">
                Contributor
              </p>
              <h3 className="text-2xl leading-tight text-white">
                {contributor.name}
              </h3>
              <p className="mt-2 text-sm text-zinc-100/90">
                {contributor.specialization}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mb-2">
            {quickSocials.map((social) => {
              const Icon = socialIcons[social.type] || ExternalLink;
              return (
                <a
                  key={`${contributor.name}-quick-${social.type}`}
                  href={social.url}
                  target={social.type === "email" ? "_self" : "_blank"}
                  rel={
                    social.type === "email" ? undefined : "noopener noreferrer"
                  }
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-white/10 px-3 py-1.5 text-xs text-zinc-50 transition-colors duration-200 hover:bg-white/20"
                  aria-label={`${contributor.name} ${social.label}`}
                >
                  <Icon size={13} />
                  {social.label}
                </a>
              );
            })}
          </div>
        </div>

        <div className="mt-4 border-t border-white/20 pt-4 lg:hidden">
          {renderDetails()}
        </div>

        <Motion.div
          initial={{opacity: 0}}
          animate={{
            height: isExpanded ? "auto" : 0,
            opacity: isExpanded ? 1 : 0,
            y: isExpanded ? 0 : 12,
          }}
          transition={spring}
          className="hidden overflow-hidden border-t border-white/20 lg:block"
        >
          <div className="pt-4">{renderDetails()}</div>
        </Motion.div>
      </Motion.div>
    </Motion.article>
  );
};

export default ContributorsCard;
