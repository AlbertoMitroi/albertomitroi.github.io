(function () {
  const data = window.cvData;
  const qs = (selector) => document.querySelector(selector);
  const projectGalleryState = {
    modal: null,
    image: null,
    title: null,
    counter: null,
    prev: null,
    next: null,
    items: [],
    index: 0,
    projectName: ""
  };

  function createEl(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  }

  function safeLink(url) {
    return typeof url === "string" && url.trim().length > 0;
  }

  function externalLink(label, url, className = "link-inline") {
    const a = createEl("a", className, label);
    a.href = url;
    a.target = "_blank";
    a.rel = "noreferrer";
    return a;
  }

  function appendPillContent(target, text, iconSrc) {
    if (iconSrc) {
      const icon = createEl("img", "pill-icon");
      icon.src = iconSrc;
      icon.alt = "";
      icon.setAttribute("aria-hidden", "true");
      target.appendChild(icon);
    }
    target.appendChild(createEl("span", "pill-text", text));
  }

  function initHero() {
    qs("#brandName").textContent = data.personal.preferredName;
    qs("#brandAvatar").src = data.personal.image;
    qs("#brandAvatar").alt = `${data.personal.name} profile photo`;
    qs("#heroName").textContent = data.personal.name;
    qs("#heroRole").textContent = data.personal.role;
    qs("#heroLead").textContent = data.personal.headline;
    qs("#heroImage").src = data.personal.image;
    qs("#heroImage").alt = `${data.personal.name} profile portrait`;

    const meta = qs("#heroMeta");
    const metaItems = [
      { text: data.personal.location, icon: "assets/location-pin-svgrepo-com.svg" },
      { text: data.personal.workMode, icon: "assets/chair-2-svgrepo-com.svg" },
      { text: data.personal.email, icon: "assets/gmail-svgrepo-com.svg" }
    ];
    metaItems.forEach((item) => {
      const li = createEl("li");
      const span = createEl("span", "meta-pill");
      appendPillContent(span, item.text, item.icon);
      li.appendChild(span);
      meta.appendChild(li);
    });

    const socialRow = qs("#socialLinks");
    const socialIcons = {
      github: "assets/github-142-svgrepo-com.svg",
      linkedin: "assets/linkedin-svgrepo-com.svg",
      topzonal: "assets/topzonal-logo.png"
    };

    data.links.forEach((item) => {
      const iconSrc = socialIcons[item.label.toLowerCase()] || "";
      const label = `${item.label} · ${item.value}`;
      if (safeLink(item.url)) {
        const link = createEl("a", "social-link");
        link.href = item.url;
        link.target = "_blank";
        link.rel = "noreferrer";
        appendPillContent(link, label, iconSrc);
        socialRow.appendChild(link);
      } else {
        const span = createEl("span", "social-link");
        appendPillContent(span, label, iconSrc);
        socialRow.appendChild(span);
      }
    });

    const facts = qs("#heroFacts");
    data.heroFacts.forEach((fact) => {
      facts.appendChild(createEl("span", "fact-pill", fact));
    });
  }

  function initAbout() {
    const about = qs("#aboutCopy");
    data.summary.forEach((paragraph) => about.appendChild(createEl("p", "", paragraph)));

    const highlights = qs("#aboutHighlights");
    if (highlights && Array.isArray(data.aboutHighlights)) {
      data.aboutHighlights.forEach((item) => highlights.appendChild(createEl("li", "about-highlight", item)));
    }

    const focus = qs("#focusCards");
    data.focusAreas.forEach((area) => {
      const card = createEl("article", "focus-card");
      card.appendChild(createEl("h4", "", area.title));
      card.appendChild(createEl("p", "", area.text));
      focus.appendChild(card);
    });
  }

  function parsePeriodBounds(period) {
    const chunks = String(period || "").split(/\s*[–-]\s*/).map((chunk) => chunk.trim()).filter(Boolean);
    if (chunks.length <= 1) return { start: chunks[0] || String(period || ""), end: chunks[0] || String(period || "") };
    return { start: chunks[0], end: chunks[1] };
  }

  function parseMonthYear(label) {
    if (!label) return null;
    const clean = String(label).trim().replace(/\./g, "");
    if (!clean) return null;

    if (/present/i.test(clean)) {
      const now = new Date();
      return { year: now.getFullYear(), month: now.getMonth() };
    }

    const [monthToken, yearToken] = clean.split(/\s+/);
    const monthMap = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, sept: 8, oct: 9, nov: 10, dec: 11
    };
    const month = monthMap[(monthToken || "").toLowerCase()];
    const year = Number(yearToken);
    if (month === undefined || Number.isNaN(year)) return null;
    return { year, month };
  }

  function formatDuration(totalMonths) {
    const safeTotal = Math.max(1, totalMonths);
    const years = Math.floor(safeTotal / 12);
    const months = safeTotal % 12;
    const yearText = years ? `${years} year${years > 1 ? "s" : ""}` : "";
    const monthText = months ? `${months} month${months > 1 ? "s" : ""}` : "";
    return [yearText, monthText].filter(Boolean).join(" ");
  }

  function buildCompanyPeriod(roles) {
    if (!roles.length) return "";
    const latest = parsePeriodBounds(roles[0].period);
    const earliest = parsePeriodBounds(roles[roles.length - 1].period);
    return `${earliest.start} – ${latest.end}`;
  }

  function buildCompanyDuration(roles) {
    if (!roles.length) return "";
    const latest = parsePeriodBounds(roles[0].period);
    const earliest = parsePeriodBounds(roles[roles.length - 1].period);
    const start = parseMonthYear(earliest.start);
    const end = parseMonthYear(latest.end);
    if (!start || !end) return "";
    const months = ((end.year - start.year) * 12) + (end.month - start.month) + 1;
    return formatDuration(months);
  }

  function groupExperienceByCompany(entries) {
    const groups = [];
    entries.forEach((entry) => {
      const current = groups[groups.length - 1];
      const sameCompany = current
        && current.company === entry.company
        && (current.website || "") === (entry.website || "");
      if (sameCompany) {
        current.roles.push(entry);
        if (!current.companyLogo && entry.companyLogo) current.companyLogo = entry.companyLogo;
      } else {
        groups.push({
          company: entry.company,
          companyLogo: entry.companyLogo || "",
          website: entry.website,
          roles: [entry]
        });
      }
    });
    return groups;
  }

  function initExperience() {
    const list = qs("#experienceList");
    const groups = groupExperienceByCompany(data.experience);

    groups.forEach((group) => {
      const item = createEl("article", "timeline-item timeline-item--company");

      const meta = createEl("div", "timeline-meta");
      const companyHead = createEl("div", "timeline-company-head");
      if (group.companyLogo) {
        const logo = createEl("img", "timeline-company-logo");
        logo.src = group.companyLogo;
        logo.alt = `${group.company} logo`;
        companyHead.appendChild(logo);
      }
      const companyText = createEl("div", "timeline-company-text");
      companyText.appendChild(createEl("div", "timeline-company", group.company));
      const companyPeriod = buildCompanyPeriod(group.roles);
      const companySummary = createEl("div", "timeline-company-summary");
      companySummary.appendChild(createEl("span", "timeline-company-period", companyPeriod));
      companyText.appendChild(companySummary);
      companyHead.appendChild(companyText);
      meta.appendChild(companyHead);

      const companyDuration = buildCompanyDuration(group.roles);
      if (companyDuration) meta.appendChild(createEl("div", "timeline-duration", companyDuration));

      const locations = [...new Set(group.roles.map((role) => role.location).filter(Boolean))];
      if (locations.length === 1) meta.appendChild(createEl("div", "timeline-location", locations[0]));
      if (locations.length > 1) meta.appendChild(createEl("div", "timeline-location", "Multiple locations"));

      if (safeLink(group.website)) {
        const websiteWrap = createEl("div", "timeline-location");
        websiteWrap.appendChild(externalLink(group.website.replace(/^https?:\/\//, ""), group.website));
        meta.appendChild(websiteWrap);
      }

      const stackClass = group.roles.length > 1 ? "timeline-role-stack" : "timeline-role-stack timeline-role-stack--single";
      const roleStack = createEl("div", stackClass);

      group.roles.forEach((role) => {
        const roleItem = createEl("article", "timeline-role-item");
        const connector = createEl("span", "timeline-role-connector");
        connector.setAttribute("aria-hidden", "true");
        roleItem.appendChild(connector);

        const roleMain = createEl("div", "timeline-role-main");
        roleMain.appendChild(createEl("h4", "timeline-role-title", role.role));
        roleMain.appendChild(createEl("div", "timeline-role-meta", role.period));
        roleMain.appendChild(createEl("p", "timeline-role-intro", role.intro));

        const ul = createEl("ul", "bullet-list");
        role.bullets.forEach((bullet) => ul.appendChild(createEl("li", "", bullet)));
        roleMain.appendChild(ul);

        roleItem.appendChild(roleMain);
        roleStack.appendChild(roleItem);
      });

      item.append(meta, roleStack);
      list.appendChild(item);
    });
  }

  function normalizeProjectGallery(project) {
    if (!Array.isArray(project.gallery)) return [];
    return project.gallery
      .map((item, index) => {
        if (typeof item === "string") return { src: item, alt: `${project.name} preview ${index + 1}` };
        if (!item || typeof item !== "object") return null;
        if (typeof item.src !== "string" || !item.src.trim()) return null;
        return {
          src: item.src,
          alt: item.alt || `${project.name} preview ${index + 1}`
        };
      })
      .filter(Boolean);
  }

  function renderProjectGalleryModal() {
    const state = projectGalleryState;
    if (!state.items.length || !state.image || !state.counter || !state.title) return;
    const current = state.items[state.index];
    state.image.src = current.src;
    state.image.alt = current.alt || `${state.projectName} screenshot ${state.index + 1}`;
    state.title.textContent = state.projectName;
    state.counter.textContent = `${state.index + 1} / ${state.items.length}`;

    if (state.prev && state.next) {
      const disabled = state.items.length <= 1;
      state.prev.disabled = disabled;
      state.next.disabled = disabled;
    }
  }

  function closeProjectGallery() {
    const state = projectGalleryState;
    if (!state.modal || state.modal.hasAttribute("hidden")) return;
    state.modal.setAttribute("hidden", "hidden");
    state.modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("project-gallery-open");
  }

  function stepProjectGallery(step) {
    const state = projectGalleryState;
    if (!state.items.length) return;
    state.index = (state.index + step + state.items.length) % state.items.length;
    renderProjectGalleryModal();
  }

  function openProjectGallery(projectName, items, startIndex) {
    if (!items.length) return;
    ensureProjectGalleryModal();
    const state = projectGalleryState;
    state.projectName = projectName;
    state.items = items;
    state.index = Math.max(0, Math.min(startIndex || 0, items.length - 1));
    state.modal.removeAttribute("hidden");
    state.modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("project-gallery-open");
    renderProjectGalleryModal();
  }

  function ensureProjectGalleryModal() {
    if (projectGalleryState.modal) return;

    const modal = createEl("div", "project-gallery-modal");
    modal.setAttribute("hidden", "hidden");
    modal.setAttribute("aria-hidden", "true");

    const backdrop = createEl("button", "project-gallery-backdrop");
    backdrop.type = "button";
    backdrop.setAttribute("aria-label", "Close gallery");
    backdrop.addEventListener("click", closeProjectGallery);

    const dialog = createEl("div", "project-gallery-dialog");
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-label", "Project gallery");

    const closeButton = createEl("button", "project-gallery-close", "Close");
    closeButton.type = "button";
    closeButton.addEventListener("click", closeProjectGallery);

    const stage = createEl("div", "project-gallery-stage");
    const prev = createEl("button", "project-gallery-nav project-gallery-nav--prev", "‹");
    prev.type = "button";
    prev.setAttribute("aria-label", "Previous image");
    prev.addEventListener("click", () => stepProjectGallery(-1));

    const image = createEl("img", "project-gallery-image");
    image.alt = "";

    const next = createEl("button", "project-gallery-nav project-gallery-nav--next", "›");
    next.type = "button";
    next.setAttribute("aria-label", "Next image");
    next.addEventListener("click", () => stepProjectGallery(1));

    stage.append(prev, image, next);

    const footer = createEl("div", "project-gallery-footer");
    const title = createEl("div", "project-gallery-title");
    const counter = createEl("div", "project-gallery-counter");
    footer.append(title, counter);

    dialog.append(closeButton, stage, footer);
    modal.append(backdrop, dialog);
    document.body.appendChild(modal);

    document.addEventListener("keydown", (event) => {
      if (!projectGalleryState.modal || projectGalleryState.modal.hasAttribute("hidden")) return;
      if (event.key === "Escape") closeProjectGallery();
      if (event.key === "ArrowRight") stepProjectGallery(1);
      if (event.key === "ArrowLeft") stepProjectGallery(-1);
    });

    projectGalleryState.modal = modal;
    projectGalleryState.image = image;
    projectGalleryState.title = title;
    projectGalleryState.counter = counter;
    projectGalleryState.prev = prev;
    projectGalleryState.next = next;
  }

  function createProjectGallery(project) {
    const images = normalizeProjectGallery(project);
    if (!images.length) return null;

    const gallery = createEl("div", "project-gallery");

    const main = createEl("button", "project-gallery-main");
    main.type = "button";
    const mainImage = createEl("img", "project-gallery-main-image");
    mainImage.src = images[0].src;
    mainImage.alt = images[0].alt;
    main.appendChild(mainImage);
    const countBadge = createEl("span", "project-gallery-count", `${images.length} photos`);
    const extraPhotos = Math.max(0, images.length - 1);
    const mobileLabel = extraPhotos > 0
      ? `View more photos +${extraPhotos}`
      : "View photo";
    countBadge.setAttribute("data-mobile-label", mobileLabel);
    main.appendChild(countBadge);
    main.addEventListener("click", () => openProjectGallery(project.name, images, 0));
    gallery.appendChild(main);

    const thumbs = createEl("div", "project-gallery-thumbs");
    images.slice(0, 3).forEach((image, index) => {
      const thumb = createEl("button", "project-gallery-thumb");
      thumb.type = "button";
      const thumbImage = createEl("img", "project-gallery-thumb-image");
      thumbImage.src = image.src;
      thumbImage.alt = image.alt;
      thumb.appendChild(thumbImage);

      if (index === 2 && images.length > 3) {
        thumb.appendChild(createEl("span", "project-gallery-more", `+${images.length - 3}`));
      }

      thumb.addEventListener("click", () => openProjectGallery(project.name, images, index));
      thumbs.appendChild(thumb);
    });
    gallery.appendChild(thumbs);

    const viewAll = createEl("button", "project-gallery-view-all", `View all photos (${images.length})`);
    viewAll.type = "button";
    viewAll.addEventListener("click", () => openProjectGallery(project.name, images, 0));
    gallery.appendChild(viewAll);

    return gallery;
  }

  function initProjects() {
    const list = qs("#projectsList");
    ensureProjectGalleryModal();
    data.projects.forEach((project) => {
      const card = createEl("article", "project-card");

      const top = createEl("div", "project-top");
      const titleWrap = createEl("div", "project-title-wrap");
      if (project.logo) {
        const logo = createEl("img", "project-title-logo");
        logo.src = project.logo;
        logo.alt = `${project.name} logo`;
        titleWrap.appendChild(logo);
      }
      const title = createEl("h4", "project-title", project.name);
      titleWrap.appendChild(title);
      top.appendChild(titleWrap);
      if (safeLink(project.url)) top.appendChild(externalLink("Open ↗", project.url));
      card.appendChild(top);
      card.appendChild(createEl("p", "project-description", project.summary));

      const ul = createEl("ul", "bullet-list");
      project.bullets.forEach((bullet) => ul.appendChild(createEl("li", "", bullet)));
      card.appendChild(ul);

      const gallery = createProjectGallery(project);
      if (gallery) card.appendChild(gallery);

      const tags = createEl("div", "tags");
      project.stack.forEach((item) => tags.appendChild(createEl("span", "tag", item)));
      card.appendChild(tags);
      list.appendChild(card);
    });
  }

  function initSkills() {
    const list = qs("#skillsList");
    data.skills.forEach((group) => {
      const card = createEl("article", "skill-card");
      card.appendChild(createEl("h4", "", group.title));
      if (group.summary) card.appendChild(createEl("p", "skill-summary", group.summary));
      const ul = createEl("ul", "skill-list");
      group.items.forEach((item) => ul.appendChild(createEl("li", "", item)));
      card.appendChild(ul);
      list.appendChild(card);
    });
  }

  function initSidebarSections() {
    const certifications = qs("#certificationsList");
    data.certifications.forEach((cert) => {
      const item = createEl("article", "stack-item cert-card");

      const top = createEl("div", "cert-top");
      const brand = createEl("div", "cert-brand");
      const brandLogo = createEl("img", "cert-brand-icon");
      brandLogo.src = cert.brandLogo || "assets/microsoft-svgrepo-com.svg";
      brandLogo.alt = "";
      brandLogo.setAttribute("aria-hidden", "true");
      brand.appendChild(brandLogo);
      brand.appendChild(createEl("span", "cert-brand-text", "Microsoft Certified"));
      top.appendChild(brand);

      if (cert.status) {
        const statusClass = cert.status.toLowerCase().replace(/\s+/g, "-");
        top.appendChild(createEl("span", `cert-status cert-status--${statusClass}`, cert.status));
      }

      const body = createEl("div", "cert-body");
      if (cert.badge) {
        const badge = createEl("img", "cert-badge");
        badge.src = cert.badge;
        badge.alt = `${cert.title} badge`;
        body.appendChild(badge);
      }

      const info = createEl("div", "cert-info");
      info.appendChild(createEl("h4", "", cert.title));
      info.appendChild(createEl("div", "meta-row", `${cert.issuer} · ${cert.meta}`));
      if (cert.credentialId) info.appendChild(createEl("div", "cert-credential-id", `Credential ID: ${cert.credentialId}`));
      if (cert.note) info.appendChild(createEl("p", "", cert.note));
      if (String(cert.status || "").toLowerCase() === "achieved") {
        const viewUrl = safeLink(cert.url) ? cert.url : cert.badge;
        if (safeLink(viewUrl)) {
          const action = createEl("a", "btn btn-secondary cert-action", "Show credential");
          action.href = viewUrl;
          action.target = "_blank";
          action.rel = "noreferrer";
          info.appendChild(action);
        }
      }

      body.appendChild(info);
      item.append(top, body);
      certifications.appendChild(item);
    });

    const additionalCertifications = qs("#additionalCertificationsList");
    if (additionalCertifications && Array.isArray(data.additionalCertifications)) {
      data.additionalCertifications.forEach((cert) => {
        const card = createEl("article", "micro-cert-card");

        const head = createEl("div", "micro-cert-head");
        if (cert.logo) {
          const logo = createEl("img", "micro-cert-logo");
          logo.src = cert.logo;
          logo.alt = `${cert.issuer} logo`;
          head.appendChild(logo);
        }
        head.appendChild(createEl("h4", "", cert.title));
        card.appendChild(head);

        card.appendChild(createEl("div", "meta-row", `${cert.issuer} · Issued ${cert.issued}`));
        card.appendChild(createEl("div", "micro-cert-id", `Credential ID: ${cert.credentialId}`));

        if (safeLink(cert.url)) {
          const link = createEl("a", "micro-cert-action", "Show credential");
          link.href = cert.url;
          link.target = "_blank";
          link.rel = "noreferrer";
          card.appendChild(link);
        } else {
          card.appendChild(createEl("span", "micro-cert-action micro-cert-action--disabled", "Show credential"));
        }

        additionalCertifications.appendChild(card);
      });
    }

    const education = qs("#educationList");
    data.education.forEach((edu) => {
      const item = createEl("article", "stack-item");
      item.appendChild(createEl("h4", "", edu.title));
      item.appendChild(createEl("div", "meta-row", `${edu.subtitle} · ${edu.meta}`));
      item.appendChild(createEl("p", "", edu.detail));
      if (safeLink(edu.url)) item.appendChild(externalLink(edu.url.replace(/^https?:\/\//, ""), edu.url));
      education.appendChild(item);
    });

    const contacts = qs("#contactActions");
    const contactIconFallback = {
      email: "assets/gmail-svgrepo-com.svg",
      phone: "assets/phone-rounded-svgrepo-com.svg",
      github: "assets/github-142-svgrepo-com.svg"
    };
    data.contactCards.forEach((entry) => {
      const a = createEl("a", "contact-action");
      a.href = entry.url;
      a.target = entry.url.startsWith("http") ? "_blank" : "_self";
      if (entry.url.startsWith("http")) a.rel = "noreferrer";

      const iconWrap = createEl("span", "contact-icon-wrap");
      const icon = createEl("img", "contact-icon");
      const fallbackKey = String(entry.title || "").toLowerCase();
      icon.src = entry.icon || contactIconFallback[fallbackKey] || "";
      icon.alt = "";
      icon.setAttribute("aria-hidden", "true");
      iconWrap.appendChild(icon);

      const textWrap = createEl("span", "contact-text-wrap");
      textWrap.appendChild(createEl("strong", "", entry.title));
      textWrap.appendChild(createEl("span", "contact-value", entry.value));
      if (entry.note) textWrap.appendChild(createEl("span", "contact-note", entry.note));

      a.append(iconWrap, textWrap);
      contacts.appendChild(a);
    });
  }

  function renderResumeMarkup() {
    const profileLinks = data.links.map((item) => {
      if (safeLink(item.url)) return `<a href="${item.url}" target="_blank" rel="noreferrer">${item.label}: ${item.value}</a>`;
      return `<span>${item.label}: ${item.value}</span>`;
    }).join("");

    const experienceHtml = data.experience.map((job) => `
      <article class="resume-entry">
        <div class="resume-entry-head">
          <div>
            <strong>${job.company}</strong>
            <div class="resume-subline">${job.role}</div>
            ${safeLink(job.website) ? `<div class="resume-small"><a href="${job.website}" target="_blank" rel="noreferrer">${job.website}</a></div>` : ""}
          </div>
          <div class="resume-small" style="text-align:right">
            <div><strong>${job.period}</strong></div>
            <div>${job.location}</div>
          </div>
        </div>
        <div class="resume-summary" style="margin-top:6px"><p>${job.intro}</p></div>
        <ul>${job.bullets.map((bullet) => `<li>${bullet}</li>`).join("")}</ul>
      </article>
    `).join("");

    const projectHtml = data.projects.map((project) => `
      <article class="resume-project">
        <div class="resume-project-head">
          <div>
            <strong>${project.name}</strong>
            ${safeLink(project.url) ? `<div class="resume-small"><a href="${project.url}" target="_blank" rel="noreferrer">${project.url}</a></div>` : ""}
          </div>
        </div>
        <div class="resume-summary" style="margin-top:6px"><p>${project.summary}</p></div>
        <ul>${project.bullets.map((bullet) => `<li>${bullet}</li>`).join("")}</ul>
        <div class="resume-tags">${project.stack.join(", ")}</div>
      </article>
    `).join("");

    const skillsHtml = data.skills.map((group) => `
      <div class="resume-skill-group">
        <strong>${group.title}</strong>
        <div class="resume-skills-list">${group.items.join(", ")}</div>
      </div>
    `).join("");

    const certHtml = data.certifications.map((cert) => `
      <div class="resume-cert-row">
        <div class="resume-cert-head">
          <div>
            <strong>${cert.title}</strong>
            <div class="resume-subline">${cert.issuer}</div>
          </div>
          <div class="resume-small" style="text-align:right">${cert.meta}</div>
        </div>
      </div>
    `).join("");

    const eduHtml = data.education.map((edu) => `
      <div class="resume-edu-row">
        <div class="resume-edu-head">
          <div>
            <strong>${edu.title}</strong>
            <div class="resume-subline">${edu.subtitle}</div>
            ${safeLink(edu.url) ? `<div class="resume-small"><a href="${edu.url}" target="_blank" rel="noreferrer">${edu.url}</a></div>` : ""}
          </div>
          <div class="resume-small" style="text-align:right">
            <div><strong>${edu.meta}</strong></div>
            <div>${edu.detail}</div>
          </div>
        </div>
      </div>
    `).join("");

    return `
      <div class="resume-shell">
        <header class="resume-header">
          <div class="resume-photo"><img src="${data.personal.image}" alt="${data.personal.name} profile portrait" /></div>
          <div>
            <h1 class="resume-name">${data.personal.name}</h1>
            <p class="resume-role">${data.personal.role}</p>
            <div class="resume-contact">
              <span>${data.personal.location}</span>
              <a href="tel:${data.personal.phone.replace(/\s+/g, "")}">${data.personal.phone}</a>
              <a href="mailto:${data.personal.email}">${data.personal.email}</a>
            </div>
            <div class="resume-profile-row">${profileLinks}</div>
          </div>
        </header>

        <section class="resume-section">
          <h2 class="resume-title">Summary</h2>
          <div class="resume-summary">${data.summary.map((paragraph) => `<p>${paragraph}</p>`).join("")}</div>
        </section>

        <section class="resume-section"><h2 class="resume-title">Experience</h2>${experienceHtml}</section>
        <section class="resume-section"><h2 class="resume-title">Certifications</h2>${certHtml}</section>
        <section class="resume-section"><h2 class="resume-title">Projects</h2>${projectHtml}</section>
        <section class="resume-section"><h2 class="resume-title">Skills</h2>${skillsHtml}</section>
        <section class="resume-section"><h2 class="resume-title">Education</h2>${eduHtml}</section>
      </div>
    `;
  }

  function initResume() {
    qs("#resumePdfRoot").innerHTML = renderResumeMarkup();
  }

  async function downloadPdf() {
    initResume();
    const element = qs("#resumePdfRoot");
    const opt = {
      margin: 0,
      filename: "Mitroi_Alberto_Ionut_CV.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["css", "legacy"] }
    };

    try {
      if (window.html2pdf) {
        await window.html2pdf().set(opt).from(element).save();
      } else {
        window.print();
      }
    } catch (error) {
      console.error(error);
      window.print();
    }
  }

  function bindActions() {
    ["#downloadPdfHeader", "#downloadPdfHero", "#downloadPdfFooter"].forEach((selector) => {
      const button = qs(selector);
      if (button) button.addEventListener("click", downloadPdf);
    });
  }

  function initMobileMenu() {
    const header = qs(".site-header");
    const nav = qs("#mainNav");
    const toggle = qs("#navToggle");
    if (!header || !nav || !toggle) return;

    const mobileQuery = window.matchMedia("(max-width: 980px)");
    const isMenuOpen = () => header.classList.contains("nav-open");

    function setMenu(open) {
      if (open && mobileQuery.matches) {
        header.classList.add("nav-open");
        toggle.setAttribute("aria-expanded", "true");
      } else {
        header.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    }

    toggle.addEventListener("click", () => setMenu(!isMenuOpen()));

    nav.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", () => setMenu(false));
    });

    document.addEventListener("click", (event) => {
      if (!mobileQuery.matches || !isMenuOpen()) return;
      if (header.contains(event.target)) return;
      setMenu(false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setMenu(false);
    });

    const syncOnResize = () => {
      if (!mobileQuery.matches) setMenu(false);
    };
    if (typeof mobileQuery.addEventListener === "function") {
      mobileQuery.addEventListener("change", syncOnResize);
    } else {
      window.addEventListener("resize", syncOnResize);
    }
  }

  function getSectionScrollTarget(section) {
    if (!section) return null;
    const heading = section.querySelector(".section-heading");
    return heading || section;
  }

  function scrollToSection(sectionId, updateHash = true, behavior = "smooth") {
    const section = document.getElementById(sectionId);
    if (!section) return;

    const target = getSectionScrollTarget(section);
    if (!target) return;

    const header = document.querySelector(".site-header");
    const headerOffset = (header ? header.offsetHeight : 0) + 14;
    const top = Math.max(0, window.scrollY + target.getBoundingClientRect().top - headerOffset);
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const resolvedBehavior = prefersReducedMotion ? "auto" : behavior;

    window.scrollTo({ top, behavior: resolvedBehavior });

    if (updateHash && history.replaceState) {
      history.replaceState(null, "", `#${sectionId}`);
    }
  }

  function initNavigation() {
    const nav = qs("#mainNav");
    if (!nav) return;

    const links = Array.from(nav.querySelectorAll('a[href^="#"]'));
    if (!links.length) return;
    const sectionIndicator = qs("#mobileSectionIndicator");
    const sectionIndicatorLabel = qs("#mobileSectionIndicatorLabel");

    const refs = links
      .map((link) => {
        const href = link.getAttribute("href") || "";
        const id = href.startsWith("#") ? href.slice(1) : "";
        const section = id ? document.getElementById(id) : null;
        if (!section) return null;
        return { link, id, section };
      })
      .filter(Boolean);

    if (!refs.length) return;

    let activeId = "";
    function getIndicatorText(id) {
      if (!id) return "";
      const activeRef = refs.find((ref) => ref.id === id);
      return activeRef ? activeRef.link.textContent.trim() : "";
    }

    function syncIndicator(id) {
      if (!sectionIndicatorLabel) return;
      const text = getIndicatorText(id);
      sectionIndicatorLabel.textContent = text;
      if (sectionIndicator) sectionIndicator.classList.toggle("is-empty", !text);
    }

    function setActive(id) {
      if (activeId === id) return;
      activeId = id;
      refs.forEach((ref) => ref.link.classList.toggle("is-active", !!id && ref.id === id));
      syncIndicator(id);
    }

    links.forEach((link) => {
      const href = link.getAttribute("href") || "";
      if (!href.startsWith("#")) return;
      const sectionId = href.slice(1);
      if (!sectionId || !document.getElementById(sectionId)) return;

      link.addEventListener("click", (event) => {
        event.preventDefault();
        setActive(sectionId);
        scrollToSection(sectionId, true, "smooth");
      });
    });

    function resolveActiveSectionId() {
      const header = document.querySelector(".site-header");
      const pivot = window.scrollY + (header ? header.offsetHeight : 0) + 24;
      const firstTop = refs[0].section.offsetTop;
      if (pivot < firstTop - 20) return "";
      let current = refs[0].id;

      refs.forEach((ref) => {
        if (ref.section.offsetTop <= pivot) current = ref.id;
      });

      const nearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 6;
      if (nearBottom) current = refs[refs.length - 1].id;
      return current;
    }

    let rafId = 0;
    function scheduleActiveUpdate() {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        setActive(resolveActiveSectionId());
      });
    }

    window.addEventListener("scroll", scheduleActiveUpdate, { passive: true });
    window.addEventListener("resize", scheduleActiveUpdate);
    syncIndicator("");
    scheduleActiveUpdate();

    const hashId = window.location.hash.replace(/^#/, "");
    if (hashId && refs.some((ref) => ref.id === hashId)) {
      window.requestAnimationFrame(() => scrollToSection(hashId, false, "auto"));
    }
  }

  function initSectionHeadingReveal() {
    const headings = Array.from(document.querySelectorAll(".section-heading"));
    if (!headings.length) return;

    document.body.classList.add("js-enhanced");
    headings.forEach((heading, index) => {
      const delayStep = (index % 4) * 0.04;
      heading.style.setProperty("--reveal-delay", `${delayStep}s`);
    });

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!("IntersectionObserver" in window) || prefersReducedMotion) {
      headings.forEach((heading) => heading.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
          entry.target.classList.add("is-visible");
        } else {
          entry.target.classList.remove("is-visible");
        }
      });
    }, {
      threshold: [0, 0.15, 0.3, 0.45, 0.6],
      rootMargin: "-4% 0px -12% 0px"
    });

    headings.forEach((heading) => observer.observe(heading));
  }

  function init() {
    initHero();
    initAbout();
    initExperience();
    initProjects();
    initSkills();
    initSidebarSections();
    initResume();
    bindActions();
    initMobileMenu();
    initNavigation();
    initSectionHeadingReveal();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
