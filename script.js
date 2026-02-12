// ====== Dropdown "Servicios" (hover en desktop + click accesible) ======
document.addEventListener('DOMContentLoaded', () => {
  const services = document.querySelector('#services');
  const menu = document.querySelector('#servicesMenu');
  const toggle = document.querySelector('#servicesToggle');

  if (services && menu && toggle) {
    const closeMenu = () => {
      menu.classList.add('hidden');
      toggle.setAttribute('aria-expanded', 'false');
    };

    const openMenu = () => {
      menu.classList.remove('hidden');
      toggle.setAttribute('aria-expanded', 'true');
    };

    // Hover (desktop)
    services.addEventListener('mouseenter', () => openMenu());
    services.addEventListener('mouseleave', () => closeMenu());

    // Click (fallback / accesible)
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const isHidden = menu.classList.toggle('hidden');
      toggle.setAttribute('aria-expanded', String(!isHidden));
    });

    // Cerrar al hacer click en un enlace del menú
    menu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => closeMenu());
    });

    // ✅ Cerrar al hacer click fuera
    document.addEventListener('click', (e) => {
      if (!services.contains(e.target)) closeMenu();
    });

    // ✅ Cerrar con Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });
  }
});

// ====== Menú móvil (botón ☰) ======
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('menuBtn');
  const panel = document.getElementById('mobilePanel');

  if (!btn || !panel) return;

  const servicesBtn = document.getElementById('mServicesToggle');
  const servicesMenu = document.getElementById('mServicesMenu');

  const toggleSubmenu = () => {
    if (!servicesBtn || !servicesMenu) return;
    const isHidden = servicesMenu.classList.toggle('hidden');
    servicesBtn.setAttribute('aria-expanded', String(!isHidden));
  };

  // Toggle del submenú Servicios
  if (servicesBtn && servicesMenu) {
    servicesBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // evita efectos raros con listeners globales
      toggleSubmenu();
    });
  }

  const openPanel = () => {
    panel.classList.remove('hidden');
    btn.setAttribute('aria-expanded', 'true');
  };

  const closePanel = () => {
    panel.classList.add('hidden');
    btn.setAttribute('aria-expanded', 'false');

    if (servicesMenu && !servicesMenu.classList.contains('hidden')) {
  servicesMenu.classList.add('hidden');
  servicesBtn?.setAttribute('aria-expanded', 'false');
}
  };

  btn.addEventListener('click', () => {
    const isHidden = panel.classList.contains('hidden');
    isHidden ? openPanel() : closePanel();
  });

  // Cerrar al hacer click en un link del panel
  panel.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => closePanel());
  });

  // Cerrar al hacer click fuera
  document.addEventListener('click', (e) => {
    const clickedInside = panel.contains(e.target) || btn.contains(e.target);
    if (!clickedInside) closePanel();
  });

  // Cerrar con Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePanel();
  });

  // ✅ Si cambias a desktop (resize), cerramos el panel para evitar estados raros
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) closePanel();
  });
});

// ====== Hero: rotar imágenes (SIN frases) ======
// ====== Ticker: loop perfecto (sin golpes en PC) ======
document.addEventListener('DOMContentLoaded', () => {
  const track = document.querySelector('.ticker-track');
  const firstGroup = document.querySelector('.ticker-track .ticker-group');

  if (!track || !firstGroup) return;

  const setDistance = () => {
    // ancho real del primer grupo (en px)
    const w = firstGroup.getBoundingClientRect().width;
    track.style.setProperty('--ticker-distance', `${w}px`);
  };

  setDistance();

  // Recalcular en resize (por cambios de fuente / viewport)
  let t;
  window.addEventListener('resize', () => {
    clearTimeout(t);
    t = setTimeout(setDistance, 150);
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.hero-visual');
  const imgA = document.getElementById('heroSlide');
  if (!container || !imgA) return;

  // Lista de imágenes
  const slides = [
    './images/inicio/logopedia-inicio-1.jpg',
    './images/inicio/psicologia-inicio-1.jpg',
    './images/inicio/logopedia-inicio-2.jpg',
    './images/inicio/psicologia-inicio-2.jpg'
  ];

  const alts = [
    'Logopedia inicio 1',
    'Psicología inicio 1',
    'Logopedia inicio 2',
    'Psicología inicio 2'
  ];

  // Preload (reduce “pegadas” por red)
  slides.forEach(src => { const im = new Image(); im.src = src; });

  // Crea una segunda imagen (doble buffer) sin tocar el HTML
  const imgB = imgA.cloneNode(true);
  imgB.removeAttribute('id');
  imgB.style.opacity = '0';
  container.appendChild(imgB);

  let current = 0;
  let showingA = true;

  const DISPLAY_MS = 5000;
  const FADE_MS = 600;

  function waitForLoad(el){
    return new Promise((resolve, reject) => {
      // Si ya está cargada
      if (el.complete && el.naturalWidth > 0) return resolve();

      const onLoad = () => cleanup(resolve);
      const onErr  = () => cleanup(() => reject(new Error('Image failed')));

      function cleanup(done){
        el.removeEventListener('load', onLoad);
        el.removeEventListener('error', onErr);
        done();
      }

      el.addEventListener('load', onLoad);
      el.addEventListener('error', onErr);
    });
  }

  async function showNext(){
    const next = (current + 1) % slides.length;

    const incoming = showingA ? imgB : imgA;
    const outgoing = showingA ? imgA : imgB;

    // Prepara la entrante, pero NO ocultes la actual todavía
    incoming.src = slides[next];
    incoming.alt = alts[next];

    try {
      // Espera a que cargue (evita fondo vacío)
      await waitForLoad(incoming);

      // decode() ayuda a evitar “parpadeos” en algunos móviles
      if (incoming.decode) {
        try { await incoming.decode(); } catch (_) {}
      }

      // Crossfade limpio
      incoming.style.opacity = '1';
      outgoing.style.opacity = '0';

      // Espera al fade antes de confirmar el cambio
      await new Promise(r => setTimeout(r, FADE_MS));

      current = next;
      showingA = !showingA;

    } catch (e) {
      // Si falla la carga, mantenemos la imagen actual (nada de fondo vacío)
      incoming.style.opacity = '0';
      outgoing.style.opacity = '1';
    }

    setTimeout(showNext, DISPLAY_MS);
  }

  // Asegura estado inicial
  imgA.src = slides[0];
  imgA.alt = alts[0];
  imgA.style.opacity = '1';
  imgB.style.opacity = '0';

  setTimeout(showNext, DISPLAY_MS);
});

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.querySelector(".btn-float-cita");
  if (!btn) return;

  setTimeout(() => {
    btn.classList.add("is-visible");
  }, 3000);
});
