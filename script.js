(() => {
  'use strict';

  const header = document.getElementById('site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('primary-nav');
  const body = document.body;
  const year = document.getElementById('year');

  if (year) year.textContent = new Date().getFullYear();

  const setMenu = (open) => {
    if (!menuToggle || !nav) return;
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    nav.classList.toggle('open', open);
    body.classList.toggle('nav-open', open);
    const spans = menuToggle.querySelectorAll('span');
    if (open) {
      spans[0].style.transform = 'translateY(7px) rotate(45deg)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
    } else {
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  };

  menuToggle?.addEventListener('click', () => setMenu(nav?.classList.contains('open') !== true));
  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));

  const onScroll = () => header?.classList.toggle('scrolled', window.scrollY > 20);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    revealItems.forEach(item => revealObserver.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add('visible'));
  }

  // Review slider: no autoplay, so motion remains intentional and accessible.
  const slider = document.querySelector('[data-slider]');
  if (slider) {
    const cards = [...slider.querySelectorAll('.review-card')];
    const dotsWrap = slider.querySelector('.slider-dots');
    const prev = slider.querySelector('[data-prev]');
    const next = slider.querySelector('[data-next]');
    let index = Math.max(0, cards.findIndex(card => card.classList.contains('active')));

    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'slider-dot' + (i === index ? ' active' : '');
      dot.setAttribute('aria-label', `Show review ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsWrap?.appendChild(dot);
    });

    const dots = [...(dotsWrap?.querySelectorAll('.slider-dot') ?? [])];
    const goTo = (nextIndex) => {
      index = (nextIndex + cards.length) % cards.length;
      cards.forEach((card, i) => card.classList.toggle('active', i === index));
      dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
    };

    prev?.addEventListener('click', () => goTo(index - 1));
    next?.addEventListener('click', () => goTo(index + 1));

    slider.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft') goTo(index - 1);
      if (event.key === 'ArrowRight') goTo(index + 1);
    });
  }

  // Authenticated business imagery can be opened for a closer look.
  const lightbox = document.querySelector('[data-lightbox]');
  const lightboxImage = lightbox?.querySelector('[data-lightbox-image]');
  const closeButton = lightbox?.querySelector('.lightbox-close');
  const galleryImages = document.querySelectorAll('.menu-image-wrap img, .story-image img');
  const closeLightbox = () => {
    lightbox?.classList.remove('open');
    lightbox?.setAttribute('aria-hidden', 'true');
    if (lightboxImage) lightboxImage.src = '';
    body.classList.remove('nav-open');
  };

  galleryImages.forEach(img => {
    img.setAttribute('tabindex', '0');
    img.setAttribute('role', 'button');
    img.setAttribute('aria-label', 'Open image');
    const open = () => {
      if (!lightbox || !lightboxImage) return;
      lightboxImage.src = img.currentSrc || img.src;
      lightboxImage.alt = img.alt || '';
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      body.classList.add('nav-open');
      closeButton?.focus();
    };
    img.addEventListener('click', open);
    img.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(); }
    });
  });

  closeButton?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', event => { if (event.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && lightbox?.classList.contains('open')) closeLightbox();
  });
})();
