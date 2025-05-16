<template>
  <div class="landing-page">
    <!-- Hero Section -->
    <section class="hero" ref="heroSection">
      <div class="hero-text">
        <h1 class="hero-title">Smart Indirect Evaporative Cooling System</h1>
        <p class="subtitle">Sustainable cooling for a better future</p>
        <router-link to="/login" class="login-button">
          <i class="fas fa-sign-in-alt"></i>
          Access Dashboard
        </router-link>
        <!-- Scroll Indicator -->
        <div class="scroll-indicator">
          <span v-for="(_, index) in images" 
                :key="index" 
                :class="{ 'dot': true, 'active': index === currentImageIndex }">
          </span>
        </div>
      </div>
      <img :src="currentImage" alt="Cooling System" class="hero-image" />
    </section>

    <!-- Feature Cards Section -->
    <section class="features" ref="featuresSection">
      <div class="feature-grid">
        <div v-for="(card, index) in featureCards" 
             :key="index" 
             class="feature-card"
             :ref="el => { if (el) cardRefs[index] = el }">
          <div class="card-header">
            <span class="emoji">{{ card.emoji }}</span>
            <h2>{{ card.title }}</h2>
          </div>
          <h3>{{ card.subtitle }}</h3>
          <ul>
            <li v-for="(item, i) in card.items" :key="i">{{ item }}</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Team Section -->
    <section class="team" ref="teamSection">
      <h2>Our Team</h2>
      <div class="team-grid">
        <div v-for="(member, index) in teamMembers" 
             :key="member.name" 
             class="team-card"
             :ref="el => { if (el) teamCardRefs[index] = el }">
          <img :src="member.image" :alt="member.name" class="team-member-image" />
          <h3>{{ member.name }}</h3>
          <p class="member-role">{{ member.role }}</p>
          <div class="social-links">
            <a v-if="member.linkedin" :href="member.linkedin" target="_blank" rel="noopener">
              <i class="fab fa-linkedin"></i>
            </a>
            <a v-if="member.github" :href="member.github" target="_blank" rel="noopener">
              <i class="fab fa-github"></i>
            </a>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const heroSection = ref(null);
const featuresSection = ref(null);
const teamSection = ref(null);
const cardRefs = ref([]);
const teamCardRefs = ref([]);

const featureCards = [
  {
    emoji: '🧊',
    title: 'The Challenge',
    subtitle: 'Problem',
    items: [
      'Over 1 billion people lack access to cooling.',
      'Conventional ACs use energy-intensive vapor compression, contributing ~7% of global electricity use and ~3% of GHG emissions.',
      'Urgent need for sustainable, low-cost, low-energy alternatives, especially in hot, dry climates.'
    ]
  },
  {
    emoji: '💡',
    title: 'The Solution – Super-Cool',
    subtitle: 'Innovation',
    items: [
      'A novel regenerative evaporative cooler (R-EC) using only water as refrigerant.',
      'Achieves COP of 10 and ~100% wet bulb effectiveness without adding moisture to the air.',
      'Combines low cost, high efficiency, and eco-friendliness with a mobile app for smart control.'
    ]
  },
  {
    emoji: '🔧',
    title: 'Method & Development',
    subtitle: 'Methodology',
    items: [
      'Design: CAD in SolidWorks, fluid/thermal modeling via Ansys, Star CCM+.',
      'Build: Sustainable materials like aluminum and plexiglass; modular design.',
      'Testing: Lab + real-world trials, performance optimization via data analysis.',
      'Result: Energy savings up to 75% vs traditional AC.'
    ]
  },
  {
    emoji: '📈',
    title: 'Impact & Potential',
    subtitle: 'Market & Sustainability',
    items: [
      'Ideal for Turkiye\'s low-humidity regions and similar climates globally.',
      'Potential to replace vapor compression ACs in homes, cafes, hospitals, etc.',
      'Aligns with multiple UN Sustainable Development Goals.',
      'Supported by plans for TÜBİTAK funding and industry partnerships.'
    ]
  }
];

