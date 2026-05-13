const html   = document.documentElement;
  const bg     = document.getElementById('bg-layer');
  const title  = document.getElementById('header-title');

  // Scroll to top on page load
  window.addEventListener('load', () => {
    window.scrollTo(0, 0);
  });
  // Fallback for immediate scroll
  window.scrollTo(0, 0);

  function toggleTheme() {
    // Prevent toggling while video is playing
    const modeToggle = document.getElementById('mode-toggle');
    if (modeToggle.disabled) return;
    
    const isDark = html.classList.toggle('dark');
    
    // Update grid and title only (not card gradient - animation handles that)
    if (isDark) {
      bg.className = 'fixed inset-0 blueprint-bg -z-10 transition-all duration-500';
      title.style.color = '#fff';
    } else {
      bg.className = 'fixed inset-0 blueprint-bg-light -z-10 transition-all duration-500';
      title.style.color = '#1e3a8a';
    }
    
    playTransitionVideo(isDark);
  }

  function applyTheme(isDark) {
    const bgCard = document.querySelector('[data-dark-bg-card]');
    
    if (isDark) {
      bg.className = 'fixed inset-0 blueprint-bg -z-10 transition-all duration-500';
      title.style.color = '#fff';
      if (bgCard) {
        bgCard.style.background = 'linear-gradient(90deg, rgba(150, 150, 150, 0) 0%, rgba(180, 180, 180, 0.7) 30%, rgba(240, 240, 240, 1) 100%)';
        bgCard.style.backgroundColor = 'rgba(240, 240, 240, 0.95)';
      }
    } else {
      bg.className = 'fixed inset-0 blueprint-bg-light -z-10 transition-all duration-500';
      title.style.color = '#1e3a8a';
      if (bgCard) {
        bgCard.style.background = 'linear-gradient(90deg, rgba(13, 71, 161, 0.9) 0%, rgba(66, 133, 244, 0.85) 100%)';
        bgCard.style.backgroundColor = 'rgba(66, 133, 244, 0.95)';
      }
    }
  }

  function playTransitionVideo(isDark) {
    const gif = document.getElementById('transition-gif');
    const profileImage = document.getElementById('profile-image');
    const bgCard = document.getElementById('bg-card');
    const modeToggle = document.getElementById('mode-toggle');
    
    // Disable toggle button
    modeToggle.disabled = true;
    
    // Step 1: Image fades out
    profileImage.classList.remove('fade-in');
    profileImage.classList.add('fade-out');
    
    // Step 2: After image fade out (0.5s), show and fade in GIF + apply gradient animation
    setTimeout(() => {
      gif.classList.add('show');
      gif.classList.add('fade-in');
      
      // Clear inline background styles so animation can take control
      bgCard.style.background = '';
      bgCard.style.backgroundColor = '';
      
      // Apply gradient animation based on transition direction
      if (isDark) {
        // Transitioning to dark mode (white gradient) - use animation that flows to white
        bgCard.style.animation = 'waterFlowLightToDark 8s linear forwards';
      } else {
        // Transitioning to light mode (blue gradient) - use animation that flows to blue
        bgCard.style.animation = 'waterFlowDarkToLight 8s linear forwards';
      }
      
      // Step 3: GIF plays for its loop duration (~8 seconds), then fade out
      setTimeout(() => {
        gif.classList.remove('fade-in');
        gif.classList.add('fade-out');
        
        // Step 4: After GIF fade out (0.3s), image fades in and restore background gradient
        setTimeout(() => {
          gif.classList.remove('show');
          bgCard.style.animation = 'none'; // Clear animation
          
          // Restore the proper background gradient based on current theme
          if (isDark) {
            // Dark mode - white/gray gradient
            bgCard.style.background = 'linear-gradient(90deg, rgba(150, 150, 150, 0) 0%, rgba(180, 180, 180, 0.7) 30%, rgba(240, 240, 240, 1) 100%)';
            bgCard.style.backgroundColor = 'rgba(240, 240, 240, 0.95)';
          } else {
            // Light mode - blue gradient
            bgCard.style.background = 'linear-gradient(90deg, rgba(13, 71, 161, 0.9) 0%, rgba(66, 133, 244, 0.85) 100%)';
            bgCard.style.backgroundColor = 'rgba(66, 133, 244, 0.95)';
          }
          
          profileImage.classList.remove('fade-out');
          profileImage.classList.add('fade-in');
          
          // Step 5: After everything (0.5s), re-enable button
          setTimeout(() => {
            modeToggle.disabled = false;
          }, 500);
        }, 300);
      }, 8000); // GIF loop duration - adjust as needed
    }, 500);
  }

  function resetTransition() {
    const gif = document.getElementById('transition-gif');
    const profileImage = document.getElementById('profile-image');
    const bgCard = document.getElementById('bg-card');
    const modeToggle = document.getElementById('mode-toggle');
    
    gif.classList.remove('show', 'fade-in', 'fade-out');
    profileImage.classList.remove('fade-out', 'fade-in');
    profileImage.classList.add('fade-in');
    bgCard.style.animation = 'none';
    modeToggle.disabled = false;
  }

  applyTheme(true);

  const modal = document.getElementById('contact-modal');

  function openModal() {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  function handleModalClick(e) {
    if (e.target === modal) closeModal();
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });



  /* â”€â”€ Grid Glow and Ripple Effects â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â€“ */
  const bgLayer = document.getElementById('bg-layer');
  let mouseTimeout;

  // Track mouse movement for glow effect
  document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;

    bgLayer.style.setProperty('--mouse-x', `${x}%`);
    bgLayer.style.setProperty('--mouse-y', `${y}%`);

    // Activate glow
    bgLayer.classList.add('mouse-active');

    // Clear timeout if exists
    clearTimeout(mouseTimeout);

    // Deactivate glow after mouse stops moving
    mouseTimeout = setTimeout(() => {
      bgLayer.classList.remove('mouse-active');
    }, 100);
  });

  // Leave document to deactivate glow
  document.addEventListener('mouseleave', () => {
    bgLayer.classList.remove('mouse-active');
    clearTimeout(mouseTimeout);
  });

  // Touch support: update glow position on touch and keep interactions friendly on mobile
  function handleTouchForGlow(e) {
    if (!e.touches || e.touches.length === 0) return;
    const t = e.touches[0];
    const x = (t.clientX / window.innerWidth) * 100;
    const y = (t.clientY / window.innerHeight) * 100;

    bgLayer.style.setProperty('--mouse-x', `${x}%`);
    bgLayer.style.setProperty('--mouse-y', `${y}%`);
    bgLayer.classList.add('mouse-active');

    clearTimeout(mouseTimeout);
    mouseTimeout = setTimeout(() => {
      bgLayer.classList.remove('mouse-active');
    }, 150);
  }

  document.addEventListener('touchstart', handleTouchForGlow, { passive: true });
  document.addEventListener('touchmove', handleTouchForGlow, { passive: true });
  document.addEventListener('touchend', () => {
    bgLayer.classList.remove('mouse-active');
    clearTimeout(mouseTimeout);
  }, { passive: true });



  // --- Data Loading Logic ---
  async function loadPortfolioData() {
    try {
      const response = await fetch('data.json');
      const data = await response.json();
      
      renderExperience(data.experience);
      renderProjects(data.projects);
      renderCertifications(data.certifications);
      renderRecommendations(data.recommendations);
      renderGallery(data.gallery);
    } catch (error) {
      console.error('Error loading portfolio data:', error);
    }
  }

  function renderExperience(expArray) {
    const track = document.getElementById('experience-track');
    if (!track) return;
    
    let html = '<div class="absolute left-3 top-4 bottom-4 timeline-line"></div>';
    expArray.forEach(exp => {
      html += `
        <div class="relative pl-6">
          <div class="absolute left-0 w-3 h-3 rounded-full ${exp.dotColor} border-2 ${exp.borderColor} mt-1"></div>
          <div class="rounded-xl p-3 child-glass-experience border">
            <p class="font-display font-700 text-xs" style="font-weight:700;">${exp.role}</p>
            <p class="text-xs text-white/80 mt-0.5">${exp.organization}</p>
            <span class="inline-block mt-2 text-xs font-mono bg-white/10 px-2 py-0.5 rounded-full border border-white/30">${exp.year}</span>
          </div>
        </div>
      `;
    });
    track.innerHTML = html;
  }

  function renderProjects(projectsArray) {
    const track = document.getElementById('projects-track');
    const dotsContainer = document.getElementById('projects-dots');
    if (!track) return;

    let html = '';
    let dotsHtml = '';
    projectsArray.forEach((project, index) => {
      html += `
        <div class="snap-start flex-shrink-0 rounded-2xl p-4 w-56 relative dark:child-glass child-glass-blue-light text-white">
          <h4 class="font-display font-700 text-sm" style="font-weight:700;">${project.title}</h4>
          <p class="text-xs text-blue-100 mt-1 mb-12">${project.description}</p>
          <span class="absolute bottom-3 left-3 inline-block text-xs font-mono pill-glass text-white rounded-lg px-3 py-1.5">
            ${project.status}
          </span>
        </div>
      `;
      // Generate dots
      if (index === 0) {
        dotsHtml += '<div class="h-1.5 rounded-full dark:bg-blue-400 bg-white transition-all duration-300 dot-active"></div>';
      } else {
        dotsHtml += '<div class="h-1.5 w-6 rounded-full dark:bg-blue-400/30 bg-white/40 transition-all duration-300"></div>';
      }
    });
    track.innerHTML = html;
    if (dotsContainer) {
      dotsContainer.innerHTML = dotsHtml;
      
      const pTrack = document.getElementById('projects-track');
      const dots = dotsContainer.querySelectorAll('div');
      pTrack.addEventListener('scroll', () => {
        const idx = Math.round(pTrack.scrollLeft / pTrack.clientWidth);
        dots.forEach((d, i) => {
          if (i === idx) {
            d.style.width = '20px';
            d.style.background = '#3b82f6';
          } else {
            d.style.width = '24px';
            d.style.background = 'rgba(96,165,250,0.3)';
          }
        });
      });
    }
  }

  function renderCertifications(certArray) {
    const track = document.getElementById('certifications-track');
    if (!track) return;

    let html = '';
    certArray.forEach(cert => {
      html += `
        <div class="snap-start flex-shrink-0 rounded-2xl p-4 w-56 flex items-start gap-3 dark:child-glass child-glass-white-gradient">
          <div class="cert-icon ${cert.iconBg} border ${cert.iconBorder} ${cert.iconTextDark} ${cert.iconTextLight}">${cert.icon}</div>
          <div>
            <h4 class="font-display font-700 text-xs dark:text-white text-blue-700" style="font-weight:700;">${cert.title}</h4>
            <p class="text-xs dark:text-blue-100 text-slate-600 mt-0.5">${cert.description}</p>
          </div>
        </div>
      `;
    });
    track.innerHTML = html;
  }

  function renderRecommendations(recArray) {
    const track = document.getElementById('rec-track');
    if (!track) return;

    let html = '';
    recArray.forEach(rec => {
      html += `
        <div class="snap-start flex-shrink-0 w-full max-w-3xl">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-11 h-11 rounded-full bg-gradient-to-br ${rec.bgGradient} flex items-center justify-center text-white text-sm font-bold flex-shrink-0">${rec.initials}</div>
            <div>
              <p class="font-display font-700 text-sm" style="font-weight:700;">${rec.name}</p>
              <p class="text-xs dark:text-blue-300 text-white/80">${rec.role}</p>
            </div>
          </div>
          <div class="dark:border-t dark:border-blue-500/40 border-t border-gray-300 pt-3 dark:child-glass child-glass rounded-lg p-3">
            <p class="text-sm leading-relaxed dark:text-slate-300 text-gray-800">
              ${rec.text}
            </p>
          </div>
        </div>
      `;
    });
    track.innerHTML = html;
  }

  // Helper function to handle dot clicks
  // 1. UPDATED SCROLL HELPER: Uses native scrollIntoView for perfect centering
  window.scrollToGalleryItem = function(index) {
    const track = document.getElementById('gallery-track');
    if (!track || !track.children[index]) return;
    
    track.children[index].scrollIntoView({ 
      behavior: 'smooth', 
      block: 'nearest', 
      inline: 'center' 
    });
  };

  function renderGallery(galleryArray) {
    const track = document.getElementById('gallery-track');
    const dotsContainer = document.getElementById('gallery-dots');
    if (!track) return;

    let html = '';
    let dotsHtml = '';
    galleryArray.forEach((item, index) => {
      html += `
        <div class="gallery-item-wrapper snap-center flex-shrink-0 w-full group pointer-events-auto relative hover:z-50 transition-all duration-500 opacity-0 scale-95">
          
          <div class="relative w-full aspect-[2/1] mb-3">
            
            <div class="absolute bottom-0 left-0 w-full rounded-3xl overflow-hidden
                        h-max max-h-full group-hover:max-h-[800px] 
                        transition-all duration-700 ease-in-out
                        group-hover:-translate-y-3 group-hover:scale-105 
                        z-10 group-hover:z-50 origin-bottom cursor-pointer
                        border border-transparent 
                        group-hover:border-white/70 dark:group-hover:border-blue-400/30
                        shadow-md 
                        group-hover:shadow-[0_15px_35px_-5px_rgba(30,58,138,0.15)] 
                        dark:group-hover:shadow-[0_15px_35px_-5px_rgba(0,0,0,0.6)]">
              
              <img src="${item.image}"
                   alt="${item.alt}"
                   class="w-full h-auto min-h-full object-cover object-top"
                   onerror="this.src='${item.fallbackImage}'" />
                   
              <div class="absolute inset-0 bg-gradient-to-t from-blue-900/80 via-blue-900/20 to-transparent pointer-events-none transition-opacity duration-700 group-hover:opacity-60"></div>
              
              <div class="absolute bottom-3 left-3 right-3 pointer-events-none transition-transform duration-700 group-hover:translate-y-1">
                <div class="flex items-center gap-2">
                  <div class="w-5 h-5 rounded-md bg-white/30 backdrop-blur-sm border border-white/40 flex items-center justify-center shadow-md">
                    <span class="text-white text-[9px] font-bold">${item.initial}</span>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-sm font-bold text-white drop-shadow-md">${item.title}</span>
                    <span class="text-[11px] text-white/80 italic drop-shadow-sm">${item.subtitle}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="rounded-2xl p-4 dark:child-glass child-glass-white-light dark:bg-white/20 bg-white/50 border dark:border-white/30 border-gray-300 text-center relative z-0">
            <p class="text-sm italic dark:text-white/90 text-gray-800">"${item.quote}"</p>
            <span class="inline-block mt-3 text-xs font-mono dark:bg-white/10 bg-white/30 px-2 py-0.5 rounded-full border dark:border-white/30 border-white/40">${item.year}</span>
          </div>
        </div>
      `;
      
      if (index === 0) {
        dotsHtml += `<div onclick="scrollToGalleryItem(${index})" class="h-1 rounded-full bg-white dot-active transition-all duration-300 cursor-pointer"></div>`;
      } else {
        dotsHtml += `<div onclick="scrollToGalleryItem(${index})" class="h-1 w-4 rounded-full bg-white/30 transition-all duration-300 cursor-pointer"></div>`;
      }
    });
    
    track.innerHTML = html;
    
    // --- DOTS LOGIC ---
    if (dotsContainer) {
      dotsContainer.innerHTML = dotsHtml;
      const dots = dotsContainer.querySelectorAll('div');
      track.addEventListener('scroll', () => {
        const idx = Math.round(track.scrollLeft / track.clientWidth);
        dots.forEach((d, i) => {
          if (i === idx) {
            d.style.width = '20px';
            d.style.background = '#ffffff';
          } else {
            d.style.width = '16px';
            d.style.background = 'rgba(255,255,255,0.3)';
          }
        });
      });
    }

    // --- INTERSECTION OBSERVER (Hides peeking neighbors) ---
    const items = track.querySelectorAll('.gallery-item-wrapper');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Fade in and scale up when centered
          entry.target.classList.remove('opacity-0', 'scale-95', 'pointer-events-none');
          entry.target.classList.add('opacity-100', 'scale-100', 'pointer-events-auto');
        } else {
          // Hide completely when pushed to the side
          entry.target.classList.remove('opacity-100', 'scale-100', 'pointer-events-auto');
          entry.target.classList.add('opacity-0', 'scale-95', 'pointer-events-none');
        }
      });
    }, {
      root: track,
      threshold: 0.5 // Item must be 50% in view to become visible
    });
    
    items.forEach(item => observer.observe(item));

    //BLUR LOGIC: Toggles the "invisible" class
    const overlay = document.getElementById('gallery-focus-overlay');
    const galleryCard = document.getElementById('gallery-bento-card');
    
    if (overlay && galleryCard) {
      items.forEach((item, idx) => {
        // desktop hover behavior
        item.addEventListener('mouseenter', () => {
          if (window.matchMedia('(hover: hover)').matches) {
            overlay.classList.remove('opacity-0', 'invisible');
            overlay.classList.add('opacity-100', 'visible');
            galleryCard.style.zIndex = '50';
          }
        });

        item.addEventListener('mouseleave', () => {
          if (window.matchMedia('(hover: hover)').matches) {
            overlay.classList.remove('opacity-100', 'visible');
            overlay.classList.add('opacity-0', 'invisible');

            setTimeout(() => {
              if (overlay.classList.contains('opacity-0')) {
                galleryCard.style.zIndex = 'auto';
              }
            }, 500);
          }
        });

        // touch / click behavior: toggle focus for the tapped item
        item.addEventListener('click', (ev) => {
          // On touch devices prefer focusing the tapped item and showing overlay
          const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
          if (!isTouch) return;

          ev.stopPropagation();
          const isActive = item.classList.contains('touch-active');

          // clear any other active items
          items.forEach(i => i.classList.remove('touch-active'));

          if (!isActive) {
            item.classList.add('touch-active');
            overlay.classList.remove('opacity-0', 'invisible');
            overlay.classList.add('opacity-100', 'visible');
            galleryCard.style.zIndex = '50';
            // ensure the item is centered
            item.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          } else {
            item.classList.remove('touch-active');
            overlay.classList.remove('opacity-100', 'visible');
            overlay.classList.add('opacity-0', 'invisible');
            setTimeout(() => { galleryCard.style.zIndex = 'auto'; }, 300);
          }
        });
      });

      // allow tapping the overlay to dismiss
      overlay.addEventListener('click', () => {
        items.forEach(i => i.classList.remove('touch-active'));
        overlay.classList.remove('opacity-100', 'visible');
        overlay.classList.add('opacity-0', 'invisible');
        setTimeout(() => { galleryCard.style.zIndex = 'auto'; }, 300);
      });
    }

  }

  // Load the data
  loadPortfolioData();
