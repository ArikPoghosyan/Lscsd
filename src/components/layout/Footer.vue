<template>
  <footer class="footer">
    <div class="footer__grid" aria-hidden="true"></div>
    
    <div class="footer__container">
      <div class="footer__main">
        <div class="footer__info">
          <div class="footer__logo">
            <img src="/lssd-logo.png" alt="LSSD" class="footer__logo-img" />
            <div class="footer__logo-glow"></div>
          </div>
          <div class="footer__text">
            <h3 class="footer__title">Los Santos County</h3>
            <p class="footer__subtitle">Sheriff's Department</p>
            <p class="footer__motto">Lex et Ordo — Защита и Порядок</p>
          </div>
        </div>

        <div class="footer__links">
          <div class="footer__links-column">
            <h4 class="footer__links-title">Навигация</h4>
            <router-link to="/" class="footer__link">Главная</router-link>
            <router-link to="/public-registry" class="footer__link">Реестр пропусков</router-link>
            <button @click="scrollToDepts" class="footer__link footer__link--button">Отделы</button>
            <a href="https://forum.majestic-rp.ru/threads/ustav-los-santos-county-sheriffs-department.2981524/" target="_blank" rel="noopener noreferrer" class="footer__link">Устав</a>
          </div>
          
          <div class="footer__links-column">
            <h4 class="footer__links-title">Восстановление</h4>
            <a href="https://clck.ru/3S6bwZ" target="_blank" rel="noopener noreferrer" class="footer__link">
              <span>IC Восстановление</span>
            </a>
            <a href="https://clck.ru/3S6crV" target="_blank" rel="noopener noreferrer" class="footer__link">
              <span>Восстановление после WARN/BAN</span>
            </a>
          </div>
        </div>
      </div>

      <div class="footer__bottom">
        <div class="footer__copyright">
          © {{ currentYear }} Los Santos County Sheriff's Department. All rights reserved.
        </div>
        <div class="footer__credits">
          <span class="footer__credits-text">Website developed by</span>
          <span class="footer__credits-name">Arik</span>
        </div>
      </div>
    </div>

    <div class="footer__scanlines" aria-hidden="true"></div>
  </footer>
</template>

<script setup>
const currentYear = new Date().getFullYear()

const scrollToDepts = () => {
  const deptsSection = document.getElementById('departments')
  if (deptsSection) {
    deptsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;500;600;700&family=IM+Fell+English:ital@1&display=swap');

.footer {
  --gold: #c6a756;
  --gold-light: #f0cc7a;
  --gold-dim: #8b7340;
  --navy: #080f16;
  --navy-mid: #0e1a24;
  --navy-card: #111d28;
  --white: #f0ede8;
  --muted: rgba(240,237,232,0.55);
  --border: rgba(198,167,86,0.15);

  position: relative;
  background: linear-gradient(180deg, var(--navy) 0%, var(--navy-mid) 100%);
  color: var(--white);
  font-family: 'Rajdhani', sans-serif;
  border-top: 1px solid var(--gold-dim);
  margin-top: 80px;
  padding: 60px 20px 20px;
  overflow: hidden;
}

.footer__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(198,167,86,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(198,167,86,0.02) 1px, transparent 1px);
  background-size: 48px 48px;
  animation: gridShift 20s linear infinite;
  opacity: 0.3;
}

@keyframes gridShift {
  from { background-position: 0 0; }
  to { background-position: 48px 48px; }
}

.footer__scanlines {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(
    180deg,
    transparent 0px,
    transparent 3px,
    rgba(0,0,0,0.03) 3px,
    rgba(0,0,0,0.03) 4px
  );
  z-index: 0;
}

.footer__container {
  position: relative;
  z-index: 1;
  max-width: 1400px;
  margin: 0 auto;
}

.footer__main {
  display: grid;
  grid-template-columns: 1.2fr 2fr;
  gap: 60px;
  margin-bottom: 50px;
  padding-bottom: 40px;
  border-bottom: 1px solid var(--border);
}

.footer__info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.footer__logo {
  position: relative;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.footer__logo-img {
  width: 70px;
  filter: drop-shadow(0 0 15px rgba(198,167,86,0.3));
  position: relative;
  z-index: 1;
}

.footer__logo-glow {
  position: absolute;
  inset: -5px;
  background: radial-gradient(circle, rgba(198,167,86,0.15) 0%, transparent 70%);
  border-radius: 50%;
  animation: pulseGlow 3s infinite;
}

@keyframes pulseGlow {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.1); }
}

.footer__title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.6rem;
  color: var(--gold);
  margin: 0 0 2px 0;
  letter-spacing: 2px;
  line-height: 1;
}

.footer__subtitle {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.1rem;
  color: var(--white);
  margin: 0 0 6px 0;
  letter-spacing: 1.5px;
}

.footer__motto {
  font-family: 'IM Fell English', serif;
  font-style: italic;
  font-size: 0.8rem;
  color: var(--gold-dim);
  letter-spacing: 0.5px;
}

.footer__links {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
}

.footer__links-column {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.footer__links-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.2rem;
  color: var(--gold);
  margin: 0 0 10px 0;
  letter-spacing: 1.5px;
  position: relative;
  padding-bottom: 8px;
}

.footer__links-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 30px;
  height: 2px;
  background: linear-gradient(90deg, var(--gold), transparent);
}

.footer__link {
  color: var(--muted);
  text-decoration: none;
  font-size: 0.9rem;
  letter-spacing: 0.5px;
  transition: all 0.2s ease;
  padding: 4px 0;
  display: flex;
  flex-direction: column;
}

.footer__link--button {
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  font-family: 'Rajdhani', sans-serif;
  padding: 4px 0;
}

.footer__link:hover {
  color: var(--gold);
  transform: translateX(5px);
}

.footer__bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid var(--border);
  font-size: 0.85rem;
}

.footer__copyright { color: var(--muted); letter-spacing: 0.5px; }

.footer__credits {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: rgba(198,167,86,0.05);
  border: 1px solid var(--border);
  border-radius: 20px;
  transition: all 0.2s ease;
}

.footer__credits:hover {
  border-color: var(--gold);
  background: rgba(198,167,86,0.1);
}

.footer__credits-text { color: var(--muted); }

.footer__credits-name {
  color: var(--gold);
  font-weight: 700;
  letter-spacing: 1px;
}

@media (max-width: 1024px) {
  .footer__main { grid-template-columns: 1fr; gap: 40px; }
  .footer__info { justify-content: center; }
}

@media (max-width: 768px) {
  .footer__links { grid-template-columns: 1fr; gap: 30px; }
  .footer__bottom { flex-direction: column; gap: 15px; text-align: center; }
}

@media (max-width: 480px) {
  .footer__info { flex-direction: column; text-align: center; }
}
</style>
