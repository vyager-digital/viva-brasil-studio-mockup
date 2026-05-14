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
    overlay: null,
    tooltip: null,
    activeElement: null
  };

  function pageName() {
    return window.location.pathname.split('/').pop() || '01-dashboard.html';
  }

  function firstStepForPage(page) {
    const index = steps.findIndex(step => step.page === page);
    return index === -1 ? 0 : index;
  }

  function ensureStyles() {
    if (document.getElementById('tour-styles')) return;
    const style = document.createElement('style');
    style.id = 'tour-styles';
    style.textContent = `
      .tour-present-btn{position:fixed;top:18px;right:18px;z-index:12000;background:#C9902A;color:#141E3D;border:0;border-radius:4px;padding:11px 16px;font-family:Oswald,Arial,sans-serif;font-size:12px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;box-shadow:0 10px 24px rgba(20,30,61,.18);cursor:pointer}
      .tour-present-btn:hover{background:#a87820}
      .tour-dim{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9990;pointer-events:none}
      .tour-active{position:relative!important;z-index:10000!important;box-shadow:0 0 0 9999px rgba(0,0,0,.55),0 0 0 3px #C9902A!important;border-radius:6px}
      .tour-tip{position:fixed;z-index:10002;width:min(360px,calc(100vw - 36px));background:#141E3D;color:#fff;border:1px solid rgba(201,144,42,.5);border-radius:6px;padding:18px 18px 16px;box-shadow:0 22px 50px rgba(0,0,0,.34);font-family:Montserrat,Arial,sans-serif}
      .tour-close{position:absolute;top:8px;right:10px;border:0;background:transparent;color:rgba(255,255,255,.68);font-size:20px;line-height:1;cursor:pointer}
      .tour-main{font-size:15px;line-height:1.6;color:#fff;padding-right:18px}
      .tour-main span,.tour-behind span{display:block}
      .tour-divider{border-top:1px solid #C9902A;margin:14px 0}
      .tour-behind{font-size:13px;line-height:1.55;color:rgba(255,255,255,.68)}
      .tour-behind span+span{margin-top:8px}
      .tour-controls{display:flex;justify-content:space-between;align-items:center;margin-top:16px}
      .tour-step{font-family:Oswald,Arial,sans-serif;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.52)}
      .tour-actions{display:flex;gap:8px}
      .tour-actions button{border:1px solid rgba(255,255,255,.22);background:transparent;color:#fff;border-radius:4px;padding:8px 11px;font-family:Oswald,Arial,sans-serif;font-size:11px;letter-spacing:.12em;text-transform:uppercase;cursor:pointer}
      .tour-actions button.primary{background:#C9902A;color:#141E3D;border-color:#C9902A}
      .tour-actions button:disabled{opacity:.35;cursor:default}
    `;
    document.head.appendChild(style);
  }

  function addPresentButton() {
    if (document.querySelector('.tour-present-btn')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tour-present-btn';
    button.textContent = 'Present';
    button.addEventListener('click', () => start(firstStepForPage(pageName())));
    document.body.appendChild(button);
  }

  function setQuery(index) {
    const url = new URL(window.location.href);
    url.searchParams.set('tour', String(index + 1));
    history.replaceState(null, '', url);
  }

  function clearQuery() {
    const url = new URL(window.location.href);
    url.searchParams.delete('tour');
    history.replaceState(null, '', url.pathname + url.search + url.hash);
  }

  function lineHtml(lines) {
    return lines.map(line => `<span>${line}</span>`).join('');
  }

  function cleanup(keepQuery) {
    if (state.activeElement) state.activeElement.classList.remove('tour-active');
    if (state.overlay) state.overlay.remove();
    if (state.tooltip) state.tooltip.remove();
    state.activeIndex = null;
    state.activeElement = null;
    state.overlay = null;
    state.tooltip = null;
    if (!keepQuery) clearQuery();
  }

  function navigateTo(index) {
    const step = steps[index];
    window.location.href = `${step.page}?tour=${index + 1}`;
  }

  function positionTooltip(target, tooltip) {
    const rect = target.getBoundingClientRect();
    const gap = 18;
    const width = tooltip.offsetWidth || 360;
    const height = tooltip.offsetHeight || 220;
    let left = rect.right + gap;
    if (left + width > window.innerWidth - gap) left = rect.left - width - gap;
    if (left < gap) left = Math.min(window.innerWidth - width - gap, gap);
    let top = rect.top + Math.min(30, Math.max(0, rect.height / 4));
    if (top + height > window.innerHeight - gap) top = window.innerHeight - height - gap;
    if (top < gap) top = gap;
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }

  function render(index) {
    const step = steps[index];
    if (!step) return cleanup();
    if (step.page !== pageName()) return navigateTo(index);

    cleanup(true);
    state.activeIndex = index;
    setQuery(index);

    const target = document.querySelector(step.selector);
    if (!target) return;
    target.scrollIntoView({ block: 'center', inline: 'center' });

    window.setTimeout(() => {
      const overlay = document.createElement('div');
      overlay.className = 'tour-dim';
      document.body.appendChild(overlay);

      const tooltip = document.createElement('div');
      tooltip.className = 'tour-tip';
      tooltip.innerHTML = `
        <button class="tour-close" type="button" aria-label="Close">×</button>
        <div class="tour-main">${lineHtml(step.main)}</div>
        ${step.behind ? `<div class="tour-divider"></div><div class="tour-behind">${lineHtml(step.behind)}</div>` : ''}
        <div class="tour-controls">
          <div class="tour-step">${index + 1} / ${steps.length}</div>
          <div class="tour-actions">
            <button type="button" class="prev" ${index === 0 ? 'disabled' : ''}>Prev</button>
            <button type="button" class="next primary">${index === steps.length - 1 ? 'Done' : 'Next'}</button>
          </div>
        </div>
      `;
      document.body.appendChild(tooltip);
      target.classList.add('tour-active');
      state.overlay = overlay;
      state.tooltip = tooltip;
      state.activeElement = target;
      positionTooltip(target, tooltip);
      tooltip.querySelector('.tour-close').addEventListener('click', () => cleanup());
      tooltip.querySelector('.prev').addEventListener('click', () => {
        if (index > 0) render(index - 1);
      });
      tooltip.querySelector('.next').addEventListener('click', () => {
        if (index === steps.length - 1) cleanup();
        else render(index + 1);
      });
    }, 120);
  }

  function start(index) {
    render(index);
  }

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && state.activeIndex !== null) cleanup();
  });

  window.addEventListener('resize', () => {
    if (state.tooltip && state.activeElement) positionTooltip(state.activeElement, state.tooltip);
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