const teamMembers = [
  {
    name: "ASSOC. PROF. DR. DEVRIM AYDIN",
    image: "/people/supervisor.png",
    role: "Project Supervisor",
    linkedin: "https://www.linkedin.com/in/devrim-aydin-47875590/"
  },
  {
    name: "Albara Adam",
    image: "/people/Albara.png",
    role: "Team Leader",
    linkedin: "https://www.linkedin.com/in/albara-adam/"
  },
  {
    name: "Badraldeen Mustafa",
    image: "/people/Badr.png",
    role: "Team Member, Researcher Mechanical Engineering Graduate",
    linkedin: "https://www.linkedin.com/in/badr-alwleed-6bba2b280/"
  },
  {
    name: "Abdulrahman Hassan",
    image: "/people/Abdelrahman.png",
    role: "Team Member, Documentation Specialist Mechanical Engineering Graduate ",
    linkedin: "https://www.linkedin.com/in/abdulrahman-hassan-0ab173276/"
  },
  {
    name: "Amin Faisal",
    image: "/people/Amin.png",
    role: "Team Member, Researcher Mechanical Engineering Graduate",
    linkedin: "https://www.linkedin.com/in/amin-nagmeldin-52aab9228/"
  },
  {
    name: "Gabani Ammar",
    image: "/people/Gabani.png",
    role: "Team Member, Analyst Mechanical Engineering Last Semester",
    linkedin: "https://www.linkedin.com/in/gabani-ammar-647359344/"
  },
  {
    name: "Mohamed Abubaker",
    image: "/people/me.jpg",
    role: "Electrical & Software Specialist, Electrical & Electronic engineering Graduate",
    linkedin: "https://www.linkedin.com/in/mohamed-abubaker-baa87916a/"
  },
    {
    name: "Mohamed Yousif",
    image: "/people/j.png",
    role: "Electrical & Software AI/ML Specialist , Electrical & Electronic engineering Graduate",
    linkedin: "https://www.linkedin.com/in/mohamed-yousif-122450316/?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
  }
];

// Image cycling logic
const images = ['/System_Model.png', '/Air.png', '/cross.png'];
const currentImageIndex = ref(0);
const currentImage = ref(images[currentImageIndex.value]);

// Watch for index changes to update the image source
watch(currentImageIndex, (newIndex) => {
  // Add a small delay or use nextTick if CSS transitions aren't smooth
  currentImage.value = images[newIndex];
});

onMounted(() => {
  // Use matchMedia for responsive ScrollTrigger setup
  ScrollTrigger.matchMedia({
    // Desktop setup (screens wider than 768px)
    "(min-width: 769px)": () => {
      ScrollTrigger.create({
        trigger: heroSection.value,
        start: 'top top',
        end: `+=${window.innerHeight * (images.length - 1)}`,
        pin: true,
        scrub: 0.5,
        onUpdate: (self) => {
          const progress = self.progress;
          const index = Math.min(images.length - 1, Math.floor(progress * images.length));
          if (index !== currentImageIndex.value) {
            currentImageIndex.value = index;
          }
        },
      });
    },

    // Mobile setup (screens 768px wide or less)
    "(max-width: 768px)": () => {
      // On mobile, we don't pin or scrub.
      // Ensure the first image is shown and stays that way.
      currentImageIndex.value = 0;
      currentImage.value = images[0];
      // Any previously created ScrollTriggers for this media query range are automatically killed.
    }
  });

  // Feature cards animations
  cardRefs.value.forEach((card, index) => {
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top bottom-=100',
        toggleActions: 'play none none reverse'
      },
      y: 100,
      opacity: 0,
      duration: 0.8,
      delay: index * 0.2,
      ease: 'power3.out'
    });
  });

  // Team cards animations
  teamCardRefs.value.forEach((card, index) => {
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top bottom-=100',
        toggleActions: 'play none none reverse'
      },
      y: 50,
      opacity: 0,
      duration: 0.6,
      delay: index * 0.2,
      ease: 'power3.out'
    });
  });
});
</script>

