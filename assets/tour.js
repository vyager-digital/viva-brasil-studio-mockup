(function () {
  const steps = [
    {
      page: '01-dashboard.html',
      selector: '[data-tour-id="dashboard-cards"]',
      main: ["This is your command centre.", "At a glance: how many leads are active, how many proposals are out, and where each one stands.", "During peak season, when five enquiries arrive in the same week, this is what keeps everything visible."],
      behind: ["The stat cards update in real time as clients move through the pipeline.", "Status changes here reflect the same record used for proposal generation — nothing is duplicated or manually updated twice."]
    },
    {
      page: '01-dashboard.html',
      selector: '[data-tour-id="client-list"]',
      main: ["Every active lead in one table.", "Status, next action, last updated — you can see immediately who needs attention and who can wait.", "Click any row to open the full client record."],
      behind: ["Each record stores the full client profile, every proposal version generated, destination selections, and all language outputs.", "Nothing is lost between sessions. Pick up any lead exactly where you left it, weeks later."]
    },
    {
      page: '02-client.html',
      selector: '[data-tour-id="client-proposals"]',
      main: ["This is the full history for one client.", "Every version of their proposal is saved — v1, v2, any revisions.", "If a client comes back six months later asking to revisit a route, it is still here."],
      behind: ["Proposal versions are tied to the client record, not stored as loose files.", "Each version retains its language outputs independently, so a German v1 and an English v2 coexist without overwriting each other."]
    },
    {
      page: '02-intake.html',
      selector: '[data-tour-id="call-notes"]',
      main: ["After a discovery call, this is where it starts.", "Paste in your notes — rough, unedited, exactly as you typed them.", "Or paste a full call transcript if you record your calls. The AI reads either.","One click, and it builds the client profile."],
      behind: ["The AI extracts name, origin, travel dates, budget range, group size, interests, and any specific preferences or exclusions mentioned.", "It also captures softer signals — what excited the client, what they want to avoid, how they want to feel on the trip.", "Nothing is assumed. If it is not in the notes, it is left blank for you to fill in."]
    },
    {
      page: '03-review.html',
      selector: '[data-tour-id="review-profile"]',
      main: ["Here is what the AI understood from your notes.", "You review it, correct anything that is off, and confirm.", "This takes less than two minutes — and it is the only step that requires your attention before the proposal is drafted."],
      behind: ["This profile becomes the single source of truth for everything downstream.", "Destination matching, proposal copy, tone, language selection — every step reads from this record.", "If the profile is accurate, the proposal will be accurate. The quality check happens here, once."]
    },
    {
      page: '04-stories.html',
      selector: '[data-tour-id="story-grid"]',
      main: ["The system matches the client profile against your full destination library.", "Each recommendation comes with an explanation — why this place fits this person.", "You deselect anything that does not fit, add anything the AI missed, and confirm the route."],
      behind: ["Your destinations are pre-loaded — every description, set of photos, tags, and seasonal notes already structured.", "The AI reads the client's interests, travel pace, group size, and budget, then ranks destinations by relevance.", "The 'why' text is also what the AI uses as context when it writes the proposal. Change a selection here and the proposal adjusts automatically."]
    },
    {
      page: '05-draft.html',
      selector: '[data-tour-id="proposal-body"]',
      main: ["This is the proposal the AI drafted — based on the client profile and the destinations you selected.", "Every section is editable. Click any line to change it.", "When you are happy, one click sends it as a private link or exports it as a PDF."],
      behind: ["Before writing, the AI loads a set of your past proposals as reference material.", "It learns your sentence length, the way you introduce destinations, how you handle pricing — and mirrors it.", "German, French, and English versions are generated in the same pass and stored alongside the draft. The client gets the right language without a second round of work."]
    }
  ];

  const state = {
    activeIndex: null,
    panel: null,
    activeElement: null
  };

  function pageName() {
    const name = window.location.pathname.split('/').pop() || '01-dashboard.html';
    return name.endsWith('.html') ? name : name + '.html';
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

      .tour-panel-scroll {
        flex: 1;
        overflow-y: auto;
        min-height: 0;
      }
      .tour-panel-main {
        font-size: 16px;
        line-height: 1.65;
        color: #fff;
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
      <div class="tour-panel-scroll">
        <div class="tour-panel-main">${lineHtml(step.main)}</div>
        ${step.behind ? `
          <hr class="tour-panel-divider">
          <div class="tour-panel-behind-label">Behind the scenes</div>
          <div class="tour-panel-behind">${lineHtml(step.behind)}</div>
        ` : ''}
      </div>
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
