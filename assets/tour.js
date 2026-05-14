(function () {
  const steps = [
    {
      page: '01-dashboard.html',
      selector: '[data-tour-id="dashboard-cards"]',
      main: ["Here's where your pipeline lives.", "Every lead, every status, at a glance."]
    },
    {
      page: '01-dashboard.html',
      selector: '[data-tour-id="client-list"]',
      main: ["Every client you've worked with — organised and searchable."],
      behind: ["Each record holds their profile, selected destinations, every proposal version, and all three language outputs."]
    },
    {
      page: '02-client.html',
      selector: '[data-tour-id="client-proposals"]',
      main: ["Every version of every proposal, stored.", "Pick up where you left off, any time."],
      behind: ["Each record stores the client profile, the destinations selected, and all language versions — generated once, available instantly."]
    },
    {
      page: '02-intake.html',
      selector: '[data-tour-id="call-notes"]',
      main: ["Paste your notes from the call.", "One click — and the AI takes over."],
      behind: ["The AI pulls out the key details — name, origin, budget, travel dates, interests, and group size — into separate fields."]
    },
    {
      page: '03-review.html',
      selector: '[data-tour-id="review-profile"]',
      main: ["You see what the AI picked up.", "Adjust anything that doesn't look right."],
      behind: ["This profile is saved to a dedicated database.", "Every step that follows — destination matching, proposal writing, translation — reads from this record."]
    },
    {
      page: '04-stories.html',
      selector: '[data-tour-id="story-grid"]',
      main: ["The AI recommends which destinations to include.", "It explains why for each one."],
      behind: ["Your destinations are already loaded — every text, photo, and tag, structured and ready.", "The AI reads from a dedicated database.", "The client's profile is matched against your full destination library. The best fits come first."]
    },
    {
      page: '05-draft.html',
      selector: '[data-tour-id="proposal-body"]',
      main: ["Your proposal. In your voice.", "Ready to edit and send."],
      behind: ["Before writing, the AI loads a selection of your past proposals as reference.", "It matches your tone and structure — then writes.", "Language versions are generated and stored at the same time."]
    }
  ];

  const state = {
    activeIndex: null,
    panel: null,
    activeElement: null
  };

  function pageName() {
    return window.location.pathname.split('/').pop() || '01-dashboard.html';
  }

  function firstStepForPage(page) {
    const index = steps.findIndex(s => s.page === page);
    return index === -1 ? 0 : index;
  }

  function setQuery(index) {
    const url = new URL(window.location.href);
    url.searchParams.set('tour', String(index + 1));
    history.replaceState(null, '', url);
  }

  function clearQuery() {
    const url = new URL(window.location.href);
    url.searchParams.delete('tour');
    history.replaceState(null, '', url.pathname);
  }

  function lineHtml(lines) {
    return lines.map(l => `<span>${l}</span>`).join('');
  }

  function cleanup(keepQuery) {
    if (state.activeElement) {
      state.activeElement.classList.remove('tour-active');
      state.activeElement = null;
    }
    if (state.panel) {
      state.panel.classList.remove('tour-panel-open');
      setTimeout(() => { if (state.panel) { state.panel.remove(); state.panel = null; } }, 260);
    }
    document.body.classList.remove('tour-running');
    state.activeIndex = null;
    if (!keepQuery) clearQuery();
  }

  function navigateTo(index) {
    const step = steps[index];
    window.location.href = `${step.page}?tour=${index + 1}`;
  }

  function ensureStyles() {
    if (document.getElementById('tour-styles')) return;
    const style = document.createElement('style');
    style.id = 'tour-styles';
    style.textContent = `
      /* Present button — lives in sidebar, injected before sidebar nav */
      .tour-present-btn {
        display: block;
        width: calc(100% - 48px);
        margin: 0 24px 20px;
        padding: 11px 0;
        background: #C9902A;
        color: #141E3D;
        border: 0;
        border-radius: 4px;
        font-family: Oswald, Arial, sans-serif;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: .16em;
        text-transform: uppercase;
        cursor: pointer;
        text-align: center;
      }
      .tour-present-btn:hover { background: #a87820; }

      /* Highlight ring — no overlay, just a clean gold outline */
      .tour-active {
        outline: 2px solid #C9902A !important;
        outline-offset: 4px;
        border-radius: 6px;
        transition: outline 0.2s;
      }

      /* Presenter panel — fixed right side, full height */
      .tour-panel {
        position: fixed;
        top: 0;
        right: -320px;
        width: 300px;
        height: 100vh;
        background: #141E3D;
        border-left: 1px solid rgba(201,144,42,.25);
        z-index: 9000;
        display: flex;
        flex-direction: column;
        padding: 32px 28px 28px;
        box-shadow: -12px 0 40px rgba(0,0,0,.18);
        transition: right 0.26s cubic-bezier(.4,0,.2,1);
        font-family: Montserrat, Arial, sans-serif;
        box-sizing: border-box;
      }
      .tour-panel.tour-panel-open { right: 0; }

      .tour-panel-eyebrow {
        font-family: Oswald, Arial, sans-serif;
        font-size: 10px;
        letter-spacing: .28em;
        text-transform: uppercase;
        color: #C9902A;
        margin-bottom: 28px;
      }

      .tour-panel-main {
        font-size: 16px;
        line-height: 1.65;
        color: #fff;
        flex: 1;
      }
      .tour-panel-main span { display: block; }
      .tour-panel-main span + span { margin-top: 4px; }

      .tour-panel-divider {
        border: 0;
        border-top: 1px solid rgba(201,144,42,.35);
        margin: 24px 0 18px;
      }

      .tour-panel-behind-label {
        font-family: Oswald, Arial, sans-serif;
        font-size: 9px;
        letter-spacing: .26em;
        text-transform: uppercase;
        color: rgba(201,144,42,.7);
        margin-bottom: 12px;
      }

      .tour-panel-behind {
        font-size: 13px;
        line-height: 1.6;
        color: rgba(255,255,255,.6);
      }
      .tour-panel-behind span { display: block; }
      .tour-panel-behind span + span { margin-top: 10px; }

      .tour-panel-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 32px;
        padding-top: 20px;
        border-top: 1px solid rgba(255,255,255,.08);
      }

      .tour-step-counter {
        font-family: Oswald, Arial, sans-serif;
        font-size: 11px;
        letter-spacing: .14em;
        text-transform: uppercase;
        color: rgba(255,255,255,.35);
      }

      .tour-nav { display: flex; gap: 8px; }
      .tour-nav button {
        border: 1px solid rgba(255,255,255,.2);
        background: transparent;
        color: #fff;
        border-radius: 4px;
        padding: 8px 13px;
        font-family: Oswald, Arial, sans-serif;
        font-size: 11px;
        letter-spacing: .12em;
        text-transform: uppercase;
        cursor: pointer;
      }
      .tour-nav button:disabled { opacity: .28; cursor: default; }
      .tour-nav button.tour-next { background: #C9902A; color: #141E3D; border-color: #C9902A; }

      .tour-close-btn {
        position: absolute;
        top: 16px;
        right: 16px;
        border: 0;
        background: transparent;
        color: rgba(255,255,255,.4);
        font-size: 20px;
        line-height: 1;
        cursor: pointer;
        padding: 4px;
      }
      .tour-close-btn:hover { color: #fff; }

      /* Nudge the main content area to make room for the panel */
      body.tour-running .main {
        transition: width 0.26s cubic-bezier(.4,0,.2,1), padding-right 0.26s;
        padding-right: 316px;
      }
    `;
    document.head.appendChild(style);
  }

  function addPresentButton() {
    if (document.querySelector('.tour-present-btn')) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tour-present-btn';
    btn.textContent = 'Present';
    btn.addEventListener('click', () => render(firstStepForPage(pageName())));
    // Place at the bottom of the sidebar, before closing </aside>
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      sidebar.appendChild(btn);
    } else {
      // fallback: bottom-left fixed
      btn.style.cssText = 'position:fixed;bottom:24px;left:24px;z-index:9001;width:152px;';
      document.body.appendChild(btn);
    }
  }

  function render(index) {
    const step = steps[index];
    if (!step) return cleanup();
    if (step.page !== pageName()) return navigateTo(index);

    // Remove previous highlight
    if (state.activeElement) state.activeElement.classList.remove('tour-active');

    state.activeIndex = index;
    setQuery(index);
    document.body.classList.add('tour-running');

    // Highlight target element
    const target = document.querySelector(step.selector);
    if (target) {
      target.scrollIntoView({ block: 'center', behavior: 'smooth' });
      target.classList.add('tour-active');
      state.activeElement = target;
    }

    // Build or update panel
    if (!state.panel) {
      const panel = document.createElement('div');
      panel.className = 'tour-panel';
      document.body.appendChild(panel);
      state.panel = panel;
      // Trigger open animation next frame
      requestAnimationFrame(() => panel.classList.add('tour-panel-open'));
    }

    state.panel.innerHTML = `
      <button class="tour-close-btn" type="button" aria-label="Close">×</button>
      <div class="tour-panel-eyebrow">Presentation Mode</div>
      <div class="tour-panel-main">${lineHtml(step.main)}</div>
      ${step.behind ? `
        <hr class="tour-panel-divider">
        <div class="tour-panel-behind-label">Behind the scenes</div>
        <div class="tour-panel-behind">${lineHtml(step.behind)}</div>
      ` : ''}
      <div class="tour-panel-footer">
        <div class="tour-step-counter">${index + 1} of ${steps.length}</div>
        <div class="tour-nav">
          <button type="button" class="tour-prev" ${index === 0 ? 'disabled' : ''}>← Prev</button>
          <button type="button" class="tour-next">${index === steps.length - 1 ? 'Done' : 'Next →'}</button>
        </div>
      </div>
    `;

    state.panel.querySelector('.tour-close-btn').addEventListener('click', () => cleanup());
    state.panel.querySelector('.tour-prev').addEventListener('click', () => { if (index > 0) render(index - 1); });
    state.panel.querySelector('.tour-next').addEventListener('click', () => {
      if (index === steps.length - 1) cleanup();
      else render(index + 1);
    });
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && state.activeIndex !== null) cleanup();
    if (e.key === 'ArrowRight' && state.activeIndex !== null) {
      if (state.activeIndex < steps.length - 1) render(state.activeIndex + 1);
      else cleanup();
    }
    if (e.key === 'ArrowLeft' && state.activeIndex !== null && state.activeIndex > 0) {
      render(state.activeIndex - 1);
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    ensureStyles();
    addPresentButton();
    const tourParam = new URLSearchParams(window.location.search).get('tour');
    if (tourParam) {
      const index = Math.max(1, Number(tourParam)) - 1;
      if (Number.isFinite(index)) render(index);
    }
  });
})();