<style scoped>
.landing-page {
  margin: 0 auto;
}

.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-12);
  text-align: left;
  margin-bottom: var(--space-12);
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, transparent 100%);
  padding: var(--space-4) var(--space-12);
  width: 100%;
  box-sizing: border-box;
}

.hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 20%, rgba(37, 99, 235, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(37, 99, 235, 0.1) 0%, transparent 50%);
  z-index: -1;
  animation: gradientShift 15s ease infinite;
}

@keyframes gradientShift {
  0% {
    background-position: 0% 0%;
  }
  50% {
    background-position: 100% 100%;
  }
  100% {
    background-position: 0% 0%;
  }
}

.hero-text {
  flex: 1;
  max-width: 600px;
  position: relative;
  z-index: 1;
  display: flex; /* Enable flex column for indicator positioning */
  flex-direction: column; /* Stack text elements */
}

.hero h1 {
  font-size: clamp(2.5rem, 4.5vw, 4rem);
  margin-bottom: var(--space-4);
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.2;
  font-weight: 800;
  letter-spacing: -0.02em;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 0;
}

.subtitle {
  font-size: clamp(1.1rem, 2vw, 1.5rem);
  color: var(--text-secondary);
  margin-bottom: var(--space-8);
  font-weight: 500;
  opacity: 0.9;
  line-height: 1.5;
  padding: 0;
}

.scroll-indicator {
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-6); /* Space above indicator */
  justify-content: flex-start; /* Align to left */
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: var(--text-secondary);
  opacity: 0.4;
  transition: opacity 0.3s ease;
}

.dot.active {
  opacity: 1;
  background-color: #2563eb; /* Use primary color */
}

.hero-image {
  flex: 1;
  max-width: 50%;
  height: auto;
  max-height: 70vh;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  object-fit: contain;
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  transform-style: preserve-3d;
  padding: 0;
  position: relative;
  background: transparent;
  border: 2px solid transparent;
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease, opacity 0.5s ease-in-out;
  opacity: 1;
  margin-right: auto;
}

.hero-image:hover {
  transform: scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  border-color: #3b82f6;
}

@media (prefers-color-scheme: dark) {
  .hero-image {
    background: transparent;
  }
  
  .hero-image:hover {
    background: transparent;
  }
}

.features {
  margin-bottom: var(--space-12);
  position: relative;
  padding: var(--space-12) 0;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-8);
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-6);
}

.feature-card {
  background: var(--card-background);
  border-radius: var(--radius-lg);
  padding: var(--space-8);
  box-shadow: var(--shadow);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid var(--border);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #2563eb, #3b82f6);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.feature-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: var(--shadow-lg);
}

.feature-card:hover::before {
  transform: scaleX(1);
}

.card-header {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.emoji {
  font-size: 3rem;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.feature-card h2 {
  font-size: 2rem;
  margin: 0;
  color: var(--text-primary);
  font-weight: 700;
}

.feature-card h3 {
  font-size: 1.25rem;
  color: var(--text-secondary);
  margin-bottom: var(--space-4);
  font-weight: 500;
}

.feature-card li {
  margin-bottom: var(--space-4);
  position: relative;
  padding-left: 0;
  line-height: 1.6;
  color: var(--text-secondary);
  list-style-type: none;
}

.feature-card li::before {
  display: none;
}

.team {
  text-align: center;
  margin-bottom: var(--space-12);
  position: relative;
  padding: var(--space-12) 0;
}

.team h2 {
  font-size: 3rem;
  margin-bottom: var(--space-12);
  color: var(--text-primary);
  position: relative;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.team h2::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 4px;
  background: linear-gradient(90deg, #2563eb, #3b82f6);
  border-radius: var(--radius-full);
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-8);
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-6);
}

.team-card {
  background: var(--card-background);
  border-radius: var(--radius-lg);
  padding: var(--space-8);
  box-shadow: var(--shadow);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid var(--border);
  backdrop-filter: blur(10px);
}

.team-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: var(--shadow-lg);
}

