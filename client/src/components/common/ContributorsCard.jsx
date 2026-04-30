import React, { Suspense } from "react";
import { motion } from "framer-motion";
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

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((part) => part[0] || "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

const ContributorsCard = ({ contributor }) => {
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
    <article className="group relative h-full mb-6 inline-block w-full break-inside-avoid">
      <motion.div
        whileHover={{ y: -8, rotateY: 2 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative z-10 overflow-hidden group rounded-2xl border border-amber-100/20 bg-white/10 p-5 backdrop-blur-xl shadow-[0_16px_45px_rgba(0,0,0,0.35)] hover:z-88888 transform transition-transform duration-300 ease-in-out"
      >
        <div
          className="pointer-events-none absolute inset-x-8 top-3 h-16 rounded-full bg-linear-to-r from-amber-400/20 via-yellow-100/30 to-orange-400/20 blur-xl"
          style={{ opacity: 1 }}
        />
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl bg-[linear-gradient(130deg,transparent_35%,rgba(255,255,255,0.22)_50%,transparent_65%)]"
          style={{ opacity: 1 }}
        />

        <div className="relative">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-25 w-25 shrink-0 overflow-hidden rounded-xl border border-white/40 bg-white/20 group-hover:scale-105  group-hover:z-44444 shadow-black group-hover:shadow-2xl delay-100 transition-transform duration-300 ease-in-out">
              {contributor.image ? (
                <img
                  src={contributor.image}
                  alt={contributor.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
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
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-white/10 px-3 py-1.5 text-xs text-zinc-50"
                  aria-label={`${contributor.name} ${social.label}`}
                >
                  <Icon size={13} />
                  {social.label}
                </a>
              );
            })}
          </div>
        </div>

        <div className="mt-4 border-t border-white/20 pt-4">
          {renderDetails()}
        </div>
      </motion.div>
    </article>
  );
};

export default ContributorsCard;
