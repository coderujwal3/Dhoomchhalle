import React from "react";
import Hyperspeed from "../components/common/ui/HyperSpeed";
import ContributorsCard from "../components/common/ContributorsCard";

// Importing contributors image
import MyImg from "../assets/MyPic.jpeg";

const contributors = [
  {
    name: "Ujwal Singh",
    image: MyImg,
    specialization: "Full Stack Web Developer",
    bio: "Crafts fluid complete responsive webapps. Also making the website complete safe form hackers.",
    techStack: ["React", "Node.js", "Express", "MongoDB", "Kali/Parrot Linux"],
    currentlyBuilding: "The web page you are seeing right now (Dhoomchhalle)",
    socials: [
      { type: "github", label: "GitHub", url: "https://github.com/coderujwal3" },
      { type: "linkedin", label: "LinkedIn", url: "https://linkedin.com/" },
      { type: "twitter", label: "X", url: "https://x.com/" },
    ],
  },
  {
    name: "Vishesh Kumar Modanwal",
    image: "",
    specialization: "Backend Developer",
    bio: "Designs resilient APIs and secure systems that keep products fast, stable, and production-ready from day one.",
    techStack: ["Node.js", "Express", "MongoDB", "Redis"],
    currentlyBuilding: "A modular service layer for analytics and performance insights.",
    socials: [
      { type: "github", label: "GitHub", url: "https://github.com/" },
      { type: "linkedin", label: "LinkedIn", url: "https://linkedin.com/" },
      { type: "website", label: "Portfolio", url: "https://example.com" },
    ],
  },
  {
    name: "Saket Pandey",
    image: "https://i.pravatar.cc/300?img=69",
    specialization: "Full Stack Engineer",
    bio: "Bridges design and architecture to ship complete features, from polished UI flows to robust deployment pipelines.",
    techStack: ["React", "Node.js", "PostgreSQL", "Docker"],
    currentlyBuilding: "Contributor tools for smoother collaboration and faster releases.",
    socials: [
      { type: "github", label: "GitHub", url: "https://github.com/" },
      { type: "linkedin", label: "LinkedIn", url: "https://linkedin.com/" },
      { type: "email", label: "Email", url: "mailto:hello@example.com" },
    ],
  },
  {
    name: "Ayush Agrahari",
    image: "https://i.pravatar.cc/300?img=69",
    specialization: "Full Stack Engineer",
    bio: "Bridges design and architecture to ship complete features, from polished UI flows to robust deployment pipelines.",
    techStack: ["React", "Node.js", "PostgreSQL", "Docker"],
    currentlyBuilding: "Contributor tools for smoother collaboration and faster releases.",
    socials: [
      { type: "github", label: "GitHub", url: "https://github.com/" },
      { type: "linkedin", label: "LinkedIn", url: "https://linkedin.com/" },
      { type: "email", label: "Email", url: "mailto:hello@example.com" },
    ],
  },
  {
    name: "Mangesh Kumar",
    image: "https://i.pravatar.cc/300?img=69",
    specialization: "Full Stack Engineer",
    bio: "Bridges design and architecture to ship complete features, from polished UI flows to robust deployment pipelines.",
    techStack: ["React", "Node.js", "PostgreSQL", "Docker"],
    currentlyBuilding: "Contributor tools for smoother collaboration and faster releases.",
    socials: [
      { type: "github", label: "GitHub", url: "https://github.com/" },
      { type: "linkedin", label: "LinkedIn", url: "https://linkedin.com/" },
      { type: "email", label: "Email", url: "mailto:hello@example.com" },
    ],
  },
  
];

const Contributors = () => {
  return (
    <section className="min-h-screen relative overflow-hidden bg-linear-to-br from-neutral-950 via-zinc-900 to-neutral-800 px-4 py-20">
      <Hyperspeed
        effectOptions={{
          distortion: "turbulentDistortion",
          length: 400,
          roadWidth: 10,
          islandWidth: 2,
          lanesPerRoad: 3,
          fov: 90,
          fovSpeedUp: 150,
          speedUp: 2,
          carLightsFade: 0.4,
          totalSideLightSticks: 20,
          lightPairsPerRoadWay: 40,
          shoulderLinesWidthPercentage: 0.05,
          brokenLinesWidthPercentage: 0.1,
          brokenLinesLengthPercentage: 0.5,
          lightStickWidth: [0.12, 0.5],
          lightStickHeight: [1.3, 1.7],
          movingAwaySpeed: [60, 80],
          movingCloserSpeed: [-120, -160],
          carLightsLength: [12, 80],
          carLightsRadius: [0.05, 0.14],
          carWidthPercentage: [0.3, 0.5],
          carShiftX: [-0.8, 0.8],
          carFloorSeparation: [0, 5],
          colors: {
            roadColor: 526344,
            islandColor: 657930,
            background: 0,
            shoulderLines: 1250072,
            brokenLines: 1250072,
            leftCars: [14177983, 6770850, 12732332],
            rightCars: [242627, 941733, 3294549],
            sticks: 242627,
          },
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.2),transparent_45%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(217,70,239,0.2),transparent_40%)]" />

      <div className="relative z-10 h-full max-w-6xl mx-auto">
        <div className="max-w-3xl mx-auto rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl p-6 sm:p-8 shadow-2xl mb-10">
          <p className="text-center text-xs uppercase tracking-[0.25em] text-amber-200/80 mb-2">
            Team
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl text-white text-center font-semibold leading-tight tracking-tight">
            Meet Our Contributors
          </h1>
          <p className="mt-3 text-center text-zinc-100/80 text-sm sm:text-base">
            The minds behind thoughtful design, reliable systems, and smooth
            user experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-start gap-6">
          {contributors.map((contributor) => (
            <ContributorsCard
              key={contributor.name}
              contributor={contributor}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Contributors;