.team-member-image {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  margin-bottom: var(--space-4);
  object-fit: cover;
  border: 4px solid #2563eb;
  box-shadow: var(--shadow-md);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.team-card:hover .team-member-image {
  transform: scale(1.05);
  border-color: #3b82f6;
}

.member-role {
  color: var(--text-secondary);
  font-size: 1rem;
  margin: var(--space-3) 0;
}

.social-links {
  display: flex;
  justify-content: center;
  gap: var(--space-4);
  margin-top: var(--space-4);
}

.social-links a {
  color: var(--text-secondary);
  font-size: 1.5rem;
  transition: all 0.3s ease;
}

.social-links a:hover {
  color: #2563eb;
  transform: translateY(-2px);
}

.login-button {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-8);
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  color: white;
  border-radius: var(--radius-lg);
  font-weight: 600;
  text-decoration: none;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  margin-top: var(--space-8);
  font-size: clamp(1rem, 1.5vw, 1.1rem);
  box-shadow: var(--shadow);
  position: relative;
  overflow: hidden;
  width: fit-content;
  margin-left: 0;
  margin-right: auto;
}

.login-button:hover {
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 8px 15px rgba(37, 99, 235, 0.2);
}

@media (max-width: 1024px) {
  .hero {
    flex-direction: column;
    text-align: center;
    padding: var(--space-8) var(--space-6);
    min-height: auto;
  }

  .hero-text {
    max-width: 100%;
    order: 2;
  }

  .hero-image {
    max-width: 80%;
    max-height: 50vh;
    margin-bottom: var(--space-8);
    order: 1;
  }

  .hero h1 {
    font-size: clamp(2.2rem, 6vw, 3.5rem);
  }

  .subtitle {
    font-size: clamp(1rem, 3vw, 1.3rem);
  }

  .login-button {
    margin-left: auto;
    margin-right: auto;
  }

  .team-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .hero {
    padding: var(--space-6) var(--space-4);
    min-height: auto; /* Allow natural height */
    height: auto;
    flex-direction: column; /* Ensure stacking */
    text-align: center;
  }

  .hero-text {
    order: 2;
    max-width: 100%;
    align-items: center; /* Center text block content */
  }

  .hero-image {
    order: 1;
    max-width: 90%;
    max-height: 45vh;
    margin-bottom: var(--space-6);
    flex: none; /* Reset flex properties */
    width: auto;
  }

  .scroll-indicator {
    display: none; /* Hide indicator on mobile */
  }

  .hero h1 {
    font-size: clamp(2rem, 8vw, 3rem);
    line-height: 1.2;
    margin-bottom: var(--space-3);
  }

  .subtitle {
    font-size: clamp(1rem, 4vw, 1.2rem);
    margin-bottom: var(--space-6);
  }

  .login-button {
    padding: var(--space-3) var(--space-6);
    font-size: 1rem;
    width: 100%;
    max-width: 300px;
  }

  .feature-grid,
  .team-grid {
    grid-template-columns: 1fr;
  }

  .feature-card {
    padding: var(--space-6);
  }

  .team-member-image {
    width: 180px;
    height: 180px;
  }
}

@media (max-width: 480px) {
  .hero {
    padding: var(--space-4);
  }

  .hero h1 {
    font-size: clamp(1.8rem, 10vw, 2.5rem);
  }

  .subtitle {
    font-size: clamp(0.9rem, 5vw, 1.1rem);
  }

  .hero-image {
    max-width: 100%;
    max-height: 40vh;
    margin-bottom: var(--space-4);
  }
}
</style> 